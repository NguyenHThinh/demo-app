import type {
  AbandonInputs,
  DCFSummary,
  BinomialLatticeResult,
  AbandonSummary,
} from '../types';
import { calculateRealOptionFactors, buildForwardTree } from './rov-common';

/**
 * Resolves the effective volatility from the various input sources.
 */
function resolveVolatility(inputs: AbandonInputs, calculatedVolatility: number | null): number {
  switch (inputs.volatilitySource) {
    case 'Calculation':
      return calculatedVolatility ?? 0;
    case 'Dropdown Selection':
      return inputs.volatilityDropdown;
    case 'Enter Value':
      return inputs.volatilityEnterValue;
  }
}

/**
 * Calculates the Option to Abandon using a binomial lattice model.
 *
 * Excel Rev.2 (`Master Option to Abandon (1)`):
 * - Row 119: PV of Dividend = V₀ / assetLife × dt (per active interval column)
 * - E147: adjusted asset PV = V₀ − SUM(row 119) = V₀ − pvDividend × intervals
 * - Asset forward tree uses adjusted V₀ (F146 = E147×u, F148 = E147×d, …)
 * - Terminal (e.g. E148): MAX(recovery − asset + expense + additional, 0)
 * - Backward: MAX((pu·C_up + pd·C_down) / (1+r)^dt + recovery + additional, 0) with recovery/additional = 0 off-terminal
 *
 * @param inputs - Abandon option configuration
 * @param dcfSummary - DCF output (null when using manual PV data)
 * @param calculatedVolatility - Volatility derived from scenario analysis (null when not applicable)
 * @param assetLife - Economic life of the underlying asset in years (D88 / manual asset life)
 */
export function calculateOptionToAbandon(
  inputs: AbandonInputs,
  dcfSummary: DCFSummary | null,
  calculatedVolatility: number | null,
  assetLife: number,
): { lattice: BinomialLatticeResult; summary: AbandonSummary } {
  const v0 =
    inputs.assetSource === 'Use DCF Output' && dcfSummary ? dcfSummary.v0 : inputs.manualV0;
  const investment =
    inputs.assetSource === 'Use DCF Output' && dcfSummary ? dcfSummary.investment : inputs.manualI;
  const volatility = resolveVolatility(inputs, calculatedVolatility);

  const factors = calculateRealOptionFactors(
    volatility,
    inputs.riskFreeRate,
    inputs.timeStep,
    inputs.optionExercise,
  );
  const { dt, intervals, discreteDiscountFactor, pu, pd } = factors;
  const disc = discreteDiscountFactor; // 1 + r·dt — FV recovery (1+D92*D98)^t
  const periodOptionDiscount = Math.pow(1 + inputs.riskFreeRate, dt); // (1+r)^dt backward step

  const lifeYears = Math.max(1, assetLife);
  const pvDividend = v0 > 0 ? (v0 / lifeYears) * dt : 0;
  const adjustedV0 = v0 - pvDividend * intervals;

  const assetValues = buildForwardTree(adjustedV0, factors);

  const recoveryAtT: number[] = [];
  const expenseAtT: number[] = [];
  const netRecoveryAtT: number[] = [];
  for (let t = 0; t <= intervals; t++) {
    const gross =
      t === intervals
        ? inputs.recoveryType === 'Future Value'
          ? inputs.abandonRecovery * Math.pow(disc, intervals)
          : inputs.abandonRecovery
        : 0;
    const exp = t === intervals ? inputs.abandonCost : 0;
    recoveryAtT.push(gross);
    expenseAtT.push(exp);
    netRecoveryAtT.push(gross - exp);
  }

  const terminalRecovery = recoveryAtT[intervals];
  const terminalExpense = expenseAtT[intervals];

  const optionValues: number[][] = [];
  for (let t = 0; t <= intervals; t++) {
    optionValues.push(new Array(t + 1).fill(0));
  }

  // Terminal: MAX(recovery − asset + (−expense), 0) — Excel rows 117–118 at column = intervals
  for (let j = 0; j <= intervals; j++) {
    optionValues[intervals][j] = Math.max(
      terminalRecovery - assetValues[intervals][j] - terminalExpense,
      0,
    );
  }

  for (let t = intervals - 1; t >= 0; t--) {
    for (let j = 0; j <= t; j++) {
      const continuation =
        (pu * optionValues[t + 1][j] + pd * optionValues[t + 1][j + 1]) / periodOptionDiscount;
      optionValues[t][j] = Math.max(continuation, 0);
    }
  }

  const baseNPV = v0 - investment;
  const optionValue = optionValues[0][0];
  const expandedNPV = baseNPV + optionValue;
  const baseROI = baseNPV / investment;
  const rovROI = expandedNPV / investment;
  const baseMIRR =
    inputs.assetSource === 'Use DCF Output' &&
    dcfSummary &&
    !inputs.includePerpetGgity
      ? dcfSummary.mirr
      : null;

  return {
    lattice: {
      assetValues,
      optionValues,
      factors,
      abandonDisplay: {
        recoveryType: inputs.recoveryType,
        recoveryAtT,
        expenseAtT,
        netRecoveryAtT,
        pvDividend,
        adjustedV0,
      },
    },
    summary: {
      v0,
      investment,
      volatility,
      baseNPV,
      baseMIRR,
      optionValue,
      expandedNPV,
      baseROI,
      rovROI,
    },
  };
}

import type {
  DelayInputs,
  DCFSummary,
  BinomialLatticeResult,
  DelaySummary,
} from '../types';
import { calculateRealOptionFactors, buildForwardTree } from './rov-common';

/**
 * Resolves the effective volatility from the various input sources.
 */
function resolveVolatility(inputs: DelayInputs, calculatedVolatility: number | null): number {
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
 * Calculates the Option to Delay using a binomial lattice model.
 *
 * @param inputs - Delay option configuration
 * @param dcfSummary - DCF output (null when using manual PV data)
 * @param calculatedVolatility - Volatility derived from scenario analysis (null when not applicable)
 * @param assetLife - Economic life of the underlying asset in years (used for cost-of-delay calculation)
 */
export function calculateOptionToDelay(
  inputs: DelayInputs,
  dcfSummary: DCFSummary | null,
  calculatedVolatility: number | null,
  assetLife: number,
): { lattice: BinomialLatticeResult; summary: DelaySummary } {
  // --- Resolve V0, I, and volatility ---
  const v0 =
    inputs.assetSource === 'Use DCF Output' && dcfSummary ? dcfSummary.v0 : inputs.manualV0;
  const investment =
    inputs.assetSource === 'Use DCF Output' && dcfSummary ? dcfSummary.investment : inputs.manualI;
  const volatility = resolveVolatility(inputs, calculatedVolatility);

  // --- Lattice factors ---
  const factors = calculateRealOptionFactors(
    volatility,
    inputs.riskFreeRate,
    inputs.timeStep,
    inputs.optionExercise,
  );
  const { dt, intervals, intervalRiskFreeRate, discreteDiscountFactor, pu, pd } = factors;

  // --- Forward (asset) tree ---
  const assetValues = buildForwardTree(v0, factors);

  // --- Pre-compute per-interval cost of delay and strike ---
  const delayCosts: number[] = new Array(intervals + 1).fill(0);
  const strikes: number[] = new Array(intervals + 1).fill(0);
  // PV of Delay Cost = V₀ / assetLife * dt (constant positive value for display)
  const pvDelayCost = inputs.includeCostOfDelay ? (v0 / assetLife) * dt : 0;

  if (inputs.includeCostOfDelay) {
    for (let t = 1; t <= intervals; t++) {
      delayCosts[t] = -pvDelayCost * Math.pow(1 + intervalRiskFreeRate, t);
    }
  }

  // Strike only applies at the terminal step
  if (inputs.includeFVStrike) {
    strikes[intervals] = -investment * Math.pow(1 + intervalRiskFreeRate, intervals);
  } else {
    strikes[intervals] = -investment;
  }

  // --- Option value tree (backward induction) ---
  const optionValues: number[][] = [];
  for (let t = 0; t <= intervals; t++) {
    optionValues.push(new Array(t + 1).fill(0));
  }

  // Terminal nodes
  for (let j = 0; j <= intervals; j++) {
    optionValues[intervals][j] = Math.max(
      assetValues[intervals][j] + strikes[intervals] + delayCosts[intervals],
      0,
    );
  }

  // Backward induction
  for (let t = intervals - 1; t >= 0; t--) {
    for (let j = 0; j <= t; j++) {
      const continuation =
        (pu * optionValues[t + 1][j] + pd * optionValues[t + 1][j + 1]) /
        discreteDiscountFactor;
      optionValues[t][j] = Math.max(continuation + strikes[t] + delayCosts[t], 0);
    }
  }

  // --- Summary metrics ---
  const baseNPV = v0 - investment;
  const optionValue = optionValues[0][0];
  const expandedNPV = baseNPV + optionValue;
  const baseROI = baseNPV / investment;
  const rovROI = expandedNPV / investment;
  // Base MIRR: Use DCF Output + Include Perpetuity = No (!includePerpetGgity).
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
      strikes,
      delayCosts,
      pvDelayCost,
      optionExercise: inputs.optionExercise,
      dt,
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

import type {
  ExpandInputs,
  DCFSummary,
  DCFResult,
  BinomialLatticeResult,
  ExpandSummary,
} from '../types';
import { getExpandCurrentVIFromOriginalDCFGrid } from './dcf-engine';
import { calculateRealOptionFactors, buildForwardTree } from './rov-common';

/**
 * Resolves the effective volatility from the various input sources.
 */
function resolveVolatility(inputs: ExpandInputs, calculatedVolatility: number | null): number {
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
 * Calculates the Option to Expand using a binomial lattice model.
 *
 * @param inputs - Expand option configuration
 * @param originalDCFResult - Full DCF for Master - Option to Expand (1); used for current V/I like xlsm D88/D89 (null when manual / missing)
 * @param expansionDCFSummary - DCF output for the expansion project (null when manual)
 * @param calculatedVolatility - Volatility derived from scenario analysis (null when not applicable)
 * @param expansionAssetLife - Economic life of the expansion asset (years), for cost-of-delay rows — same role as Delay’s assetLife
 */
export function calculateOptionToExpand(
  inputs: ExpandInputs,
  originalDCFResult: DCFResult | null,
  expansionDCFSummary: DCFSummary | null,
  calculatedVolatility: number | null,
  expansionAssetLife: number,
): { lattice: BinomialLatticeResult; summary: ExpandSummary } {
  // --- Resolve current project values (xlsm Expand (2) D88/D89 → row 58/59 sums on Expand (1)) ---
  const fromOriginalGrid =
    inputs.currentSource === 'Use DCF Output' && originalDCFResult
      ? getExpandCurrentVIFromOriginalDCFGrid(originalDCFResult)
      : null;
  const v0Current = fromOriginalGrid != null ? fromOriginalGrid.v0 : inputs.manualV0Current;
  const iCurrent =
    fromOriginalGrid != null ? fromOriginalGrid.investment : inputs.manualICurrent;

  // --- Resolve expansion project values ---
  const v0Expansion =
    inputs.expansionSource === 'Use DCF Output' && expansionDCFSummary
      ? expansionDCFSummary.v0
      : inputs.manualV0Expansion;
  const iExpansion =
    inputs.expansionSource === 'Use DCF Output' && expansionDCFSummary
      ? expansionDCFSummary.investment
      : inputs.manualIExpansion;

  const volatility = resolveVolatility(inputs, calculatedVolatility);

  // --- Lattice factors ---
  const factors = calculateRealOptionFactors(
    volatility,
    inputs.riskFreeRate,
    inputs.timeStep,
    inputs.optionExercise,
  );
  const { intervals, intervalRiskFreeRate, pu, pd, dt } = factors;
  // Excel "Master Option to Expand (2)": MAX((pu*Vu+pd*Vd)/(1+r)^dt + strike + delay + additional, 0)
  // — not division by (1+r*dt); matches Abandon `periodOptionDiscount`.
  const periodOptionDiscount = Math.pow(1 + inputs.riskFreeRate, dt);

  // --- Forward tree on the expansion project V0 ---
  const assetValues = buildForwardTree(v0Expansion, factors);

  // --- Strike: -Ie at terminal only (Excel row 125; D109 Yes/No) ---
  const strikes: number[] = new Array(intervals + 1).fill(0);
  if (inputs.includeFVStrike) {
    strikes[intervals] = -iExpansion * Math.pow(1 + intervalRiskFreeRate, intervals);
  } else {
    strikes[intervals] = -iExpansion;
  }

  // --- Cost of delay (same structure as calculateOptionToDelay; underlying = expansion V₀) ---
  const delayCosts: number[] = new Array(intervals + 1).fill(0);
  const baseNPV = v0Current - iCurrent;
  const pvDelayCost =
    inputs.includeCostOfDelay && v0Expansion > 0 && expansionAssetLife > 0
      ? (v0Expansion / expansionAssetLife) * factors.dt
      : 0;
  if (inputs.includeCostOfDelay && pvDelayCost !== 0) {
    for (let t = 1; t <= intervals; t++) {
      delayCosts[t] = -pvDelayCost * Math.pow(1 + intervalRiskFreeRate, t);
    }
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

  // Backward induction (match Delay: add delayCosts[t] each step, not baseNPV/intervals on strike)
  for (let t = intervals - 1; t >= 0; t--) {
    for (let j = 0; j <= t; j++) {
      const continuation =
        (pu * optionValues[t + 1][j] + pd * optionValues[t + 1][j + 1]) /
        periodOptionDiscount;
      optionValues[t][j] = Math.max(
        continuation + strikes[t] + delayCosts[t],
        0,
      );
    }
  }

  // --- Summary metrics ---
  const optionValue = optionValues[0][0];
  const expandedNPV = baseNPV + optionValue;
  const baseROI = baseNPV / iCurrent;
  const totalInvestment = iCurrent + iExpansion;
  const rovROI = totalInvestment !== 0 ? expandedNPV / totalInvestment : 0;
  // Expand (2) MIRR = Expansion DCF summary.mirr. N/A when (Expansion "Asset & Investment" = Use DCF Output) AND (Include Perpetuity = Yes on that DCF). Otherwise null if not using expansion DCF.
  const expansionUsesDcf = inputs.currentSource === 'Use DCF Output';
  const expansionIncludePerpetuityYes = inputs.includePerpetGgity; // merged from expand(2) Expansion DCF in store
  const expansionMirrIsNA = expansionUsesDcf && expansionIncludePerpetuityYes;
  const baseMIRR =
    expansionUsesDcf && expansionDCFSummary && !expansionMirrIsNA
      ? expansionDCFSummary.mirr
      : null;

  return {
    lattice: {
      assetValues,
      optionValues,
      factors,
      strikes,
      delayCosts: inputs.includeCostOfDelay ? delayCosts : undefined,
      pvDelayCost: inputs.includeCostOfDelay ? pvDelayCost : undefined,
      optionExercise: inputs.optionExercise,
      dt: factors.dt,
    },
    summary: {
      v0Current,
      iCurrent,
      v0Expansion,
      iExpansion,
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

// ============ DCF Input Types ============

export type DepreciationMethod = 'SLM' | 'DDB' | 'SYD';
export type FinancialOutcome = 'Revenue' | 'Cost Savings';
export type PerpetualityType = 'Growing' | 'Constant';
export type TimeStep = 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
export type VolatilitySource = 'Calculation' | 'Dropdown Selection' | 'Enter Value';
export type AssetSource = 'Use DCF Output' | 'Enter Data';
export type AbandonRecoveryType = 'Fixed Value' | 'Future Value';
export type ReinvestmentRateSource = 'Risk Free Rate' | 'WACC' | 'Other';

export interface CapitalProfile {
  capexYears: number;
  assetLife: number;
  depreciationMethod: DepreciationMethod;
  residualValue: number;
  nonDepreciatingAsset: number;
  /** When true, CAPEX already includes nonDepreciatingAsset — skip negative recovery at year 0 */
  capexIncludesNonDepreciating?: boolean;
  /** When true, add one extra year column after asset life (Expand sheet pattern) */
  hasExtraYear?: boolean;
  /** Override the computed depreciable base (e.g. XLSM Abandon "Total Assets to Depreciate") */
  depreciableOverride?: number;
}

export interface FinancialMetrics {
  financialOutcome: FinancialOutcome;
  wacc: number;
  reinvestmentRate: number;
  taxRate: number;
  includePerpetGgity: boolean;
  perpetuityType: PerpetualityType;
  perpetuityGrowthRate: number;
  // Expand-specific: reinvestment rate source selector
  reinvestmentRateSource?: ReinvestmentRateSource;
  reinvestmentRiskFreeRate?: number;
  reinvestmentOtherRate?: number;
}

export interface WorkingCapital {
  percentCollected: number;
  percentCostPaid: number;
}

export interface YearlyCashFlowInput {
  capex: number[];
  revenue: number[];
  costOfSales: number[];
  opex: number[];
}

export interface DCFInputs {
  capitalProfile: CapitalProfile;
  financialMetrics: FinancialMetrics;
  workingCapital: WorkingCapital;
  yearlyCashFlow: YearlyCashFlowInput;
  isDelayDCF?: boolean;
}

// ============ DCF Computed Types ============

export interface DCFYearResult {
  pvYear: number;
  assetYear: number;
  waccDiscountFactor: number;
  reinvestmentDiscountFactor: number;
  capex: number;
  assetRecovery: number;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  opex: number;
  operatingCashFlows: number;
  payables: number;
  receivables: number;
  changeInNetWorkingCapital: number;
  netCashFlows: number;
  netCashFlowPV: number;
  depreciation: number;
  cumulativeDepreciation: number;
  beginningBookValue: number;
  totalOperatingProfits: number;
  corporationTax: number;
  postTaxCashflow: number;
  postTaxCashflowPositive: number;
  postTaxCashflowNegative: number;
  taxPresentValue: number;
  reinvestmentTerminalValue: number;
  mirrPresentValue: number;
  postTaxNonInvestmentCashflowPV: number;
  investmentsPV: number;
}

export interface DCFSummary {
  npv: number;
  v0: number;
  investment: number;
  baseNPV: number;
  mirr: number | null;
  baseROI: number;
}

export interface DCFResult {
  yearResults: DCFYearResult[];
  summary: DCFSummary;
}

// ============ Volatility Types ============

export interface VolatilityInputs {
  base: number;
  downside: number;
  upside: number;
}

// ============ ROV Common Types ============

export interface RealOptionFactors {
  dt: number;
  intervals: number;
  intervalRiskFreeRate: number;
  discountFactor: number; // e^(r*dt) — used for pu calculation
  discreteDiscountFactor: number; // 1 + r*dt — used for backward induction discounting
  u: number;
  d: number;
  pu: number;
  pd: number;
}

/** Per-interval display rows for Master Option to Abandon (Excel binomial block). */
export interface AbandonLatticeDisplay {
  recoveryType: AbandonRecoveryType;
  /** Gross recovery shown at time column t = 0..N (FV path when Future Value). */
  recoveryAtT: number[];
  /** Abandonment expense Ae (stored positive, shown as negative in UI); same length as recoveryAtT. */
  expenseAtT: number[];
  /** Excel-style net: recoveryAtT[t] − expenseAtT[t]. */
  netRecoveryAtT: number[];
  /** PV of dividend per interval: V₀ / assetLife × dt (Excel row 119). */
  pvDividend: number;
  /** V₀ minus Σ row-119 dividend PVs (Excel E147). */
  adjustedV0: number;
}

export interface BinomialLatticeResult {
  assetValues: number[][];
  optionValues: number[][];
  factors: RealOptionFactors;
  // Delay-specific metadata for binomial tree display
  strikes?: number[];
  delayCosts?: number[];
  pvDelayCost?: number; // V₀ / assetLife * dt (constant, positive)
  optionExercise?: number;
  dt?: number;
  /** Present only for Option to Abandon — drives abandon-specific binomial UI. */
  abandonDisplay?: AbandonLatticeDisplay;
}

// ============ Option to Delay ============

export interface DelayInputs {
  volatilitySource: VolatilitySource;
  volatilityDropdown: number;
  selectedIndustry: string | null;
  volatilityEnterValue: number;
  assetSource: AssetSource;
  manualV0: number;
  manualI: number;
  manualAssetLife: number;
  includePerpetGgity: boolean;
  optionExercise: number;
  timeStep: TimeStep;
  riskFreeRate: number;
  includeCostOfDelay: boolean;
  includeFVStrike: boolean;
}

export interface DelaySummary {
  v0: number;
  investment: number;
  volatility: number;
  baseNPV: number;
  baseMIRR: number | null;
  optionValue: number;
  expandedNPV: number;
  baseROI: number;
  rovROI: number;
}

// ============ Option to Expand ============

export interface ExpandInputs {
  volatilitySource: VolatilitySource;
  volatilityDropdown: number;
  selectedIndustry: string | null;
  volatilityEnterValue: number;
  currentSource: AssetSource;
  manualV0Current: number;
  manualICurrent: number;
  expansionSource: AssetSource;
  manualV0Expansion: number;
  manualIExpansion: number;
  manualExpansionAssetLife: number;
  includePerpetGgity: boolean;
  optionExercise: number;
  timeStep: TimeStep;
  riskFreeRate: number;
  /** Include cost of delay (lost income) like Delay option? */
  includeCostOfDelay: boolean;
  /** Future value of expansion investment Ie at exercise (Excel row 109 / 125). */
  includeFVStrike: boolean;
}

export interface ExpandSummary {
  v0Current: number;
  iCurrent: number;
  v0Expansion: number;
  iExpansion: number;
  volatility: number;
  baseNPV: number;
  /** Expansion DCF MIRR (Expand 2). N/A when Asset & Investment Value (expansion) = Use DCF Output and Include Perpetuity = Yes on that DCF. */
  baseMIRR: number | null;
  optionValue: number;
  expandedNPV: number;
  baseROI: number;
  rovROI: number;
}

// ============ Option to Abandon ============

export interface AbandonInputs {
  volatilitySource: VolatilitySource;
  volatilityDropdown: number;
  selectedIndustry: string | null;
  volatilityEnterValue: number;
  assetSource: AssetSource;
  /** Mirrors DCF "Include Perpetuity" — drives base MIRR eligibility (Excel: only when No). */
  includePerpetGgity: boolean;
  manualV0: number;
  manualI: number;
  manualAssetLife: number;
  abandonRecovery: number;
  abandonCost: number;
  optionExercise: number;
  timeStep: TimeStep;
  riskFreeRate: number;
  recoveryType: AbandonRecoveryType;
}

export interface AbandonSummary {
  v0: number;
  investment: number;
  volatility: number;
  baseNPV: number;
  baseMIRR: number | null;
  optionValue: number;
  expandedNPV: number;
  baseROI: number;
  rovROI: number;
}

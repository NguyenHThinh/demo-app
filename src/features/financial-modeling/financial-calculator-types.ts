import type { FinancialOutcome } from "./types";

/** Summary row metrics for the calculator valuation panel (delay / expand / abandon). */
export type ResultSummary = {
  baseNPV: number;
  mirr: number | null;
  optionValue: number | null;
  expandedNPV: number | null;
  baseROI: number | null;
  rovROI: number | null;
  v0: number | null;
  investment: number | null;
  v0Current: number | null;
  investmentCurrent: number | null;
  v0Expansion: number | null;
  investmentExpansion: number | null;
  npv: number | null;
};

/** Project / wizard: financial evaluation method (persisted on project). */
export type CalculatorResultsMode = "npv" | "rov" | "both";

export type CalculatorHostDefaults = {
  financialOutcome?: FinancialOutcome;
  assetLife?: number;
  includePerpetuity?: boolean;
};

/**
 * Snapshot of computed financial results emitted by the calculator's
 * `Export Results` button. Hosts (e.g. Create Project Wizard, Project Detail)
 * use this to populate read-only project fields and (where applicable) sync
 * the project's `mainExpectedOutcome` from `financialOutcome`.
 */
export type ExportedFinancialResults = {
  /** Active real option case in the calculator at export time. */
  realOptionCase: "delay" | "expand" | "abandon";
  /** Asset life in years. */
  assetLife: number;
  /** Whether perpetuity is enabled. */
  includePerpetuity: boolean;
  /**
   * Annual perpetuity growth rate in percent (e.g. `2.5` for 2.5%).
   * `null` when perpetuity is off or perpetuity type is `Constant`.
   */
  perpetuityGrowthPct: number | null;
  /** Calculator's option exercise duration (years). `null` for Classic NPV (no option). */
  optionExerciseYears: number | null;
  /** Option Value of the selected real option case (£m). */
  optionValue: number | null;
  /** Base NPV (£m). */
  baseNpv: number | null;
  /** Investment Required (£m): sum of CAPEX (£m) row. */
  investmentRequired: number | null;
  /** Risk-adjusted cost of capital (%). */
  costOfCapitalPct: number;
  /** mean(yearResults[i].revenue) from DCF Sales Revenue (£m) row. Label depends on `financialOutcome`. */
  averageRevenueOrCostSaving: number | null;
  /** Determines whether the host should label the average row as Revenue or Cost Saving. */
  financialOutcome: FinancialOutcome;
  /** Present Value of CAPEX (£m), calculator summary.investment (Report L30). */
  presentValueCapex: number | null;
};

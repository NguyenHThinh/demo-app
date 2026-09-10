import type {
  ExportedFinancialResults,
  ResultSummary,
} from "@/features/financial-modeling/financial-calculator-types";
import { getExpandCurrentVIFromOriginalDCFGrid } from "@/features/financial-modeling/engines/dcf-engine";
import { resolvePresentValueCapex } from "@/features/financial-modeling/lib/export-payload-valuation";
import { deriveOverviewExportMetricsFromYearResults } from "@/features/financial-modeling/lib/derive-overview-export-metrics";
import { npvOnlyResultSummary } from "@/features/financial-modeling/lib/npv-only-summary";
import type { FinancialCasePersistedState } from "@/features/financial-modeling/lib/financial-store-snapshot";
import type { DCFResult } from "@/features/financial-modeling/types";

/** Active-tab DCF summary from a saved case — no live store / engine run. */
export function resolveResultSummaryFromPersistedCase(
  bundle: FinancialCasePersistedState,
): ResultSummary | null {
  const store = bundle.store;
  const activeTab = bundle.ui.activeTab;
  const expandSubView = bundle.ui.expandSubView;
  const isNpvTab =
    bundle.ui.activeTab === "npv" || bundle.ui.lockedCaseMode === "npv";

  if (isNpvTab) {
    const npvResult = store.npvDCFResult ?? store.delayDCFResult;
    return npvOnlyResultSummary(npvResult);
  }

  if (activeTab === "delay" && store.delaySummary) {
    return {
      baseNPV: store.delaySummary.baseNPV,
      mirr: store.delaySummary.baseMIRR,
      optionValue: store.delaySummary.optionValue,
      expandedNPV: store.delaySummary.expandedNPV,
      baseROI: store.delaySummary.baseROI,
      rovROI: store.delaySummary.rovROI,
      v0: store.delaySummary.v0,
      investment: store.delaySummary.investment,
      v0Current: null,
      investmentCurrent: null,
      v0Expansion: null,
      investmentExpansion: null,
      npv: null,
    };
  }

  if (
    activeTab === "expand" &&
    expandSubView === "original" &&
    store.expandOriginalDCFResult
  ) {
    const { v0, investment } = getExpandCurrentVIFromOriginalDCFGrid(
      store.expandOriginalDCFResult,
    );
    const baseNPV = v0 - investment;
    const baseROI = investment !== 0 ? baseNPV / investment : null;
    const originalPerp =
      store.expandOriginalDCFInputs.financialMetrics.includePerpetGgity;
    return {
      baseNPV,
      mirr: originalPerp ? null : store.expandOriginalDCFResult.summary.mirr,
      optionValue: null,
      expandedNPV: null,
      baseROI,
      rovROI: null,
      v0,
      investment,
      v0Current: null,
      investmentCurrent: null,
      v0Expansion: null,
      investmentExpansion: null,
      npv: null,
    };
  }

  if (activeTab === "expand" && expandSubView === "expansion" && store.expandSummary) {
    return {
      baseNPV: store.expandSummary.baseNPV,
      mirr: store.expandSummary.baseMIRR,
      optionValue: store.expandSummary.optionValue,
      expandedNPV: store.expandSummary.expandedNPV,
      baseROI: store.expandSummary.baseROI,
      rovROI: store.expandSummary.rovROI,
      v0: null,
      investment: null,
      v0Current: store.expandSummary.v0Current,
      investmentCurrent: store.expandSummary.iCurrent,
      v0Expansion: store.expandSummary.v0Expansion,
      investmentExpansion: store.expandSummary.iExpansion,
      npv: null,
    };
  }

  if (activeTab === "abandon" && store.abandonSummary) {
    return {
      baseNPV: store.abandonSummary.baseNPV,
      mirr: store.abandonSummary.baseMIRR,
      optionValue: store.abandonSummary.optionValue,
      expandedNPV: store.abandonSummary.expandedNPV,
      baseROI: store.abandonSummary.baseROI,
      rovROI: store.abandonSummary.rovROI,
      v0: store.abandonSummary.v0,
      investment: store.abandonSummary.investment,
      v0Current: null,
      investmentCurrent: null,
      v0Expansion: null,
      investmentExpansion: null,
      npv: null,
    };
  }

  return null;
}

/**
 * Builds the same export payload as the calculator's Export Results / Save,
 * from a persisted case snapshot (no live Zustand store required).
 */
export function buildExportPayloadFromPersistedCase(
  bundle: FinancialCasePersistedState,
): ExportedFinancialResults {
  const store = bundle.store;
  const activeTab = bundle.ui.activeTab;
  const expandSubView = bundle.ui.expandSubView;
  const isNpvTab =
    bundle.ui.activeTab === "npv" || bundle.ui.lockedCaseMode === "npv";

  const activeDcfResult: DCFResult | null = isNpvTab
    ? store.npvDCFResult ?? store.delayDCFResult
    : activeTab === "delay"
      ? store.delayDCFResult
      : activeTab === "expand"
        ? expandSubView === "original"
          ? store.expandOriginalDCFResult
          : store.expandExpansionDCFResult
        : store.abandonDCFResult;

  const activeFinancialMetrics = isNpvTab
    ? (store.npvDCFInputs ?? store.delayDCFInputs).financialMetrics
    : activeTab === "delay"
      ? store.delayDCFInputs.financialMetrics
      : activeTab === "expand"
        ? expandSubView === "original"
          ? store.expandOriginalDCFInputs.financialMetrics
          : store.expandExpansionDCFInputs.financialMetrics
        : store.abandonDCFInputs.financialMetrics;

  const activeAssetLife = isNpvTab
    ? (store.npvDCFInputs ?? store.delayDCFInputs).capitalProfile.assetLife
    : activeTab === "delay"
      ? store.delayDCFInputs.capitalProfile.assetLife
      : activeTab === "expand"
        ? expandSubView === "original"
          ? store.expandOriginalDCFInputs.capitalProfile.assetLife
          : store.expandExpansionDCFInputs.capitalProfile.assetLife
        : store.abandonDCFInputs.capitalProfile.assetLife;

  const optionExerciseYears = isNpvTab
    ? null
    : activeTab === "delay"
      ? store.delayInputs.optionExercise
      : activeTab === "expand"
        ? store.expandInputs.optionExercise
        : store.abandonInputs.optionExercise;

  const optionValue = isNpvTab
    ? null
    : activeTab === "delay"
      ? store.delaySummary?.optionValue ?? null
      : activeTab === "expand"
        ? store.expandSummary?.optionValue ?? null
        : store.abandonSummary?.optionValue ?? null;

  const activeSummary = resolveResultSummaryFromPersistedCase(bundle);

  const baseNpv = isNpvTab
    ? activeDcfResult?.summary.baseNPV ?? null
    : activeSummary?.baseNPV ?? null;

  const { investmentRequired, averageRevenueOrCostSaving } =
    deriveOverviewExportMetricsFromYearResults(
      activeDcfResult?.yearResults ?? [],
      activeAssetLife,
    );

  return {
    realOptionCase:
      activeTab === "npv" ? "delay" : activeTab,
    assetLife: activeAssetLife,
    includePerpetuity: activeFinancialMetrics.includePerpetGgity,
    perpetuityGrowthPct:
      activeFinancialMetrics.includePerpetGgity &&
      activeFinancialMetrics.perpetuityType === "Growing"
        ? activeFinancialMetrics.perpetuityGrowthRate * 100
        : null,
    optionExerciseYears,
    optionValue,
    baseNpv,
    investmentRequired,
    costOfCapitalPct: activeFinancialMetrics.wacc * 100,
    averageRevenueOrCostSaving,
    financialOutcome: activeFinancialMetrics.financialOutcome,
    presentValueCapex: resolvePresentValueCapex(activeSummary),
  };
}

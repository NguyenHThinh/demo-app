import type { StoreApi } from "zustand";
import type {
  ExportedFinancialResults,
  ResultSummary,
} from "@/features/financial-modeling/financial-calculator-types";
import type { DCFResult } from "@/features/financial-modeling/types";
import {
  extractFinancialStoreSnapshot,
  type FinancialCasePersistedState,
} from "@/features/financial-modeling/lib/financial-store-snapshot";
import { resolvePresentValueCapex } from "@/features/financial-modeling/lib/export-payload-valuation";
import { deriveOverviewExportMetricsFromYearResults } from "@/features/financial-modeling/lib/derive-overview-export-metrics";
import type { FinancialStore } from "@/features/financial-modeling/stores/financial-store";
import type { CalculatorActiveTab } from "@/features/financial-modeling/lib/calculator-case-mode";

export function buildFinancialCaseSavePayload(
  store: FinancialStore,
  storeApi: StoreApi<FinancialStore>,
  activeTab: CalculatorActiveTab,
  expandSubView: "original" | "expansion",
  activeSummary: ResultSummary | null,
): {
  bundle: FinancialCasePersistedState;
  exportPayload: ExportedFinancialResults;
} {
  const isNpvTab = activeTab === "npv";

  const activeDcfResult: DCFResult | null = isNpvTab
    ? store.npvDCFResult
    : activeTab === "delay"
      ? store.delayDCFResult
      : activeTab === "expand"
        ? expandSubView === "original"
          ? store.expandOriginalDCFResult
          : store.expandExpansionDCFResult
        : store.abandonDCFResult;
  const activeFinancialMetrics = isNpvTab
    ? store.npvDCFInputs.financialMetrics
    : activeTab === "delay"
      ? store.delayDCFInputs.financialMetrics
      : activeTab === "expand"
        ? expandSubView === "original"
          ? store.expandOriginalDCFInputs.financialMetrics
          : store.expandExpansionDCFInputs.financialMetrics
        : store.abandonDCFInputs.financialMetrics;
  const activeAssetLife = isNpvTab
    ? store.npvDCFInputs.capitalProfile.assetLife
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
  const baseNpv = isNpvTab
    ? store.npvDCFResult?.summary.baseNPV ?? null
    : activeTab === "delay"
      ? store.delaySummary?.baseNPV ?? null
      : activeTab === "expand"
        ? expandSubView === "original"
          ? activeSummary?.baseNPV ?? null
          : store.expandSummary?.baseNPV ?? null
        : store.abandonSummary?.baseNPV ?? null;
  const { investmentRequired, averageRevenueOrCostSaving } =
    deriveOverviewExportMetricsFromYearResults(
      activeDcfResult?.yearResults ?? [],
      activeAssetLife,
    );

  const bundle: FinancialCasePersistedState = {
    v: 1,
    store: extractFinancialStoreSnapshot(storeApi.getState()),
    ui: { activeTab, expandSubView },
  };

  const exportPayload: ExportedFinancialResults = {
    realOptionCase: isNpvTab ? "delay" : activeTab,
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

  return { bundle, exportPayload };
}

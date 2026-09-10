import type { FinancialCasePersistedState } from "@/features/financial-modeling/lib/financial-store-snapshot";

function fmtM(v: number | null | undefined): string | null {
  if (v == null || Number.isNaN(v)) return null;
  return `${v.toFixed(2)}m`;
}

type SummarySlice = {
  baseNPV?: number | null;
  optionValue?: number | null;
  expandedNPV?: number | null;
};

function formatThreeMetricLine(slice: SummarySlice): string | null {
  const base = fmtM(slice.baseNPV);
  const option = fmtM(slice.optionValue);
  const expandedRaw =
    slice.expandedNPV != null && !Number.isNaN(slice.expandedNPV)
      ? slice.expandedNPV
      : slice.baseNPV != null &&
          slice.optionValue != null &&
          !Number.isNaN(slice.baseNPV) &&
          !Number.isNaN(slice.optionValue)
        ? slice.baseNPV + slice.optionValue
        : null;
  const expanded = fmtM(expandedRaw);

  const parts: string[] = [];
  if (base) parts.push(`Base NPV £${base}`);
  if (option) parts.push(`Option Value £${option}`);
  if (expanded) parts.push(`Expanded NPV £${expanded}`);

  return parts.length > 0 ? parts.join(" · ") : null;
}

/** One-line summary under the case name (NPV / option / expanded for the tab being saved). */
export function summarizeFinancialCasePersisted(
  bundle: FinancialCasePersistedState,
): string | null {
  if (bundle.ui.lockedCaseMode === "npv" || bundle.ui.activeTab === "npv") {
    const baseNpv =
      bundle.store.npvDCFResult?.summary.baseNPV ??
      bundle.store.delayDCFResult?.summary.baseNPV;
    const base = fmtM(baseNpv);
    return base ? `Base NPV £${base}` : null;
  }
  const tab = bundle.ui.activeTab;
  const s = bundle.store;
  if (tab === "delay" && s.delaySummary) {
    return formatThreeMetricLine(s.delaySummary);
  }
  if (tab === "expand" && s.expandSummary) {
    return formatThreeMetricLine(s.expandSummary);
  }
  if (tab === "abandon" && s.abandonSummary) {
    return formatThreeMetricLine(s.abandonSummary);
  }
  return null;
}

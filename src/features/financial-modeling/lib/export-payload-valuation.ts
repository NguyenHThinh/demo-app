import type { ResultSummary } from "@/features/financial-modeling/financial-calculator-types";

/** Present Value of CAPEX (£m), calculator summary.investment (Report L30). */
export function resolvePresentValueCapex(summary: ResultSummary | null): number | null {
  if (!summary) return null;
  if (summary.investment != null && !Number.isNaN(summary.investment)) {
    return summary.investment;
  }
  if (summary.investmentCurrent == null && summary.investmentExpansion == null) {
    return null;
  }
  return (summary.investmentCurrent ?? 0) + (summary.investmentExpansion ?? 0);
}

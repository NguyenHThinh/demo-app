import type { DCFYearResult } from "@/features/financial-modeling/types";

/**
 * Overview / projectExport metrics derived from the active DCF grid.
 * - Investment Required: sum of CAPEX (£m) row (same sign as grid values).
 * - Average Revenue/Cost Saving: sum(Sales Revenue (£m)) / asset life.
 */
export function deriveOverviewExportMetricsFromYearResults(
  yearResults: DCFYearResult[],
  assetLife: number,
): {
  investmentRequired: number | null;
  averageRevenueOrCostSaving: number | null;
} {
  if (yearResults.length === 0) {
    return { investmentRequired: null, averageRevenueOrCostSaving: null };
  }

  const investmentRequired = yearResults.reduce((sum, row) => sum + row.capex, 0);

  const safeAssetLife = Number.isFinite(assetLife) && assetLife > 0 ? assetLife : 1;
  const salesRevenueTotal = yearResults.reduce((sum, row) => sum + row.revenue, 0);
  const averageRevenueOrCostSaving = salesRevenueTotal / safeAssetLife;

  return { investmentRequired, averageRevenueOrCostSaving };
}

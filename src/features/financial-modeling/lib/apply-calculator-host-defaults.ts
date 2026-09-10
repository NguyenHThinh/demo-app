import type { StoreApi } from "zustand";
import type { DCFInputs } from "../types";
import type { FinancialStore } from "../stores/financial-store";
import type { CalculatorHostDefaults } from "../financial-calculator-types";

/** Apply wizard / host snapshot to Delay + Expand + Abandon DCF slices. */
export function applyHostDefaultsToFinancialStore(
  store: StoreApi<FinancialStore>,
  defaults: CalculatorHostDefaults,
): void {
  const {
    updateNpvFinancialMetrics,
    updateNpvCapitalProfile,
    updateDelayFinancialMetrics,
    updateDelayCapitalProfile,
    updateExpandOriginalFinancialMetrics,
    updateExpandOriginalCapitalProfile,
    updateExpandExpansionFinancialMetrics,
    updateExpandExpansionCapitalProfile,
    updateAbandonFinancialMetrics,
    updateAbandonCapitalProfile,
  } = store.getState();
  const metrics: Partial<DCFInputs["financialMetrics"]> = {};
  if (defaults.financialOutcome != null) {
    metrics.financialOutcome = defaults.financialOutcome;
  }
  if (defaults.includePerpetuity != null) {
    metrics.includePerpetGgity = defaults.includePerpetuity;
  }
  if (Object.keys(metrics).length > 0) {
    updateNpvFinancialMetrics(metrics);
    updateDelayFinancialMetrics(metrics);
    updateExpandOriginalFinancialMetrics(metrics);
    updateExpandExpansionFinancialMetrics(metrics);
    updateAbandonFinancialMetrics(metrics);
  }
  if (defaults.assetLife != null) {
    updateNpvCapitalProfile({ assetLife: defaults.assetLife });
    updateDelayCapitalProfile({ assetLife: defaults.assetLife });
    updateExpandOriginalCapitalProfile({ assetLife: defaults.assetLife });
    updateExpandExpansionCapitalProfile({ assetLife: defaults.assetLife });
    updateAbandonCapitalProfile({ assetLife: defaults.assetLife });
  }
}

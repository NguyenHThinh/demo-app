"use client";

import { useFinancialStore } from "../stores/financial-store-context";
import { DCFFormSection } from "./DCFFormSection";

/** DCF-only tab aligned with Excel sheet "Master - NPV Only" (no ROV). */
export function NpvOnlyTab() {
  const store = useFinancialStore();

  return (
    <DCFFormSection
      dcfInputs={store.npvDCFInputs}
      dcfResult={store.npvDCFResult}
      onUpdateCapitalProfile={store.updateNpvCapitalProfile}
      onUpdateFinancialMetrics={store.updateNpvFinancialMetrics}
      onUpdateWorkingCapital={store.updateNpvWorkingCapital}
      onUpdateYearlyCashFlow={store.updateNpvYearlyCashFlow}
      onUpdateVolatilityInputs={() => {}}
    />
  );
}

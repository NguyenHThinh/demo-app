"use client";

import { useMemo } from "react";
import "./calculator.css";
import { FinancialStoreProvider } from "./stores/financial-store-context";
import {
  bootstrapFinancialStore,
  createFinancialStore,
} from "./stores/financial-store";
import { applyHostDefaultsToFinancialStore } from "./lib/apply-calculator-host-defaults";
import {
  applyFinancialStoreSnapshot,
  type FinancialCasePersistedState,
} from "./lib/financial-store-snapshot";
import type {
  CalculatorHostDefaults,
  ExportedFinancialResults,
} from "./financial-calculator-types";
import type { CalculatorCaseMode, CalculatorActiveTab } from "./lib/calculator-case-mode";
import { calculatorCaseModeToActiveTab } from "./lib/calculator-case-mode";
import { FinancialCalculatorView } from "./financial-calculator-view";

export function FinancialCalculatorModule({
  embedMode = false,
  hostDefaults = null,
  initialTab = "npv",
  lockedCaseMode = null,
  persistedBundle = null,
  onExportResults,
  onRequestSaveFinancialCase,
  exportResultsVisible,
  saveFinancialCaseVisible,
  saveFinancialCasePending,
  pinActionsToDialogBottom = false,
}: {
  embedMode?: boolean;
  hostDefaults?: CalculatorHostDefaults | null;
  initialTab?: CalculatorActiveTab;
  lockedCaseMode?: CalculatorCaseMode | null;
  /** When set, hydrates the store from a saved financial case. */
  persistedBundle?: FinancialCasePersistedState | null;
  onExportResults?: (
    payload: ExportedFinancialResults,
    bundle: FinancialCasePersistedState,
  ) => void | Promise<void>;
  onRequestSaveFinancialCase?: (
    bundle: FinancialCasePersistedState,
    exportPayload: ExportedFinancialResults,
  ) => void | Promise<void>;
  /** Pass `false` to hide Export Results (e.g. read-only). Shown only if `onExportResults` is a function. */
  exportResultsVisible?: boolean;
  /** Pass `false` to hide Save. Shown only if `onRequestSaveFinancialCase` is a function. */
  saveFinancialCaseVisible?: boolean;
  saveFinancialCasePending?: boolean;
  /**
   * Dialog host: pin Save/Export to the dialog bottom with CSS
   * (`fixed` inside transformed DialogContent + content padding).
   */
  pinActionsToDialogBottom?: boolean;
}) {
  // Seed from hostDefaults only on first mount; do not recreate when project fields update after export.
  const store = useMemo(() => {
    const api = createFinancialStore();
    if (persistedBundle?.store) {
      applyFinancialStoreSnapshot(api, persistedBundle.store, persistedBundle.ui);
    } else {
      bootstrapFinancialStore(api);
      if (hostDefaults != null) {
        const hasPatch =
          hostDefaults.financialOutcome != null ||
          hostDefaults.assetLife != null ||
          hostDefaults.includePerpetuity != null;
        if (hasPatch) applyHostDefaultsToFinancialStore(api, hostDefaults);
      }
    }
    return api;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hostDefaults seed once per case open
  }, [persistedBundle]);

  const effectiveInitialTab = lockedCaseMode
    ? calculatorCaseModeToActiveTab(lockedCaseMode)
    : persistedBundle?.ui.lockedCaseMode
      ? calculatorCaseModeToActiveTab(persistedBundle.ui.lockedCaseMode)
      : (persistedBundle?.ui.activeTab ?? initialTab);
  const effectiveInitialExpandSubView =
    persistedBundle?.ui.expandSubView ?? "original";

  const effectiveLockedCaseMode =
    lockedCaseMode ??
    persistedBundle?.ui.lockedCaseMode ??
    null;

  return (
    <FinancialStoreProvider store={store}>
      <FinancialCalculatorView
        embedMode={embedMode}
        initialTab={effectiveInitialTab}
        initialExpandSubView={effectiveInitialExpandSubView}
        lockedCaseMode={effectiveLockedCaseMode}
        onExportResults={onExportResults}
        onRequestSaveFinancialCase={onRequestSaveFinancialCase}
        exportResultsVisible={exportResultsVisible}
        saveFinancialCaseVisible={saveFinancialCaseVisible}
        saveFinancialCasePending={saveFinancialCasePending}
        pinActionsToDialogBottom={pinActionsToDialogBottom}
      />
    </FinancialStoreProvider>
  );
}

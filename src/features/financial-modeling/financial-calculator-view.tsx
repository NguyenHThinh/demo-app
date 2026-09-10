"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { cn } from "@/utils";
import {
  useFinancialStore,
  useFinancialStoreApi,
} from "@/features/financial-modeling/stores/financial-store-context";
import type { FinancialCasePersistedState } from "@/features/financial-modeling/lib/financial-store-snapshot";
import { getExpandCurrentVIFromOriginalDCFGrid } from "@/features/financial-modeling/engines/dcf-engine";
import { OptionDelayTab } from "@/features/financial-modeling/components/OptionDelayTab";
import { NpvOnlyTab } from "@/features/financial-modeling/components/NpvOnlyTab";
import { OptionExpandTab } from "@/features/financial-modeling/components/OptionExpandTab";
import { OptionAbandonTab } from "@/features/financial-modeling/components/OptionAbandonTab";
import { SummaryTable } from "@/features/financial-modeling/components/SummaryTable";
import { BinomialModal } from "@/features/financial-modeling/components/BinomialModal";
import { FunnelDataSection } from "@/features/financial-modeling/components/FunnelDataSection";
import { ROVFactorsSection } from "@/features/financial-modeling/components/ROVFactorsSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import type {
  ExportedFinancialResults,
  ResultSummary,
} from "@/features/financial-modeling/financial-calculator-types";
import { buildFinancialCaseSavePayload } from "@/features/financial-modeling/lib/build-financial-case-save-payload";
import { npvOnlyResultSummary } from "@/features/financial-modeling/lib/npv-only-summary";
import {
  CALCULATOR_CASE_MODE_LABEL,
  CALCULATOR_CASE_MODE_OPTIONS,
  calculatorCaseModeToActiveTab,
  isNpvCalculatorTab,
  type CalculatorActiveTab,
  type CalculatorCaseMode,
} from "@/features/financial-modeling/lib/calculator-case-mode";

const ALL_CALCULATOR_TABS = CALCULATOR_CASE_MODE_OPTIONS.map((id) => ({
  id,
  label: CALCULATOR_CASE_MODE_LABEL[id],
}));

export function FinancialCalculatorView({
  embedMode,
  initialTab = "npv",
  initialExpandSubView = "original",
  lockedCaseMode = null,
  onExportResults,
  onRequestSaveFinancialCase,
  exportResultsVisible,
  saveFinancialCaseVisible,
  saveFinancialCasePending = false,
  pinActionsToDialogBottom = false,
}: {
  embedMode: boolean;
  initialTab?: CalculatorActiveTab;
  initialExpandSubView?: "original" | "expansion";
  /** When set, only the matching option tab is shown (single active tab, not switchable). */
  lockedCaseMode?: CalculatorCaseMode | null;
  /** `bundle` is the same calculator snapshot as “Save financial case” — used when export must persist the case. */
  onExportResults?: (
    payload: ExportedFinancialResults,
    bundle: FinancialCasePersistedState,
  ) => void | Promise<void>;
  onRequestSaveFinancialCase?: (
    bundle: FinancialCasePersistedState,
    exportPayload: ExportedFinancialResults,
  ) => void | Promise<void>;
  /**
   * When `false`, hides Export Results even if `onExportResults` is set.
   * When `true` or omitted, shows only if `onExportResults` is a function.
   */
  exportResultsVisible?: boolean;
  /**
   * When `false`, hides Save even if `onRequestSaveFinancialCase` is set.
   * When `true` or omitted, shows only if `onRequestSaveFinancialCase` is a function.
   */
  saveFinancialCaseVisible?: boolean;
  /** True while a financial case save request is in flight. */
  saveFinancialCasePending?: boolean;
  /**
   * When true (dialog host), pin the action row to the dialog bottom via CSS
   * (`fixed` is relative to transformed DialogContent).
   */
  pinActionsToDialogBottom?: boolean;
}) {
  const store = useFinancialStore();
  const storeApi = useFinancialStoreApi();
  const resolvedInitialTab = lockedCaseMode
    ? calculatorCaseModeToActiveTab(lockedCaseMode)
    : initialTab;
  const isCaseModeLocked = lockedCaseMode != null;

  const visibleCaseTabs = useMemo(() => {
    if (lockedCaseMode != null) {
      return [
        {
          id: lockedCaseMode,
          label: CALCULATOR_CASE_MODE_LABEL[lockedCaseMode],
        },
      ];
    }
    return ALL_CALCULATOR_TABS;
  }, [lockedCaseMode]);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CalculatorActiveTab>(
    resolvedInitialTab,
  );
  const [expandSubView, setExpandSubView] = useState<"original" | "expansion">(
    initialExpandSubView,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [dataEntryOpen, setDataEntryOpen] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showExportResultsButton = useMemo(
    () =>
      exportResultsVisible !== false && typeof onExportResults === "function",
    [exportResultsVisible, onExportResults],
  );
  const showSaveFinancialButton = useMemo(
    () =>
      saveFinancialCaseVisible !== false &&
      typeof onRequestSaveFinancialCase === "function",
    [onRequestSaveFinancialCase, saveFinancialCaseVisible],
  );

  const isNpvTab = isNpvCalculatorTab(activeTab, lockedCaseMode);

  useEffect(() => {
    setMounted(true);
    store.recalculateNpvDCF();
    store.recalculateDelayDCF();
    store.recalculateExpand();
    store.recalculateAbandon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = useCallback(() => {
    const lattice =
      activeTab === "delay"
        ? store.delayLattice
        : activeTab === "expand"
          ? store.expandLattice
          : activeTab === "abandon"
            ? store.abandonLattice
            : null;
    if (lattice) setModalOpen(true);
  }, [
    activeTab,
    store.delayLattice,
    store.expandLattice,
    store.abandonLattice,
  ]);

  const resultTitle = useMemo(() => {
    if (activeTab === "npv") return "NPV";
    if (activeTab === "delay") {
      return "Delay";
    } else if (activeTab === "expand") {
      return expandSubView === "original"
        ? " Original Project"
        : "Expansion Project";
    } else if (activeTab === "abandon") {
      return "Abandon";
    }
    return "";
  }, [activeTab, expandSubView]);

  const activeSummary: ResultSummary | null = isNpvTab
    ? npvOnlyResultSummary(store.npvDCFResult)
    : activeTab === "delay" && store.delaySummary
      ? {
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
        }
      : activeTab === "expand" &&
          expandSubView === "original" &&
          store.expandOriginalDCFResult
        ? (() => {
            const { v0, investment } = getExpandCurrentVIFromOriginalDCFGrid(
              store.expandOriginalDCFResult,
            );
            const baseNPV = v0 - investment;
            const baseROI =
              investment !== 0 ? baseNPV / investment : null;
            const originalPerp =
              store.expandOriginalDCFInputs.financialMetrics.includePerpetGgity;
            return {
              baseNPV,
              mirr: originalPerp
                ? null
                : store.expandOriginalDCFResult.summary.mirr,
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
          })()
        : activeTab === "expand" &&
            expandSubView === "expansion" &&
            store.expandSummary
          ? {
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
            }
          : activeTab === "abandon" && store.abandonSummary
            ? {
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
              }
            : null;

  const activeLattice =
    activeTab === "delay"
      ? store.delayLattice
      : activeTab === "expand"
        ? store.expandLattice
        : activeTab === "abandon"
          ? store.abandonLattice
          : null;

  const summaryVariant =
    activeTab === "expand" && expandSubView === "original"
      ? "expand-original"
      : activeTab === "expand" && expandSubView === "expansion"
        ? "expand-expansion"
        : activeTab === "abandon"
          ? "abandon"
          : "default";

  const handleSaveFinancialCase = useCallback(() => {
    if (!onRequestSaveFinancialCase) return;
    const { bundle, exportPayload } = buildFinancialCaseSavePayload(
      store,
      storeApi,
      activeTab,
      expandSubView,
      activeSummary,
    );
    void onRequestSaveFinancialCase(bundle, exportPayload);
  }, [
    onRequestSaveFinancialCase,
    store,
    storeApi,
    activeTab,
    expandSubView,
    activeSummary,
  ]);

  const handleExportResults = useCallback(() => {
    if (!onExportResults) return;
    const { bundle, exportPayload } = buildFinancialCaseSavePayload(
      store,
      storeApi,
      activeTab,
      expandSubView,
      activeSummary,
    );
    void onExportResults(exportPayload, bundle);
  }, [
    onExportResults,
    store,
    storeApi,
    activeTab,
    expandSubView,
    activeSummary,
  ]);

  const showActionButtons = showExportResultsButton || showSaveFinancialButton;

  const actionButtons = (
    <>
      {showSaveFinancialButton ? (
        <Button
          type="button"
          onClick={handleSaveFinancialCase}
          disabled={saveFinancialCasePending}
          aria-busy={saveFinancialCasePending}
        >
          {saveFinancialCasePending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" />
              Saving…
            </span>
          ) : (
            "Save"
          )}
        </Button>
      ) : null}
      {showExportResultsButton ? (
        <Button type="button" onClick={handleExportResults}>
          Export Results
        </Button>
      ) : null}
    </>
  );

  return !mounted ? (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" />
      <span className="sr-only">Loading calculator</span>
    </div>
  ) : (
    <div
      className={cn(
        embedMode ? "space-y-6 p-2" : "space-y-6 py-2",
        pinActionsToDialogBottom && "pb-20",
      )}
    >
      {!embedMode && (
        <div>
          <h1 className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100">
            Project Financial Modelling
          </h1>
          <h2 className="text-[22px] mt-3 font-bold text-zinc-900 dark:text-zinc-100">
            NPV &amp; Real Options Valuation
          </h2>
          <p className="text-sm italic text-zinc-500 dark:text-zinc-500 mt-1">
            Powered by InnStrat
          </p>
        </div>
      )}

      <div className="rov-tabs">
        {visibleCaseTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rov-tab-btn${isCaseModeLocked || activeTab === tab.id ? " active" : ""}${isCaseModeLocked ? " rov-tab-btn-locked" : ""}`}
            disabled={isCaseModeLocked}
            aria-disabled={isCaseModeLocked || undefined}
            onClick={
              isCaseModeLocked
                ? undefined
                : () => setActiveTab(tab.id as CalculatorActiveTab)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          className="rov-toggle-entry-btn"
          onClick={() => setDataEntryOpen((v) => !v)}
        >
          {dataEntryOpen
            ? "▲ Hide Project Data Entry"
            : "▼ Show Project Data Entry"}
        </button>
      </div>

      {dataEntryOpen && (
        <>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Net Present Value (NPV)
              </h2>
              {!isCaseModeLocked &&
                (activeTab === "expand" || activeTab === "abandon") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    activeTab === "expand"
                      ? store.copyDelayToExpand(
                          expandSubView === "original"
                            ? "original"
                            : "expansion",
                        )
                      : store.copyDelayToAbandon()
                  }
                >
                  Copy from Option to Delay
                </Button>
              )}
            </div>
            <div
              className={`rov-tab-content${activeTab === "npv" ? " active" : ""}`}
            >
              <NpvOnlyTab />
            </div>
            <div
              className={`rov-tab-content${activeTab === "delay" ? " active" : ""}`}
            >
              <OptionDelayTab section="dcf" />
            </div>
            <div
              className={`rov-tab-content${activeTab === "expand" ? " active" : ""}`}
            >
              <OptionExpandTab
                section="dcf"
                subView={expandSubView}
                onSubViewChange={setExpandSubView}
              />
            </div>
            <div
              className={`rov-tab-content${activeTab === "abandon" ? " active" : ""}`}
            >
              <OptionAbandonTab section="dcf" />
            </div>
          </div>

          {!isNpvTab ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Real Option Valuation (ROV)
            </h2>
            <div
              className={`rov-tab-content${activeTab === "delay" ? " active" : ""}`}
            >
              <OptionDelayTab section="rov" />
            </div>
            <div
              className={`rov-tab-content${activeTab === "expand" ? " active" : ""}`}
            >
              <OptionExpandTab
                section="rov"
                subView={expandSubView}
                onSubViewChange={setExpandSubView}
              />
            </div>
            <div
              className={`rov-tab-content${activeTab === "abandon" ? " active" : ""}`}
            >
              <OptionAbandonTab section="rov" />
            </div>
          </div>
          ) : null}
        </>
      )}

      <div
        ref={resultsRef}
        className="rounded-2xl border-2 border-teal-500/40 dark:border-teal-400/30 bg-teal-50/50 dark:bg-teal-950/20 p-5 shadow-sm"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-5">
          Valuation Results {resultTitle}
        </h2>

        {activeSummary ? (
          <SummaryTable
            summary={activeSummary}
            colapsed={
              isNpvTab ||
              activeTab === "abandon" ||
              (activeTab === "expand" && expandSubView === "expansion")
            }
            variant={isNpvTab ? "npv-only" : summaryVariant}
          />
        ) : (
          <SummaryTable summary={null} variant={isNpvTab ? "npv-only" : summaryVariant} />
        )}

        {!isNpvTab &&
          !(activeTab === "expand" && expandSubView === "original") && (
            <Accordion
              type="multiple"
              defaultValue={["funnel-data"]}
              className="mt-4"
            >
              <AccordionItem value="funnel-data">
                <Button
                  variant="default"
                  size="default"
                  className="max-w-[200px] mx-auto my-2"
                  asChild
                >
                  <AccordionTrigger className="text-md p-0 font-bold [&>svg]:text-white">
                    View Binomial Tree
                  </AccordionTrigger>
                </Button>
                <AccordionContent>
                  <ROVFactorsSection factors={activeLattice?.factors} />
                  <FunnelDataSection
                    lattice={activeLattice}
                    onExpand={handleViewDetails}
                    variant={activeTab as "delay" | "expand" | "abandon"}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

        {!pinActionsToDialogBottom && showActionButtons ? (
          <div className="mt-4 flex flex-wrap justify-end gap-2">{actionButtons}</div>
        ) : null}
      </div>

      {pinActionsToDialogBottom && showActionButtons ? (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap justify-end gap-2 border-t border-border bg-background px-4 py-3 sm:px-6">
          {actionButtons}
        </div>
      ) : null}

      <BinomialModal
        lattice={activeLattice}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        variant={activeTab as "delay" | "expand" | "abandon"}
      />
    </div>
  );
}

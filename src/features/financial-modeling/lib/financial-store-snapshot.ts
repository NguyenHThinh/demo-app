import type { StoreApi } from "zustand";
import type { FinancialStore } from "@/features/financial-modeling/stores/financial-store";
import { bootstrapFinancialStore } from "@/features/financial-modeling/stores/financial-store";

/** Serializable slice of the financial Zustand store (no action methods). */
export const FINANCIAL_STORE_SNAPSHOT_KEYS = [
  "npvDCFInputs",
  "npvDCFResult",
  "delayDCFInputs",
  "delayDCFResult",
  "delayVolatilityInputs",
  "delayCalculatedVolatility",
  "delayInputs",
  "delayLattice",
  "delaySummary",
  "expandOriginalDCFInputs",
  "expandOriginalDCFResult",
  "expandExpansionDCFInputs",
  "expandExpansionDCFResult",
  "expandVolatilityInputs",
  "expandCalculatedVolatility",
  "expandInputs",
  "expandLattice",
  "expandSummary",
  "abandonDCFInputs",
  "abandonDCFResult",
  "abandonVolatilityInputs",
  "abandonCalculatedVolatility",
  "abandonInputs",
  "abandonLattice",
  "abandonSummary",
] as const;

export type FinancialStoreSnapshot = Pick<
  FinancialStore,
  (typeof FINANCIAL_STORE_SNAPSHOT_KEYS)[number]
>;

import type { CalculatorCaseMode, CalculatorActiveTab } from "./calculator-case-mode";

export type FinancialCasePersistedState = {
  v: 1;
  store: FinancialStoreSnapshot;
  ui: {
    activeTab: CalculatorActiveTab;
    expandSubView: "original" | "expansion";
    /** Set when saved from a locked calculator session (e.g. Classic NPV). */
    lockedCaseMode?: CalculatorCaseMode;
  };
};

export function extractFinancialStoreSnapshot(state: FinancialStore): FinancialStoreSnapshot {
  const raw: Record<string, unknown> = {};
  for (const k of FINANCIAL_STORE_SNAPSHOT_KEYS) {
    raw[k] = state[k];
  }
  return JSON.parse(JSON.stringify(raw)) as FinancialStoreSnapshot;
}

export function applyFinancialStoreSnapshot(
  api: StoreApi<FinancialStore>,
  snapshot: FinancialStoreSnapshot,
  ui?: FinancialCasePersistedState["ui"],
): void {
  const migrated = { ...snapshot } as FinancialStoreSnapshot;
  // Cases saved before the NPV-only slice used delay DCF (activeTab delay or lockedCaseMode npv).
  if (
    migrated.npvDCFInputs == null &&
    migrated.delayDCFInputs != null &&
    (ui?.lockedCaseMode === "npv" || ui?.activeTab === "npv")
  ) {
    migrated.npvDCFInputs = migrated.delayDCFInputs;
    migrated.npvDCFResult = migrated.delayDCFResult ?? null;
  }
  if (migrated.expandInputs != null) {
    migrated.expandInputs = {
      ...migrated.expandInputs,
      includeCostOfDelay: migrated.expandInputs.includeCostOfDelay ?? false,
      includeFVStrike: migrated.expandInputs.includeFVStrike ?? false,
    };
  }
  api.setState(migrated as Partial<FinancialStore>);
  bootstrapFinancialStore(api);
}

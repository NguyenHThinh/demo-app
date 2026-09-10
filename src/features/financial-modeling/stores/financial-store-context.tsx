"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStore } from "zustand/react";
import type { StoreApi } from "zustand";
import type { FinancialStore } from "./financial-store";

const FinancialStoreContext = createContext<StoreApi<FinancialStore> | null>(
  null,
);

export function FinancialStoreProvider({
  store,
  children,
}: {
  store: StoreApi<FinancialStore>;
  children: ReactNode;
}) {
  return (
    <FinancialStoreContext.Provider value={store}>
      {children}
    </FinancialStoreContext.Provider>
  );
}

export function useFinancialStore<T = FinancialStore>(
  selector?: (state: FinancialStore) => T,
): T {
  const api = useContext(FinancialStoreContext);
  if (!api) {
    throw new Error(
      "useFinancialStore must be used within FinancialStoreProvider",
    );
  }
  const resolved =
    selector ?? ((state: FinancialStore) => state as unknown as T);
  return useStore(api, resolved);
}

export function useFinancialStoreApi(): StoreApi<FinancialStore> {
  const api = useContext(FinancialStoreContext);
  if (!api) {
    throw new Error(
      "useFinancialStoreApi must be used within FinancialStoreProvider",
    );
  }
  return api;
}

"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import { BrandMark, PurpleButton } from "@/components/demo/chrome";
import { FinancialCalculatorModule } from "@/features/financial-modeling/financial-calculator-module";
import {
  isCalculatorCaseMode,
  type CalculatorCaseMode,
} from "@/features/financial-modeling/lib/calculator-case-mode";
import type { FinancialCasePersistedState } from "@/features/financial-modeling/lib/financial-store-snapshot";
import type { ExportedFinancialResults } from "@/features/financial-modeling/financial-calculator-types";
import {
  buildProjectLabel,
  clearProjectDraft,
  getProjectById,
  getProjectDraft,
  saveNewProjectFromDraft,
  updateSavedProject,
} from "@/lib/projects";

function CalculatorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("projectId");
  const modeParam = params.get("mode");
  const isDraft = params.get("draft") === "1";
  const [saveMessage, setSaveMessage] = useState("");
  const [savePending, setSavePending] = useState(false);

  const draft = useMemo(
    () => (isDraft ? getProjectDraft() : null),
    [isDraft],
  );

  const existing = useMemo(
    () => (projectId ? getProjectById(projectId) : undefined),
    [projectId],
  );

  const lockedCaseMode: CalculatorCaseMode | null = useMemo(() => {
    if (existing?.caseMode) return existing.caseMode;
    if (draft?.caseMode) return draft.caseMode;
    if (modeParam && isCalculatorCaseMode(modeParam)) return modeParam;
    return null;
  }, [existing, draft, modeParam]);

  const title =
    existing?.label ??
    (draft
      ? buildProjectLabel(draft.title, draft.caseMode)
      : "Innoster Real Options");

  const handleSave = useCallback(
    async (
      bundle: FinancialCasePersistedState,
      _exportPayload: ExportedFinancialResults,
    ) => {
      setSavePending(true);
      try {
        if (projectId && existing) {
          updateSavedProject(projectId, { persistedBundle: bundle });
          setSaveMessage("Saved.");
          return;
        }

        const currentDraft = getProjectDraft();
        if (!currentDraft) {
          setSaveMessage("Nothing to save — start from New Project first.");
          return;
        }

        const saved = saveNewProjectFromDraft(currentDraft, bundle);
        setSaveMessage("Saved — now available under Open Existing.");
        router.replace(
          `/calculator?projectId=${encodeURIComponent(saved.id)}&mode=${saved.caseMode}`,
        );
      } finally {
        setSavePending(false);
      }
    },
    [projectId, existing, router],
  );

  return (
    <div className="min-h-screen bg-content-bg">
      <header className="sticky top-0 z-20 border-b border-content-border bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark onDark={false} />
            <div className="min-w-0 border-l border-content-border pl-4">
              <p className="truncate text-sm font-semibold text-navy">
                {title}
              </p>
              {isDraft && !projectId ? (
                <p className="text-xs text-amber-700">
                  Draft — click Save to add this project to Open Existing
                </p>
              ) : null}
              {saveMessage ? (
                <p className="text-xs text-emerald-700">{saveMessage}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isDraft && !projectId ? (
              <PurpleButton
                type="button"
                variant="outline"
                onClick={() => {
                  clearProjectDraft();
                  router.push("/projects/new");
                }}
              >
                Discard draft
              </PurpleButton>
            ) : null}
            <PurpleButton type="button" onClick={() => router.push("/home")}>
              Back to Home
            </PurpleButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] p-3 md:p-4">
        <div className="overflow-hidden rounded-2xl border border-content-border bg-white shadow-sm">
          <FinancialCalculatorModule
            key={projectId ?? "draft"}
            embedMode
            lockedCaseMode={lockedCaseMode}
            initialTab={lockedCaseMode ?? "npv"}
            persistedBundle={existing?.persistedBundle ?? null}
            exportResultsVisible={false}
            saveFinancialCaseVisible
            saveFinancialCasePending={savePending}
            onRequestSaveFinancialCase={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-content-bg text-navy">
            Loading calculator…
          </div>
        }
      >
        <CalculatorInner />
      </Suspense>
    </RequireAuth>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import {
  BrandBlock,
  ChartBackground,
  PurpleButton,
  TextInput,
} from "@/components/demo/chrome";
import {
  mapValuationCaseToMode,
  setProjectDraft,
  type ProjectValuation,
  type ValuationCase,
} from "@/lib/projects";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Incorporating AI in wearables");
  const [valuation, setValuation] = useState<ProjectValuation>(
    "Real Options Valuation",
  );
  const [valuationCase, setValuationCase] =
    useState<ValuationCase>("Delay");

  function onNext(e: React.FormEvent) {
    e.preventDefault();
    const caseMode = mapValuationCaseToMode(valuation, valuationCase);
    // Draft only — NOT added to Open Existing until calculator Save
    setProjectDraft({ title, valuation, valuationCase, caseMode });
    router.push(`/calculator?draft=1&mode=${caseMode}`);
  }

  return (
    <RequireAuth>
      <ChartBackground>
        <div className="mx-auto min-h-screen max-w-4xl px-6 py-8">
          <BrandBlock compact />

          <form onSubmit={onNext} className="mt-10 space-y-6">
            <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
              <span className="font-semibold text-[var(--brand-purple)]">
                Project Title
              </span>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
              <span className="font-semibold text-[var(--brand-purple)]">
                Project Valuation
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-[var(--brand-purple)]"
                value={valuation}
                onChange={(e) =>
                  setValuation(e.target.value as ProjectValuation)
                }
              >
                <option>NPV Only</option>
                <option>Real Options Valuation</option>
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-start">
              <div>
                <span className="font-semibold text-[var(--brand-purple)]">
                  Valuation Case
                </span>
                <p className="mt-1 text-xs text-red-600">Single selection</p>
              </div>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-[var(--brand-purple)]"
                value={valuationCase}
                onChange={(e) =>
                  setValuationCase(e.target.value as ValuationCase)
                }
              >
                <option>Classic NPV</option>
                <option>Delay</option>
                <option>Expand</option>
                <option>Abandon</option>
              </select>
            </div>

            <p className="text-sm text-red-600">
              From here the program will go to the chosen valuation case
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <PurpleButton
                type="button"
                className="bg-slate-500 hover:bg-slate-600"
                onClick={() => router.push("/home")}
              >
                Back
              </PurpleButton>
              <PurpleButton type="submit">Next</PurpleButton>
            </div>
          </form>
        </div>
      </ChartBackground>
    </RequireAuth>
  );
}

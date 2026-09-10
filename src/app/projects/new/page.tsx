"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import {
  AppShell,
  BrandBlock,
  Panel,
  PurpleButton,
  SelectInput,
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
    setProjectDraft({ title, valuation, valuationCase, caseMode });
    router.push(`/calculator?draft=1&mode=${caseMode}`);
  }

  return (
    <RequireAuth>
      <AppShell
        title={
          <p className="text-sm font-medium text-navy">New Project</p>
        }
        actions={
          <PurpleButton href="/home" variant="outline">
            Home
          </PurpleButton>
        }
      >
        <BrandBlock compact />
        <Panel className="mt-6 max-w-3xl">
          <form onSubmit={onNext} className="space-y-6">
            <div className="grid gap-3 md:grid-cols-[200px_1fr] md:items-center">
              <span className="font-semibold text-navy">
                Project Title
              </span>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[200px_1fr] md:items-center">
              <span className="font-semibold text-navy">
                Project Valuation
              </span>
              <SelectInput
                value={valuation}
                onChange={(e) =>
                  setValuation(e.target.value as ProjectValuation)
                }
              >
                <option>NPV Only</option>
                <option>Real Options Valuation</option>
              </SelectInput>
            </div>

            <div className="grid gap-3 md:grid-cols-[200px_1fr] md:items-start">
              <div>
                <span className="font-semibold text-navy">
                  Valuation Case
                </span>
                <p className="mt-1 text-xs text-amber-700">Single selection</p>
              </div>
              <SelectInput
                value={valuationCase}
                onChange={(e) =>
                  setValuationCase(e.target.value as ValuationCase)
                }
              >
                <option>Classic NPV</option>
                <option>Delay</option>
                <option>Expand</option>
                <option>Abandon</option>
              </SelectInput>
            </div>

            <p className="text-sm text-amber-700">
              From here the program will go to the chosen valuation case
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <PurpleButton
                type="button"
                variant="outline"
                onClick={() => router.push("/home")}
              >
                Back
              </PurpleButton>
              <PurpleButton type="submit">Next</PurpleButton>
            </div>
          </form>
        </Panel>
      </AppShell>
    </RequireAuth>
  );
}

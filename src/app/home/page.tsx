"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import {
  AppShell,
  Panel,
  PurpleButton,
  SelectInput,
  TextInput,
} from "@/components/demo/chrome";
import { clearSession } from "@/lib/auth";
import {
  getProjects,
  mapValuationCaseToMode,
  setProjectDraft,
  type DemoProject,
  type ProjectValuation,
  type ValuationCase,
} from "@/lib/projects";

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DemoProject[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("Incorporating AI in wearables");
  const [valuation, setValuation] = useState<ProjectValuation>(
    "Real Options Valuation",
  );
  const [valuationCase, setValuationCase] =
    useState<ValuationCase>("Delay");

  useEffect(() => {
    const list = getProjects();
    setProjects(list);
    if (list[0]) setSelectedId(list[0].id);
  }, []);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const caseMode = mapValuationCaseToMode(valuation, valuationCase);
    setProjectDraft({ title, valuation, valuationCase, caseMode });
    router.push(`/calculator?draft=1&mode=${caseMode}`);
  }

  function onOpen() {
    const project = projects.find((p) => p.id === selectedId);
    if (!project) return;
    router.push(
      `/calculator?projectId=${encodeURIComponent(project.id)}&mode=${project.caseMode}`,
    );
  }

  return (
    <RequireAuth>
      <AppShell
        title={
          <p className="text-sm font-medium text-navy">
            Real Options Valuation
          </p>
        }
        actions={
          <button
            type="button"
            className="text-sm font-medium text-brand hover:underline"
            onClick={() => {
              clearSession();
              router.push("/signin");
            }}
          >
            Sign out
          </button>
        }
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-navy md:text-3xl">
            Your workspace
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new valuation case or open one you already saved.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <h2 className="text-lg font-semibold text-navy">New project</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose valuation type and case, then continue to the calculator.
            </p>
            <form onSubmit={onCreate} className="mt-6 space-y-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-navy">
                  Project Title
                </span>
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-navy">
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
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-navy">
                  Valuation Case
                </span>
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
              </label>

              <PurpleButton type="submit" className="w-full sm:w-auto">
                Next
              </PurpleButton>
            </form>
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold text-navy">Saved cases</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a case you previously saved from the calculator.
            </p>
            <ul className="mt-6 max-h-[min(50vh,28rem)] space-y-1 overflow-auto">
              {projects.length === 0 ? (
                <li className="rounded-xl bg-content-bg px-3 py-8 text-center text-sm text-muted-foreground">
                  No saved projects yet. Fill in New project and click Save in
                  the calculator.
                </li>
              ) : (
                projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-navy transition ${
                        selectedId === p.id
                          ? "bg-brand/10 font-semibold ring-1 ring-brand/40"
                          : "hover:bg-content-bg"
                      }`}
                    >
                      {p.label}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-6">
              <PurpleButton
                type="button"
                onClick={onOpen}
                className={
                  !selectedId || projects.length === 0
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              >
                Open
              </PurpleButton>
            </div>
          </Panel>
        </div>
      </AppShell>
    </RequireAuth>
  );
}

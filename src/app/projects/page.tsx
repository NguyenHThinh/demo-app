"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import {
  AppShell,
  Panel,
  PurpleButton,
} from "@/components/demo/chrome";
import { getProjects, type DemoProject } from "@/lib/projects";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DemoProject[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const list = getProjects();
    setProjects(list);
    if (list[0]) setSelectedId(list[0].id);
  }, []);

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
            Open Existing
          </p>
        }
        actions={
          <PurpleButton href="/home" variant="outline">
            Home
          </PurpleButton>
        }
      >
        <Panel className="max-w-3xl">
          <h2 className="text-lg font-bold text-navy">
            Valuation Cases
          </h2>
          <ul className="mt-4 max-h-[50vh] space-y-1 overflow-auto">
            {projects.length === 0 ? (
              <li className="rounded-xl bg-content-bg px-3 py-8 text-center text-sm text-muted-foreground">
                No saved projects yet. Create a New Project and click Save in
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

          <div className="mt-6 flex flex-wrap gap-3">
            <PurpleButton
              type="button"
              variant="outline"
              onClick={() => router.push("/home")}
            >
              Back
            </PurpleButton>
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
      </AppShell>
    </RequireAuth>
  );
}

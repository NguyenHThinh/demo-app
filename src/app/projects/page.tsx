"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/demo/require-auth";
import {
  BrandBlock,
  ChartBackground,
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
      <ChartBackground>
        <div className="mx-auto min-h-screen max-w-4xl px-6 py-8">
          <BrandBlock compact />

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--brand-purple)] underline">
              Valuation Cases
            </h2>
            <ul className="mt-4 max-h-[50vh] space-y-1 overflow-auto">
              {projects.length === 0 ? (
                <li className="px-3 py-6 text-sm text-slate-500">
                  No saved projects yet. Create a New Project and click Save in
                  the calculator.
                </li>
              ) : (
                projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-[var(--brand-purple)] ${
                        selectedId === p.id
                          ? "bg-[var(--brand-purple)]/15 font-semibold ring-1 ring-[var(--brand-purple)]/40"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <p className="mt-4 text-sm text-red-600">
            From here any selected file from above will be opened for review or
            edit
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <PurpleButton
              type="button"
              className="bg-slate-500 hover:bg-slate-600"
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
        </div>
      </ChartBackground>
    </RequireAuth>
  );
}

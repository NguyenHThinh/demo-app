import type { CalculatorCaseMode } from "@/features/financial-modeling/lib/calculator-case-mode";
import type { FinancialCasePersistedState } from "@/features/financial-modeling/lib/financial-store-snapshot";

export type ProjectValuation = "NPV Only" | "Real Options Valuation";
export type ValuationCase = "Classic NPV" | "Delay" | "Expand" | "Abandon";

export type DemoProject = {
  id: string;
  title: string;
  label: string;
  caseMode: CalculatorCaseMode;
  valuation?: ProjectValuation;
  valuationCase?: ValuationCase;
  createdAt: string;
  persistedBundle?: FinancialCasePersistedState | null;
};

export type ProjectDraft = {
  title: string;
  valuation: ProjectValuation;
  valuationCase: ValuationCase;
  caseMode: CalculatorCaseMode;
};

const PROJECTS_KEY = "innoster-demo-projects";
const DRAFT_KEY = "innoster-demo-draft";
/** Bump when storage shape / seed policy changes so old seeded lists are cleared. */
const PROJECTS_VERSION_KEY = "innoster-demo-projects-v";
const PROJECTS_VERSION = "2";

export function mapValuationCaseToMode(
  valuation: ProjectValuation,
  valuationCase: ValuationCase,
): CalculatorCaseMode {
  if (valuation === "NPV Only" || valuationCase === "Classic NPV") return "npv";
  if (valuationCase === "Delay") return "delay";
  if (valuationCase === "Expand") return "expand";
  return "abandon";
}

export function buildProjectLabel(
  title: string,
  caseMode: CalculatorCaseMode,
): string {
  const suffix: Record<CalculatorCaseMode, string> = {
    npv: "Classic NPV",
    delay: "Option to Delay",
    expand: "Option to Expand",
    abandon: "Option to Abandon",
  };
  return `${title} – ${suffix[caseMode]}`;
}

function ensureStorageVersion(): void {
  if (typeof window === "undefined") return;
  const current = localStorage.getItem(PROJECTS_VERSION_KEY);
  if (current === PROJECTS_VERSION) return;
  localStorage.setItem(PROJECTS_VERSION_KEY, PROJECTS_VERSION);
  // Drop old seeded / legacy lists
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
}

function readRaw(): DemoProject[] {
  if (typeof window === "undefined") return [];
  ensureStorageVersion();
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DemoProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(projects: DemoProject[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

/** Open Existing: only projects the user has Saved from the calculator. */
export function getProjects(): DemoProject[] {
  return readRaw();
}

export function getProjectById(id: string): DemoProject | undefined {
  return getProjects().find((p) => p.id === id);
}

export function setProjectDraft(draft: ProjectDraft): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getProjectDraft(): ProjectDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectDraft;
  } catch {
    return null;
  }
}

export function clearProjectDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}

/**
 * Persist a new project into Open Existing (only call from calculator Save).
 */
export function saveNewProjectFromDraft(
  draft: ProjectDraft,
  persistedBundle?: FinancialCasePersistedState | null,
): DemoProject {
  const project: DemoProject = {
    id: `user-${Date.now()}`,
    title: draft.title,
    label: buildProjectLabel(draft.title, draft.caseMode),
    caseMode: draft.caseMode,
    valuation: draft.valuation,
    valuationCase: draft.valuationCase,
    createdAt: new Date().toISOString(),
    persistedBundle: persistedBundle ?? null,
  };
  writeAll([...getProjects(), project]);
  clearProjectDraft();
  return project;
}

/** Update an already-listed project (re-Save from Open Existing). */
export function updateSavedProject(
  id: string,
  patch: Partial<Pick<DemoProject, "persistedBundle" | "title" | "label">>,
): DemoProject | undefined {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  const next = { ...projects[idx], ...patch };
  const copy = [...projects];
  copy[idx] = next;
  writeAll(copy);
  return next;
}

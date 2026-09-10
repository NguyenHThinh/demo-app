export const CALCULATOR_CASE_MODE_OPTIONS = [
  "npv",
  "delay",
  "expand",
  "abandon",
] as const;

export type CalculatorCaseMode = (typeof CALCULATOR_CASE_MODE_OPTIONS)[number];

/** Active tab slug in the calculator UI (same set as case modes). */
export type CalculatorActiveTab = CalculatorCaseMode;

export const CALCULATOR_CASE_MODE_LABEL: Record<CalculatorCaseMode, string> = {
  npv: "Classic NPV",
  delay: "Option to Delay",
  expand: "Option to Expand",
  abandon: "Option to Abandon",
};

export function isCalculatorCaseMode(value: string): value is CalculatorCaseMode {
  return (CALCULATOR_CASE_MODE_OPTIONS as readonly string[]).includes(value);
}

export function isCalculatorActiveTab(value: string): value is CalculatorActiveTab {
  return isCalculatorCaseMode(value);
}

export function calculatorCaseModeToActiveTab(
  mode: CalculatorCaseMode,
): CalculatorActiveTab {
  return mode;
}

export function isNpvCalculatorTab(
  activeTab: CalculatorActiveTab,
  lockedCaseMode?: CalculatorCaseMode | null,
): boolean {
  return activeTab === "npv" || lockedCaseMode === "npv";
}

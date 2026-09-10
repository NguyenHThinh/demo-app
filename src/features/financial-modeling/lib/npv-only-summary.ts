import type { ResultSummary } from "../financial-calculator-types";
import type { DCFResult } from "../types";

/** Map NPV-only DCF output to the valuation results panel (Excel D59–D63). */
export function npvOnlyResultSummary(
  result: DCFResult | null | undefined,
): ResultSummary | null {
  if (!result) return null;
  const s = result.summary;
  return {
    baseNPV: s.baseNPV,
    mirr: s.mirr,
    optionValue: null,
    expandedNPV: null,
    baseROI: s.baseROI,
    rovROI: null,
    v0: s.v0,
    investment: s.investment,
    v0Current: null,
    investmentCurrent: null,
    v0Expansion: null,
    investmentExpansion: null,
    npv: s.npv,
  };
}

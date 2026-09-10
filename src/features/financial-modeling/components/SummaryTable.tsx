"use client";

import type { ResultSummary } from "@/features/financial-modeling/financial-calculator-types";
import type { ReactNode } from "react";
import { formatCurrency, formatPercent } from "../utils/formatting";

function formatValue(
  value: number | null,
  isPercent: boolean,
  decimals?: number,
  nullLabel = "–",
): string {
  if (value === null) return nullLabel;
  if (isPercent) return formatPercent(value, decimals);
  return formatCurrency(value, decimals);
}

interface RowDef {
  label: ReactNode;
  key: keyof ResultSummary;
  isPercent: boolean;
  useColor?: boolean;
}

const ROV_ROWS: RowDef[] = [
  { label: "Present Value of Asset, V0 (£m)", key: "v0", isPercent: false },
  { label: "Present Value of Investment, I (£m)", key: "investment", isPercent: false },
  { label: "Base NPV", key: "baseNPV", isPercent: false, useColor: true },
  { label: "Base ROI (%)", key: "baseROI", isPercent: true },
  { label: "Base MIRR (%)", key: "mirr", isPercent: true },
  { label: "Option Value", key: "optionValue", isPercent: false, useColor: true },
  {
    label: "Expanded NPV",
    key: "expandedNPV",
    isPercent: false,
    useColor: true,
  },
  { label: "ROV ROI (%)", key: "rovROI", isPercent: true },
];

const ROV_ROWS_COLLAPSED: RowDef[] = [
  { label: "Base NPV", key: "baseNPV", isPercent: false, useColor: true },
  { label: "Option Value", key: "optionValue", isPercent: false, useColor: true },
  {
    label: "Expanded NPV",
    key: "expandedNPV",
    isPercent: false,
    useColor: true,
  },
  { label: "Base ROI (%)", key: "baseROI", isPercent: true },
  { label: "ROV ROI (%)", key: "rovROI", isPercent: true },
];

/** Master - NPV Only (D59–D63). */
const NPV_ONLY_ROWS: RowDef[] = [
  { label: "Present Value of Asset, V₀ (£m)", key: "v0", isPercent: false },
  { label: "Present Value of Investment, I (£m)", key: "investment", isPercent: false },
  { label: "Base NPV", key: "baseNPV", isPercent: false, useColor: true },
  { label: "Base ROI (%)", key: "baseROI", isPercent: true, useColor: true },
  { label: "Base MIRR (%)", key: "mirr", isPercent: true, useColor: true },
];

/** Expand (1) — same teal panel as expansion; grid totals D88/D89 style (via page activeSummary). */
const EXPAND_ORIGINAL_ROWS: RowDef[] = [
  { label: "PV, Current Asset, V₀ (£m)", key: "v0", isPercent: false },
  { label: "PV, Current Investment, I (£m)", key: "investment", isPercent: false   },
  {
    label: "NPV of Current Investment",
    key: "baseNPV",
    isPercent: false,
    useColor: true,
  },
  { label: "Current Investment ROI (%)", key: "baseROI", isPercent: true, useColor: true },
  { label: "Base MIRR (%)", key: "mirr", isPercent: true, useColor: true },
];

const EXPAND_EXPANSION_ROWS_COLLAPSED: RowDef[] = [
  { label: "Present Value of Current Asset, V0 (£m)", key: "v0Current", isPercent: false },
  { label: "Present Value of Current Investment, I (£m)", key: "investmentCurrent", isPercent: false },
  { label: "Base NPV", key: "baseNPV", isPercent: false, useColor: true },
  { label: "Base ROI (%)", key: "baseROI", isPercent: true, useColor: true },
  { label: "Base MIRR (%)", key: "mirr", isPercent: true },
  { label: <>Present Value of Expansion Asset, V0<sub className="normal-case">e</sub> (£m)</>, key: "v0Expansion", isPercent: false },
  { label: <>Present Value of Expansion Investment, I<sub className="normal-case">e</sub> (£m)</>, key: "investmentExpansion", isPercent: false },
  { label: "Option Value", key: "optionValue", isPercent: false, useColor: true },
  { label: "Expanded NPV", key: "expandedNPV", isPercent: false, useColor: true },
  { label: "ROV ROI (%)", key: "rovROI", isPercent: true, useColor: true },
];

const ABANDON_ROWS: RowDef[] = [
  { label: "Present Value of Asset, V0 (£m)", key: "v0", isPercent: false },
  { label: "Present Value of Investment, I (£m)", key: "investment", isPercent: false },
  { label: "Base NPV", key: "baseNPV", isPercent: false, useColor: true },
  { label: "Base ROI (%)", key: "baseROI", isPercent: true },
  { label: "Base MIRR (%)", key: "mirr", isPercent: true },
  { label: "Option Value", key: "optionValue", isPercent: false, useColor: true },
  { label: "Expanded NPV", key: "expandedNPV", isPercent: false, useColor: true },
  { label: "ROV ROI (%)", key: "rovROI", isPercent: true },
];

export function SummaryTable({
  summary,
  colapsed = false,
  variant = "default",
}: {
  summary: ResultSummary | null;
  colapsed?: boolean;
  variant?: "default" | "npv-only" | "expand-original" | "expand-expansion" | "abandon";
}) {
  const rows =
    variant === "npv-only"
      ? NPV_ONLY_ROWS
      : variant === "expand-original"
      ? EXPAND_ORIGINAL_ROWS
      : variant === "expand-expansion"
        ? EXPAND_EXPANSION_ROWS_COLLAPSED
        : variant === "abandon"
          ? ABANDON_ROWS
          : colapsed
            ? ROV_ROWS_COLLAPSED
            : ROV_ROWS;
  if (!summary) {
    return (
      <div className="rov-summary-table">
        <table>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className={row.useColor ? "font-bold" : ""}>{row.label}</td>
                <td>–</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rov-summary-table">
      <table>
        <tbody>
          {rows.map((row) => {
            const value = summary[row.key] as number | null;
            const colorClass =
              row.useColor && value !== null
                ? value >= 0
                  ? "rov-positive"
                  : "rov-negative"
                : "";
            return (
              <tr key={row.key} className={row.useColor ? "font-bold" : ""}>
                <td>{row.label}</td>
                <td className={colorClass}>
                  {formatValue(
                    value,
                    row.isPercent,
                    row.key === "mirr" ? 2 : 0,
                    row.key === "mirr" ? "N/A" : "–",
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

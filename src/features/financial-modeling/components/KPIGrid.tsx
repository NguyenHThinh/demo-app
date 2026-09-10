'use client';

import type { ResultSummary } from "@/features/financial-modeling/financial-calculator-types";
import { formatCurrency, formatPercent } from '../utils/formatting';

function npvColorClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return '';
}

function formatValue(value: number | null, isPercent: boolean): string {
  if (value === null) return '–';
  if (isPercent) return formatPercent(value);
  return formatCurrency(value);
}

interface KPIItem {
  label: string;
  value: number | null;
  isPercent: boolean;
  useNPVColor: boolean;
  forcePositive?: boolean;
  highlight?: boolean;
}

function getROVItems(s: ResultSummary): KPIItem[] {
  return [
    { label: 'Base NPV', value: s.baseNPV, isPercent: false, useNPVColor: true },
    { label: 'MIRR (%)', value: s.mirr, isPercent: true, useNPVColor: false },
    { label: 'Option Value', value: s.optionValue, isPercent: false, useNPVColor: false, forcePositive: true },
    { label: 'Expanded NPV', value: s.expandedNPV, isPercent: false, useNPVColor: true, highlight: true },
    { label: 'Base ROI (%)', value: s.baseROI, isPercent: true, useNPVColor: false },
    { label: 'ROV ROI (%)', value: s.rovROI, isPercent: true, useNPVColor: false },
  ];
}

const EMPTY_ROV = ['Base NPV', 'MIRR (%)', 'Option Value', 'Expanded NPV', 'Base ROI (%)', 'ROV ROI (%)'];

export function KPIGrid({ summary }: { summary: ResultSummary | null }) {
  if (!summary) {
    return (
      <div className="rov-kpi-grid">
        {EMPTY_ROV.map((label, i) => (
          <div key={i} className={`rov-kpi-card${i === 3 ? ' highlight' : ''}`}>
            <span className="rov-kpi-label">{label}</span>
            <span className="rov-kpi-value">–</span>
          </div>
        ))}
      </div>
    );
  }

  const items = getROVItems(summary);

  return (
    <div className="rov-kpi-grid">
      {items.map((item) => {
        let colorClass = '';
        if (item.value !== null) {
          if (item.useNPVColor) colorClass = npvColorClass(item.value);
          if (item.forcePositive) colorClass = 'positive';
        }

        return (
          <div key={item.label} className={`rov-kpi-card${item.highlight ? ' highlight' : ''}`}>
            <span className="rov-kpi-label">{item.label}</span>
            <span className={`rov-kpi-value${colorClass ? ` ${colorClass}` : ''}`}>
              {formatValue(item.value, item.isPercent)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

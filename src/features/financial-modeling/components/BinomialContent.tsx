'use client';

import type { BinomialLatticeResult } from '../types';
import type { ReactNode } from 'react';

export type BinomialVariant = 'delay' | 'expand' | 'abandon';

export function formatTreeNumber(val: number | undefined, decimals?: number): string {
  if (val === undefined || val === null) return '';
  const abs = Math.abs(val);
  if (decimals !== undefined) return val.toFixed(decimals);
  return val.toFixed(2);
}

/** Time steps shown as table columns; if maxStepIndex >= nSteps, every interval 0..N is shown. */
export function pickDisplaySteps(nSteps: number, maxStepIndex: number): number[] {
  if (nSteps <= maxStepIndex) return Array.from({ length: nSteps + 1 }, (_, i) => i);
  const steps = [0];
  const interval = Math.ceil(nSteps / maxStepIndex);
  for (let i = interval; i < nSteps; i += interval) steps.push(i);
  if (steps[steps.length - 1] !== nSteps) steps.push(nSteps);
  return steps;
}

export function MetaGrid({ factors, nSteps }: { factors: BinomialLatticeResult['factors']; nSteps: number }) {
  return (
    <div className="rov-binomial-meta">
      <div className="rov-funnel-legend">
        <span className="rov-legend-v">■ Asset Future Values (V)</span>
        <span className="rov-legend-ov">■ Option Values (C)</span>
      </div>
    </div>
  );
}

function MetaRow({ label, steps, values, className, title, onlyLast = false, fallbackValue = '' }: {
  label: string;
  steps: number[];
  values: (string | number)[];
  className?: string;
  title?: string;
  onlyLast?: boolean;
  fallbackValue?: string;
}) {
  return (
    <tr className={`rov-meta-row ${className ?? ''}`}>
      <td className="rov-sticky-col rov-type-col rov-meta-row-label" title={title}>{label}</td>
      {steps.map((s) => (
        <td key={s} className="rov-meta-row-cell">
          {(onlyLast && s < steps.length - 1)
            ? fallbackValue
            : values[s] !== undefined
              ? values[s]
              : ''}
        </td>
      ))}
    </tr>
  );
}

type MetaRowDef = {
  label: string;
  values: (string | number)[];
  className?: string;
  title?: string;
  onlyLast?: boolean;
  fallbackValue?: string;
};

function buildMetaRows(variant: BinomialVariant, lattice: BinomialLatticeResult, N: number): MetaRowDef[] {
  const { dt: latticeDt, factors, strikes, delayCosts, pvDelayCost, abandonDisplay } = lattice;
  const dt = latticeDt ?? factors.dt;

  const timeIntervals: number[] = [];
  const years: string[] = [];
  const strikeValues: string[] = [];
  const pvDelayCostValues: string[] = [];
  const optionDelayCostValues: string[] = [];
  const recoveryValues: string[] = [];
  const expenseValues: string[] = [];
  const pvDividendValues: string[] = [];

  for (let t = 0; t <= N; t++) {
    timeIntervals.push(t);
    years.push((t * dt).toFixed(dt < 1 ? 2 : 0));
    strikeValues.push((strikes?.[t] ?? 0) !== 0 ? formatTreeNumber(strikes?.[t], 0) : '');
    pvDelayCostValues.push(pvDelayCost != null && pvDelayCost !== 0 && t > 0 ? formatTreeNumber(pvDelayCost, 0) : '');
    optionDelayCostValues.push((delayCosts?.[t] ?? 0) !== 0 ? formatTreeNumber(delayCosts?.[t], 2) : '');
    recoveryValues.push(formatTreeNumber(abandonDisplay?.recoveryAtT[t], 0));
    expenseValues.push(
      abandonDisplay?.expenseAtT[t] != null ? formatTreeNumber(-abandonDisplay.expenseAtT[t], 0) : '',
    );
    pvDividendValues.push(
      abandonDisplay?.pvDividend != null && abandonDisplay.pvDividend !== 0 && t > 0
        ? formatTreeNumber(abandonDisplay.pvDividend, 0)
        : '',
    );
  }

  if (variant === 'expand') {
    return [
      { label: 'Interval', values: timeIntervals },
      {
        label: 'Investment (Strike / Exercise)',
        title: 'Investment (Strike / Exercise)',
        values: strikeValues,
        className: 'rov-meta-row-strike',
        onlyLast: true,
        fallbackValue: '0.00',
      },
    ];
  }

  if (variant === 'abandon') {
    return [
      { label: 'Interval', values: timeIntervals },
      {
        label: 'PV of Dividend',
        title: 'PV of Dividend',
        values: pvDividendValues,
        className: 'rov-meta-row-cost',
      },
      {
        label: 'Abandonment Recovery Value (+ve)',
        title: 'Abandonment Recovery Value (+ve)',
        values: recoveryValues,
        className: 'rov-meta-row-strike',
        onlyLast: true,
        fallbackValue: '0.00',
      },
      {
        label: 'Abandonment Expenses @ Exercise (−ve)',
        title: 'Abandonment Expenses @ Exercise (−ve)',
        values: expenseValues,
        className: 'rov-meta-row-cost',
        onlyLast: true,
        fallbackValue: '0.00',
      },
    ];
  }

  return [
    { label: 'Interval', values: timeIntervals },
    { label: 'Years', values: years },
    { label: 'Strike', values: strikeValues, className: 'rov-meta-row-strike' },
  ];
}

export function BinomialTable({ lattice, variant }: {
  lattice: BinomialLatticeResult;
  variant?: BinomialVariant;
}) {
  const { assetValues: assetTree, optionValues: optionTree } = lattice;
  const N = assetTree.length - 1;
  const steps = pickDisplaySteps(N, N);
  const totalRows = 2 * (N + 1);
  const activeVariant = variant ?? 'delay';
  const metaRows = buildMetaRows(activeVariant, lattice, N);

  const rows: ReactNode[] = [];
  for (let r = 0; r < totalRows; r++) {
    // const isVRow = r % 2 === 0;
    const cells: React.ReactNode[] = [];

    cells.push(
      <td
        key="type"
        // className={`rov-sticky-col rov-type-col ${isVRow ? 'rov-v-label' : 'rov-ov-label'}`}
        className="rov-sticky-col rov-type-col"
      >
        {/* {isVRow ? 'V' : 'C'} */}
      </td>
    );

    for (const i of steps) {
      const startRow = N - i;
      const endRow = N + i + 1;

      if (r < startRow || r > endRow) {
        cells.push(<td key={i} className="rov-empty-cell" />);
        continue;
      }

      const localRow = r - startRow;
      const j = Math.floor(localRow / 2);
      const isV = localRow % 2 === 0;

      if (j < 0 || j > i) {
        cells.push(<td key={i} className="rov-empty-cell" />);
        continue;
      }

      const val = isV ? assetTree[i]?.[j] : optionTree[i]?.[j];
      cells.push(
        <td key={i} className={isV ? 'rov-cell-v' : 'rov-cell-ov'}>
          {formatTreeNumber(val, 0)}
        </td>
      );
    }

    rows.push(<tr key={r}>{cells}</tr>);
  }

  const tableClass =
    activeVariant === 'expand' || activeVariant === 'abandon'
      ? 'rov-binomial-table rov-funnel-table rov-abandon-binomial-table'
      : 'rov-binomial-table rov-funnel-table';

  return (
    <table className={tableClass}>
      <tbody>
        {metaRows.map((row) => (
          <MetaRow
            key={row.label}
            label={row.label}
            steps={steps}
            values={row.values}
            className={row.className}
            title={row.title}
            onlyLast={row.onlyLast}
            fallbackValue={row.fallbackValue}
          />
        ))}
        <tr className="rov-tree-separator">
          <td className="rov-sticky-col rov-type-col" />
          {steps.map((s) => <td key={s} />)}
        </tr>
        {rows}
      </tbody>
    </table>
  );
}

export function BinomialSection({ lattice, variant = 'delay' }: {
  lattice: BinomialLatticeResult;
  variant?: BinomialVariant;
}) {
  const N = lattice.assetValues.length - 1;
  return (
    <>
      <MetaGrid factors={lattice.factors} nSteps={N} />
      <div className="rov-tree-wrapper">
        <BinomialTable lattice={lattice} variant={variant} />
      </div>
    </>
  );
}

'use client';

import type { BinomialLatticeResult } from '../types';
import { formatCurrency } from '../utils/formatting';

interface BinomialLatticeProps {
  lattice: BinomialLatticeResult;
  maxDisplay?: number;
}

export function BinomialLattice({ lattice, maxDisplay = 20 }: BinomialLatticeProps) {
  const { assetValues, optionValues } = lattice;
  const intervals = assetValues.length - 1;
  const displayIntervals = Math.min(intervals, maxDisplay);

  // Build a combined display: for each interval t, we show t+1 rows
  // Each row has: asset value and option value
  // Displayed as a triangular table where columns are intervals

  return (
    <div className="space-y-4">
      {intervals > maxDisplay && (
        <p className="text-xs text-muted-foreground">
          Showing first {maxDisplay} of {intervals} intervals.
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              <th className="px-2 py-1.5 text-left sticky left-0 bg-inherit min-w-[60px]">Node</th>
              {Array.from({ length: displayIntervals + 1 }, (_, t) => (
                <th key={t} className="px-2 py-1.5 text-center min-w-[100px]">
                  t={t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: displayIntervals + 1 }, (_, j) => (
              <tr key={j} className="border-t">
                <td className="px-2 py-1 sticky left-0 bg-white dark:bg-zinc-950 font-medium">
                  j={j}
                </td>
                {Array.from({ length: displayIntervals + 1 }, (_, t) => {
                  if (j > t) {
                    return <td key={t} className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900" />;
                  }
                  const av = assetValues[t]?.[j];
                  const ov = optionValues[t]?.[j];
                  return (
                    <td key={t} className="px-1 py-1 text-center border-r last:border-r-0">
                      <div className="text-muted-foreground tabular-nums">
                        {av !== undefined ? formatCurrency(av) : ''}
                      </div>
                      <div
                        className={`font-semibold tabular-nums ${
                          ov !== undefined && ov > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {ov !== undefined ? formatCurrency(ov) : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Top: Asset Value</span>
        <span className="text-emerald-600">Bottom: Option Value</span>
      </div>
    </div>
  );
}

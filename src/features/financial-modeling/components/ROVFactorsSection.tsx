'use client';

import type { BinomialLatticeResult } from '../types';

type Factors = BinomialLatticeResult['factors'];

interface Props {
  factors: Factors | null | undefined;
}

export function ROVFactorsSection({ factors }: Props) {
  if (!factors) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500 py-2">No ROV factor data available.</p>;
  }

  return (
    <div className="pt-0 pb-4">
      <div className="rov-section-actions">
      </div>
      <div className="rov-print-section">
        <div className="rov-info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Interval time, dt (years)</span>
            <span className="rov-info-value">{factors.dt.toFixed(3)}</span>
          </div>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Upside factor (u)</span>
            <span className="rov-info-value">{factors.u.toFixed(3)}</span>
          </div>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Downside factor (d)</span>
            <span className="rov-info-value">{factors.d.toFixed(3)}</span>
          </div>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Up probability (p<sub>u</sub>)</span>
            <span className="rov-info-value">{factors.pu.toFixed(3)}</span>
          </div>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Down probability (p<sub>d</sub>)</span>
            <span className="rov-info-value">{factors.pd.toFixed(3)}</span>
          </div>
          <div className="rov-info-item gap-1">
            <span className="rov-info-label">Intervals</span>
            <span className="rov-info-value">{factors.intervals}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

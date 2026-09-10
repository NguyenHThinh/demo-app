'use client';

import { useRef } from 'react';
import type { BinomialLatticeResult } from '../types';
import { BinomialSection } from './BinomialContent';

interface Props {
  lattice: BinomialLatticeResult | null;
  onExpand: () => void;
  variant?: 'delay' | 'expand' | 'abandon';
}

export function FunnelDataSection({
  lattice,
  onExpand,
  variant,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printRoot = document.createElement('div');
    printRoot.className = 'rov-print-root';
    printRoot.style.setProperty('--rov-print-scale', '1');
    printRoot.style.setProperty('--rov-print-font-size', '0.8rem');
    printRoot.style.setProperty('--rov-print-cell-min-width', '2.3rem');
    printRoot.style.setProperty('--rov-print-cell-padding-y', '0.1rem');
    printRoot.style.setProperty('--rov-print-cell-padding-x', '0.42rem');
    printRoot.style.setProperty('--rov-print-meta-font-size', '0.7rem');
    printRoot.style.setProperty('--rov-print-meta-padding-y', '0.2rem');
    printRoot.style.setProperty('--rov-print-meta-padding-x', '0.5rem');
    const printClone = printRef.current.cloneNode(true) as HTMLDivElement;
    printClone.classList.add('rov-print-target');
    printRoot.appendChild(printClone);
    document.body.appendChild(printRoot);

    let cleaned = false;
    let fallbackTimer: number | undefined;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      document.body.classList.remove('rov-printing');
      window.removeEventListener('afterprint', cleanup);
      printRoot.remove();
    };

    document.body.classList.add('rov-printing');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const table = printRoot.querySelector<HTMLTableElement>('.rov-funnel-table');
        if (table) {
          const intervalRow = table.querySelector<HTMLTableRowElement>('tr.rov-meta-row');
          const intervalCount = intervalRow
            ? Math.max(1, intervalRow.querySelectorAll('td').length - 1)
            : Math.max(1, table.querySelectorAll('tr:first-child td').length - 1);

          let targetFill = 0.98;
          let maxScale = 1.46;
          let fontSize = '0.88rem';
          let cellMinWidth = '3.4rem';
          let cellPaddingY = '0.16rem';
          let cellPaddingX = '0.62rem';
          let metaFontSize = '0.76rem';
          let metaPaddingY = '0.24rem';
          let metaPaddingX = '0.6rem';

          if (intervalCount >= 11) {
            targetFill = 1;
            maxScale = 1;
            fontSize = '0.66rem';
            cellMinWidth = '1.65rem';
            cellPaddingY = '0.06rem';
            cellPaddingX = '0.28rem';
            metaFontSize = '0.62rem';
            metaPaddingY = '0.14rem';
            metaPaddingX = '0.34rem';
          } else if (intervalCount >= 9) {
            targetFill = 1;
            maxScale = 1.04;
            fontSize = '0.72rem';
            cellMinWidth = '2.05rem';
            cellPaddingY = '0.08rem';
            cellPaddingX = '0.34rem';
            metaFontSize = '0.66rem';
            metaPaddingY = '0.18rem';
            metaPaddingX = '0.4rem';
          } else if (intervalCount >= 7) {
            targetFill = 0.995;
            maxScale = 1.16;
            fontSize = '0.78rem';
            cellMinWidth = '2.45rem';
            cellPaddingY = '0.1rem';
            cellPaddingX = '0.44rem';
            metaFontSize = '0.7rem';
            metaPaddingY = '0.2rem';
            metaPaddingX = '0.48rem';
          } else if (intervalCount >= 5) {
            targetFill = 0.99;
            maxScale = 1.32;
            fontSize = '0.84rem';
            cellMinWidth = '2.95rem';
            cellPaddingY = '0.12rem';
            cellPaddingX = '0.54rem';
            metaFontSize = '0.74rem';
            metaPaddingY = '0.22rem';
            metaPaddingX = '0.56rem';
          }

          const w = table.scrollWidth;
          const viewportWidth = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
          const PRINT_MAX_CONTENT_PX = 1040;
          const avail = Math.max(360, Math.min(viewportWidth - 56, PRINT_MAX_CONTENT_PX));
          const rawScale = (avail * targetFill) / w;
          const scale = Math.max(0.08, Math.min(maxScale, rawScale));

          printRoot.style.setProperty('--rov-print-scale', String(scale));
          printRoot.style.setProperty('--rov-print-font-size', fontSize);
          printRoot.style.setProperty('--rov-print-cell-min-width', cellMinWidth);
          printRoot.style.setProperty('--rov-print-cell-padding-y', cellPaddingY);
          printRoot.style.setProperty('--rov-print-cell-padding-x', cellPaddingX);
          printRoot.style.setProperty('--rov-print-meta-font-size', metaFontSize);
          printRoot.style.setProperty('--rov-print-meta-padding-y', metaPaddingY);
          printRoot.style.setProperty('--rov-print-meta-padding-x', metaPaddingX);
        }
        window.addEventListener('afterprint', cleanup);
        fallbackTimer = window.setTimeout(cleanup, 8000);
        window.print();
      });
    });
  };

  if (!lattice) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500 py-2">No lattice data available.</p>;
  }

  return (
    <div>
      <div className="rov-section-actions">
        <button type="button" className="rov-action-btn" onClick={onExpand}>
          Expand View
        </button>
        <button type="button" className="rov-action-btn" onClick={handlePrint}>
          Print
        </button>
      </div>
      <div ref={printRef} className="rov-print-section">
        <BinomialSection lattice={lattice} variant={variant} />
      </div>
    </div>
  );
}

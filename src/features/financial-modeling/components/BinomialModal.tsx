'use client';

import { useEffect, useCallback } from 'react';
import type { BinomialLatticeResult } from '../types';
import { BinomialSection } from './BinomialContent';

interface Props {
  lattice: BinomialLatticeResult | null;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'delay' | 'expand' | 'abandon';
}

export function BinomialModal({
  lattice,
  isOpen,
  onClose,
  variant,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('rov-modal-open');
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('rov-modal-open');
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !lattice) return null;

  const title =
    variant === 'abandon'
      ? 'Binomial Tree – Option to Abandon'
      : variant === 'expand'
        ? 'Binomial Tree – Option to Expand'
        : 'Binomial Tree – Asset & Option Values';

  return (
    <div className="rov-modal-backdrop" aria-hidden="false">
      <div className="rov-modal-overlay" onClick={onClose} />
      <div className="rov-modal-panel" role="dialog" aria-modal="true">
        <div className="rov-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="rov-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="rov-modal-body">
          <BinomialSection lattice={lattice} variant={variant} />
        </div>
      </div>
    </div>
  );
}

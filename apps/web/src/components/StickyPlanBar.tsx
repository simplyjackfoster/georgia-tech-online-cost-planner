import React from 'react';
import { formatCurrency } from '../lib/calc';

type StickyPlanBarProps = {
  totalCost: number;
  finishLabel: string;
  onCopyShare: () => void;
  onViewDetails: () => void;
};

const StickyPlanBar: React.FC<StickyPlanBarProps> = ({
  totalCost,
  finishLabel,
  onCopyShare,
  onViewDetails
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-tech-gold/30 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-goldDark">
            Total cost
          </p>
          <p className="text-lg font-semibold text-tech-navy tabular-nums">
            {formatCurrency(totalCost)}
          </p>
          <p className="text-[11px] text-tech-navy/70">Finish {finishLabel}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCopyShare}
            className="rounded-full border border-tech-navy px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-navy transition hover:bg-tech-navy hover:text-tech-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Copy share link
          </button>
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-full bg-tech-navy px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-tech-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tech-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyPlanBar;

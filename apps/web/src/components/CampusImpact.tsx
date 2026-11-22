import React from 'react';
import type { CampusImpact } from '@campusshelf/contracts';

interface CampusImpactProps {
  impact: CampusImpact | null;
}

export function CampusImpactPanel({ impact }: CampusImpactProps): React.JSX.Element {
  if (!impact) {
    return (
      <div data-testid="campus-impact-panel" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full max-w-sm">
        <p className="text-xs text-slate-400 text-center">Loading campus impact...</p>
      </div>
    );
  }

  return (
    <div data-testid="campus-impact-panel" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full max-w-sm text-left">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🌱</span>
        <h3 className="text-sm font-semibold text-slate-800">{impact.campusName} Impact</h3>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 rounded-lg p-3">
          <p
            data-testid="impact-total-listed"
            className="text-xl font-bold text-slate-800"
          >
            {impact.totalListed}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Listed</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xl font-bold text-amber-700">{impact.totalReserved}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Reserved</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3">
          <p
            data-testid="impact-total-donated"
            className="text-xl font-bold text-emerald-700"
          >
            {impact.totalDonated}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Donated ✓</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-3 text-center">
        {impact.totalMembers} verified campus member{impact.totalMembers !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

import React from 'react';

export function SkeletonListingCard(): React.JSX.Element {
  return (
    <div
      data-testid="skeleton-listing-card"
      aria-hidden="true"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col"
    >
      <div className="h-44 bg-slate-200 w-full" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-100 rounded w-2/3" />
          <div className="h-8 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({
  count = 3,
  testId = 'listings-skeleton',
}: {
  count?: number;
  testId?: string;
}): React.JSX.Element {
  return (
    <div
      data-testid={testId}
      role="status"
      aria-label="Loading content..."
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListingCard key={i} />
      ))}
      <span className="sr-only">Loading listings...</span>
    </div>
  );
}

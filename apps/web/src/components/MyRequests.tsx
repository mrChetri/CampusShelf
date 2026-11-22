import React from 'react';
import type { BookRequest } from '@campusshelf/contracts';

interface MyRequestsProps {
  requests: BookRequest[];
  onCancelRequest: (requestId: string) => void;
  onBrowseBooks?: () => void;
  onReportProblem?: (request: BookRequest) => void;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'PENDING', className: 'bg-amber-100 text-amber-800' },
  ACCEPTED: { label: 'ACCEPTED', className: 'bg-emerald-100 text-emerald-800' },
  DECLINED: { label: 'DECLINED', className: 'bg-rose-100 text-rose-800' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-slate-200 text-slate-700' },
  COMPLETED: { label: 'COMPLETED', className: 'bg-indigo-100 text-indigo-800' },
  DISPUTED: { label: 'DISPUTED', className: 'bg-rose-100 text-rose-800' },
};

export const MyRequests: React.FC<MyRequestsProps> = ({
  requests,
  onCancelRequest,
  onBrowseBooks,
  onReportProblem,
}) => {
  if (requests.length === 0) {
    return (
      <div
        data-testid="requests-empty-state"
        className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto my-6"
      >
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
          📫
        </div>
        <h3 className="font-bold text-slate-800 text-sm mb-1">No requests yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          You haven&apos;t requested any books yet. Browse the catalog to find textbooks and study materials.
        </p>
        {onBrowseBooks && (
          <button
            onClick={onBrowseBooks}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors"
          >
            Browse Books
          </button>
        )}
      </div>
    );
  }

  return (
    <section data-testid="my-requests-section" className="w-full my-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 text-left">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span>📬 My Book Requests</span>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
            {requests.length} total
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track the status of your requested textbooks and manage pending requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => {
          const badge = STATUS_BADGES[req.status] || {
            label: req.status,
            className: 'bg-slate-100 text-slate-700',
          };

          return (
            <div
              key={req.id}
              data-testid="request-card"
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {req.listingTitle}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2">by {req.listingAuthor}</p>

                <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1 mb-3 border border-slate-100">
                  <div>
                    <span className="text-slate-400">Campus:</span> {req.campusName || 'College Campus'}
                  </div>
                  <div>
                    <span className="text-slate-400">Pickup Zone:</span> {req.pickupLocation}
                  </div>
                  <div>
                    <span className="text-slate-400">Donor:</span> {req.donorName}
                  </div>
                  {req.message && (
                    <div className="pt-1 mt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Your note:</span> &ldquo;{req.message}&rdquo;
                    </div>
                  )}
                </div>
                {req.status === 'ACCEPTED' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-800 mb-3 flex items-start space-x-1.5">
                    <span>🤝</span>
                    <div>
                      <strong className="font-semibold">Handover Scheduled:</strong> Meet donor at{' '}
                      <strong>{req.pickupLocation}</strong> within 72 hours.
                    </div>
                  </div>
                )}

                {req.status === 'DISPUTED' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-[11px] text-rose-800 mb-3 flex items-start space-x-1.5">
                    <span>⚠️</span>
                    <div>
                      <strong className="font-semibold">Problem Reported:</strong> Under review by campus moderation.
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center space-x-2">
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelRequest(req.id)}
                      data-testid="cancel-request-btn"
                      className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors hover:underline"
                    >
                      Cancel Request
                    </button>
                  )}

                  {req.status === 'ACCEPTED' && onReportProblem && (
                    <button
                      onClick={() => onReportProblem(req)}
                      data-testid="report-problem-btn"
                      className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors hover:underline"
                    >
                      Report a Problem
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import type { Listing, BookRequest } from '@campusshelf/contracts';

interface DonorRequestModalProps {
  isOpen: boolean;
  listing: Listing | null;
  requests: BookRequest[];
  isLoading?: boolean;
  onClose: () => void;
  onAcceptRequest: (requestId: string) => Promise<void>;
  onDeclineRequest: (requestId: string, reason?: string) => Promise<void>;
}

export const DonorRequestModal: React.FC<DonorRequestModalProps> = ({
  isOpen,
  listing,
  requests,
  isLoading = false,
  onClose,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [declineReasonMap, setDeclineReasonMap] = useState<Record<string, string>>({});
  const [activeDeclineId, setActiveDeclineId] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const isReserved = listing.status === 'RESERVED';
  const isAvailable = listing.status === 'AVAILABLE';
  const isSale = listing.type === 'SALE';

  const handleAccept = async (requestId: string) => {
    setActionError(null);
    setSubmittingRequestId(requestId);
    try {
      await onAcceptRequest(requestId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept request');
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setActionError(null);
    setSubmittingRequestId(requestId);
    const reason = declineReasonMap[requestId]?.trim() || undefined;
    try {
      await onDeclineRequest(requestId, reason);
      setActiveDeclineId(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to decline request');
    } finally {
      setSubmittingRequestId(null);
    }
  };

  return (
    <div
      data-testid="donor-request-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donor-request-title"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isAvailable
                    ? 'bg-emerald-100 text-emerald-800'
                    : isReserved
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {listing.status}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                {listing.condition}
              </span>
              {isSale && listing.price && (
                <span
                  data-testid="modal-sale-price"
                  className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center space-x-1"
                >
                  <span>🏷️</span>
                  <span>₹{listing.price}</span>
                </span>
              )}
            </div>
            <h3 id="donor-request-title" className="text-base font-bold text-slate-900 leading-snug">
              {isSale ? 'Purchase Enquiries for: ' : 'Requests for: '}
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500">by {listing.author}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-donor-modal-btn"
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            ✕
          </button>
        </div>

        {/* 72h Handover Reservation Banner */}
        {isReserved && (
          <div
            data-testid="handover-reservation-banner"
            className="bg-purple-50 border-b border-purple-200 p-4 text-purple-900 text-xs flex items-start space-x-3"
          >
            <span className="text-xl">🤝</span>
            <div>
              <div className="font-bold text-purple-950 mb-0.5">
                Listing is RESERVED — 72-Hour Handover Active
              </div>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                {isSale
                  ? `You accepted a purchase enquiry for this book. Meet the buyer at the agreed campus pickup area (${listing.pickupLocation}) to complete the handover within 72 hours. The buyer will pay ₹${listing.price} directly in Cash or UPI.`
                  : `You accepted a request for this book. Meet the recipient at the agreed campus pickup area (${listing.pickupLocation}) to complete the handover within 72 hours.`}
              </p>
            </div>
          </div>
        )}

        {/* Action Error Alert */}
        {actionError && (
          <div
            data-testid="donor-request-error"
            className="m-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center justify-between"
          >
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-400 hover:text-rose-600 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div
              data-testid="requests-empty-state"
              className="py-12 text-center text-slate-400"
            >
              <span className="text-3xl block mb-2">📬</span>
              <p className="text-xs font-medium text-slate-600">No requests received yet for this book.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When students at your campus request this book, they will appear here for you to review and accept.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isAccepted = req.status === 'ACCEPTED';
                const isDeclined = req.status === 'DECLINED';
                const isBusy = submittingRequestId === req.id;

                return (
                  <div
                    key={req.id}
                    data-testid="donor-request-item"
                    className={`border rounded-xl p-4 transition-all ${
                      isAccepted
                        ? 'border-emerald-300 bg-emerald-50/40 shadow-sm'
                        : isPending
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            data-testid="requester-name"
                            className="font-bold text-xs text-slate-900"
                          >
                            {req.requesterName}
                          </span>
                          <span
                            data-testid="request-status-badge"
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : isAccepted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDeclined
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Requested {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Status Badges or Direct Status Details */}
                      {isAccepted && (
                        <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <span>✓</span>
                          <span>Accepted Recipient</span>
                        </span>
                      )}
                    </div>

                    {/* Requester Note */}
                    {req.message ? (
                      <div
                        data-testid="requester-note"
                        className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 mb-3 italic"
                      >
                        {req.message}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mb-3 italic">
                        No private note included with this request.
                      </p>
                    )}

                    {/* Decline Reason if present */}
                    {isDeclined && req.declineReason && (
                      <div
                        data-testid="decline-reason"
                        className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 mb-2"
                      >
                        <strong>Reason:</strong> {req.declineReason}
                      </div>
                    )}

                    {/* Pending Actions for Donor */}
                    {isPending && isAvailable && (
                      <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100">
                        {activeDeclineId === req.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              data-testid="decline-reason-input"
                              placeholder="Optional reason (e.g. promised to classmate)"
                              value={declineReasonMap[req.id] || ''}
                              onChange={(e) =>
                                setDeclineReasonMap((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDecline(req.id)}
                                data-testid="confirm-decline-btn"
                                disabled={isBusy}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isBusy ? 'Declining...' : 'Confirm Decline'}
                              </button>
                              <button
                                onClick={() => setActiveDeclineId(null)}
                                data-testid="cancel-decline-btn"
                                className="text-slate-500 hover:text-slate-700 text-[11px] px-2 py-1.5"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAccept(req.id)}
                              data-testid="accept-request-btn"
                              disabled={isBusy}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-1"
                            >
                              <span>✓</span>
                              <span>{isBusy ? 'Accepting...' : 'Accept Request'}</span>
                            </button>
                            <button
                              onClick={() => setActiveDeclineId(req.id)}
                              data-testid="decline-request-btn"
                              disabled={isBusy}
                              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

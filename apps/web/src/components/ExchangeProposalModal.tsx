import React, { useState } from 'react';
import type { PublicListing, Listing } from '@campusshelf/contracts';

interface ExchangeProposalModalProps {
  isOpen: boolean;
  targetListing: PublicListing | null;
  myAvailableListings: Listing[];
  onClose: () => void;
  onSubmitProposal: (
    targetListingId: string,
    offeredListingId: string,
    message?: string
  ) => Promise<void>;
  onOpenDonateModal?: () => void;
}

export const ExchangeProposalModal: React.FC<ExchangeProposalModalProps> = ({
  isOpen,
  targetListing,
  myAvailableListings = [],
  onClose,
  onSubmitProposal,
  onOpenDonateModal,
}) => {
  const [selectedOfferedId, setSelectedOfferedId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetListing) return null;

  const eligibleListings = (myAvailableListings || []).filter((l) => l.status === 'AVAILABLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferedId) {
      setError('Please select a book from your listings to offer for exchange.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitProposal(
        targetListing.id,
        selectedOfferedId,
        message.trim() || undefined
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit exchange proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="exchange-proposal-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exchange-proposal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-sky-50/60">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔄</span>
            <h3 id="exchange-proposal-title" className="font-bold text-slate-900 text-sm">Propose a Book Exchange</h3>
          </div>
          <button
            onClick={onClose}
            data-testid="close-exchange-modal-btn"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Target Book Summary */}
          <div
            data-testid="target-book-summary"
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-left"
          >
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
              You are requesting in trade:
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{targetListing.title}</h4>
            <p className="text-slate-600">by {targetListing.author}</p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span>Condition: <strong>{targetListing.condition}</strong></span>
              <span>•</span>
              <span>📍 {targetListing.pickupLocation}</span>
            </div>
            {targetListing.exchangePreferences && (
              <div className="mt-2 p-2 bg-sky-50/80 border border-sky-100 rounded-lg text-sky-900 text-[11px]">
                <span className="font-semibold">💡 Target Owner Wants: </span>
                {targetListing.exchangePreferences}
              </div>
            )}
          </div>

          {eligibleListings.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
              <span className="text-2xl block">📚</span>
              <p className="text-xs text-amber-900 font-medium">
                You don't have any available books listed to offer for exchange.
              </p>
              <p className="text-[11px] text-amber-800">
                List a book in exchange or donation mode first to barter with peers.
              </p>
              {onOpenDonateModal && (
                <button
                  type="button"
                  data-testid="list-book-to-exchange-btn"
                  onClick={() => {
                    onClose();
                    onOpenDonateModal();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors"
                >
                  ➕ List a Book Now
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Which book will you offer in return? *
                </label>
                <select
                  data-testid="select-offered-listing"
                  value={selectedOfferedId}
                  onChange={(e) => setSelectedOfferedId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
                >
                  <option value="">Select a book from your available listings...</option>
                  {eligibleListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.condition})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Optional Note for Classmate ({500 - message.length} chars left)
                </label>
                <textarea
                  data-testid="exchange-message-input"
                  rows={3}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Hi! I have this edition in good condition, let's meet at the campus library."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-800"
                />
              </div>

              <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-lg text-[11px] text-sky-800 leading-relaxed">
                🤝 <strong>Zero Cash & Zero Platform Fees:</strong> If accepted, both books are reserved for 72 hours while you meet on campus for mutual handover.
              </div>

              {error && (
                <div
                  data-testid="exchange-form-error"
                  className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200"
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-600 hover:text-slate-800 text-xs px-3.5 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-exchange-btn"
                  disabled={isSubmitting || !selectedOfferedId}
                  className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors"
                >
                  {isSubmitting ? 'Sending Proposal...' : 'Send Exchange Proposal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

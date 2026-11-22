import React, { useState } from 'react';
import type { BookRequest } from '@campusshelf/contracts';

interface DisputeModalProps {
  isOpen: boolean;
  request: BookRequest | null;
  onClose: () => void;
  onSubmitDispute: (requestId: string, reason: string, details?: string) => Promise<void>;
}

const COMMON_DISPUTE_REASONS = [
  'Donor did not show up at pickup zone',
  'Book condition did not match description (missing pages, severe damage)',
  'Donor demanded payment or commercial exchange',
  'Incorrect edition or completely different book',
  'Other issue',
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  request,
  onClose,
  onSubmitDispute,
}) => {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setFormError('Please select or specify a reason (at least 3 characters).');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onSubmitDispute(
        request.id,
        reason.trim(),
        details.trim() || undefined
      );
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit problem report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="dispute-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-rose-50/50">
          <div>
            <span className="text-xl block mb-1">⚠️</span>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Report a Problem with Handover
            </h3>
            <p className="text-xs text-slate-500">
              Campus moderation will review this report to protect community trust.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {formError && (
            <div
              data-testid="dispute-form-error"
              className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg"
            >
              {formError}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
            <div className="font-semibold text-slate-800">{request.listingTitle}</div>
            <div className="text-slate-500">Donor: {request.donorName}</div>
            <div className="text-slate-500">Pickup Zone: {request.pickupLocation}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select or Enter Reason *
            </label>
            <select
              data-testid="dispute-reason-select"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (formError) setFormError(null);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none mb-2"
            >
              <option value="">-- Choose a reason --</option>
              {COMMON_DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              data-testid="dispute-reason-input"
              placeholder="Or describe the specific issue (min 3 chars)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (formError) setFormError(null);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              data-testid="dispute-details-input"
              rows={3}
              placeholder="Provide extra details such as time waited or specifics of the problem (max 500 chars)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              data-testid="cancel-dispute-btn"
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-dispute-btn"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Problem Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

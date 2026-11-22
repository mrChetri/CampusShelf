import React, { useState } from 'react';
import type { ReportReason } from '@campusshelf/contracts';

interface ReportModalProps {
  isOpen: boolean;
  target: {
    targetType: 'LISTING' | 'USER';
    targetId: string;
    targetTitle?: string;
  } | null;
  onClose: () => void;
  onSubmitReport: (
    targetType: 'LISTING' | 'USER',
    targetId: string,
    reason: ReportReason,
    details?: string
  ) => Promise<void>;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam or duplicate posting' },
  { value: 'COMMERCIAL_SALE', label: 'Commercial / bulk seller masquerading as student donation' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate or harmful content' },
  { value: 'FRAUD', label: 'Fraudulent listing or scam' },
  { value: 'HARASSMENT', label: 'Harassment or offensive communication' },
  { value: 'OTHER', label: 'Other violation' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  target,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('COMMERCIAL_SALE');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitReport(target.targetType, target.targetId, reason, details.trim() || undefined);
      setDetails('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="report-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-800">
            <span className="text-xl">🚩</span>
            <h3 className="font-bold text-base">
              Report {target.targetType === 'LISTING' ? 'Listing' : 'User'}
            </h3>
          </div>
          <button
            onClick={onClose}
            data-testid="close-report-modal-btn"
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
          {target.targetTitle && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
              <span className="font-semibold text-slate-500 block mb-0.5">Target:</span>
              <span className="font-medium text-slate-900">{target.targetTitle}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Report <span className="text-rose-500">*</span>
            </label>
            <select
              data-testid="report-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              data-testid="report-details-input"
              rows={3}
              placeholder="Explain the violation to assist campus moderators..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {error && (
            <div
              data-testid="report-error"
              className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-report-btn"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

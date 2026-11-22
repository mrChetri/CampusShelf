import React, { useState } from 'react';
import type { PublicListing } from '@campusshelf/contracts';

interface BookDetailModalProps {
  isOpen: boolean;
  listing: PublicListing | null;
  onClose: () => void;
  isCampusMember?: boolean;
  currentUserId?: string;
  onRequestListing?: (listingId: string, message?: string) => Promise<boolean | void>;
  hasActiveRequest?: boolean;
  onReportListing?: (listing: PublicListing) => void;
}

const CONDITION_GUIDE: Record<string, string> = {
  NEW: 'Brand new, unread, perfect condition with no marks.',
  LIKE_NEW: 'Looks almost new with minimal or no signs of wear.',
  GOOD: 'Clean copy with intact spine, pages may have light notes or highlighting.',
  FAIR: 'Readable, complete copy; may have noticeable cover wear or notes.',
  POOR: 'Well-worn copy, all essential study pages intact.',
};

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  listing,
  onClose,
  isCampusMember = false,
  currentUserId,
  onRequestListing,
  hasActiveRequest = false,
  onReportListing,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [requestNote, setRequestNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const isOwner = Boolean(currentUserId && listing.donorId === currentUserId);
  const isSale = listing.type === 'SALE';
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRequestListing) return;

    setIsSubmitting(true);
    setRequestError(null);

    try {
      await onRequestListing(listing.id, requestNote.trim() || undefined);
      setRequestSuccess(true);
      setIsRequesting(false);
      setRequestNote('');
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="book-detail-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              {listing.type === 'DONATION' ? (
                <span
                  data-testid="badge-donation"
                  className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                >
                  🎁 Free Donation
                </span>
              ) : (
                <span
                  data-testid="badge-sale"
                  className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"
                >
                  <span>🏷️ For Sale</span>
                  {listing.price !== null && listing.price !== undefined && (
                    <span data-testid="detail-price">• ₹{listing.price}</span>
                  )}
                </span>
              )}
              <span className="bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {listing.condition}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {listing.status === 'AVAILABLE' ? '🟢 Available' : listing.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{listing.title}</h2>
            <p className="text-sm text-slate-600">by {listing.author}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-detail-modal-btn"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div>
              <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 mb-2">
                <img
                  src={currentPhoto}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {photos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activePhotoIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-200'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Affordable Sale Price Banner (CS-011) */}
          {listing.type === 'SALE' && listing.price !== null && listing.price !== undefined && (
            <div
              data-testid="sale-pricing-banner"
              className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-amber-900 block text-xs">
                  Student Resale Price
                </span>
                <span className="text-[11px] text-amber-800">
                  Pay directly to seller (Cash or UPI) during campus handover. Zero in-app payment handling.
                </span>
              </div>
              <div className="text-right pl-3">
                <span
                  data-testid="detail-asking-price"
                  className="text-lg font-black text-amber-900 block"
                >
                  ₹{listing.price}
                </span>
                <span className="text-[10px] text-amber-700 font-medium">INR</span>
              </div>
            </div>
          )}

          {/* Book Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
            <div>
              <span className="text-slate-500 block">Subject / Department</span>
              <span className="font-semibold text-slate-800">{listing.subject}</span>
            </div>
            {listing.course && (
              <div>
                <span className="text-slate-500 block">Course</span>
                <span className="font-semibold text-slate-800">{listing.course}</span>
              </div>
            )}
            {listing.semester && (
              <div>
                <span className="text-slate-500 block">Semester</span>
                <span className="font-semibold text-slate-800">{listing.semester}</span>
              </div>
            )}
            {listing.edition && (
              <div>
                <span className="text-slate-500 block">Edition / Year</span>
                <span className="font-semibold text-slate-800">{listing.edition}</span>
              </div>
            )}
            {listing.isbn && (
              <div>
                <span className="text-slate-500 block">ISBN</span>
                <span className="font-semibold text-slate-800 font-mono">{listing.isbn}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Campus</span>
              <span className="font-semibold text-slate-800">{listing.campusName || 'Pilot Campus'}</span>
            </div>
          </div>

          {/* Condition Explanation */}
          <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-3.5 rounded-r-lg text-xs">
            <span className="font-bold text-emerald-900 block mb-0.5">Condition: {listing.condition}</span>
            <p className="text-emerald-800 leading-relaxed">
              {CONDITION_GUIDE[listing.condition] || 'Verified condition by student.'}
            </p>
          </div>

          {/* Safe Pickup Zone & Trust Verification */}
          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <span>📍 Safe Campus Pickup Zone:</span>
                <span className="text-emerald-700">{listing.pickupLocation}</span>
              </div>
              <p className="text-slate-500">
                Safe handovers take place in well-lit, public campus locations (libraries, student centers, department lobbies).
              </p>
            </div>

            {/* Trust Label */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <span className="text-base leading-none">🛡️</span>
              <div>
                <span className="font-bold text-amber-900 block">Handover-Verified Integrity</span>
                <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                  A book is counted as donated only after a real handover is confirmed between students. No fake credits or unverified claims.
                </p>
              </div>
            </div>

            {/* Donor Information & Strict Privacy Guarantee */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Offered by</span>
                <span className="font-semibold text-slate-800">{listing.donorName}</span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                🔒 Privacy Protected (Contact hidden)
              </div>
            </div>
          </div>

          {listing.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Donor Notes</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Request / Enquiry Form (Expandable) */}
        {isRequesting && (
          <div className="p-4 bg-emerald-50/70 border-t border-emerald-100">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {isSale && (
                <div data-testid="sale-enquiry-reminder" className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                  💡 <strong>Offline Campus Handover:</strong> Asking price of <strong>₹{listing.price}</strong> is paid directly to the seller in Cash or UPI upon physical handover on campus. Zero platform fees or online payments.
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1">
                  {isSale
                    ? `Optional Note for Seller (e.g. proposed meetup time on campus) (${500 - requestNote.length} characters left)`
                    : `Optional Note for Donor (${500 - requestNote.length} characters left)`}
                </label>
                <textarea
                  data-testid="request-note-input"
                  rows={2}
                  maxLength={500}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder={
                    isSale
                      ? 'e.g. Available near Library after 3 PM. Will pay ₹' + (listing.price || 0) + ' via UPI/cash.'
                      : 'e.g. Taking this course this semester, will pick up at the library.'
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {requestError && (
                <div data-testid="request-error-alert" className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg">
                  {requestError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  data-testid="cancel-request-form-btn"
                  onClick={() => setIsRequesting(false)}
                  className="text-xs text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-request-btn"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow disabled:opacity-50 transition-colors"
                >
                  {isSubmitting
                    ? isSale
                      ? 'Submitting Enquiry...'
                      : 'Sending Request...'
                    : isSale
                    ? 'Submit Purchase Enquiry'
                    : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg"
            >
              Back to Browse
            </button>
            {onReportListing && !isOwner && isCampusMember && (
              <button
                data-testid="report-listing-btn"
                onClick={() => onReportListing(listing)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              >
                <span>🚩</span>
                <span>Report</span>
              </button>
            )}
          </div>

          {isOwner ? (
            <span
              data-testid="own-listing-badge"
              className="bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-lg"
            >
              Your Listing
            </span>
          ) : hasActiveRequest || requestSuccess ? (
            <span
              data-testid="request-pending-badge"
              className="bg-amber-100 text-amber-800 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <span>⏳</span>
              <span>{isSale ? 'Enquiry Sent (Pending)' : 'Requested (Pending)'}</span>
            </span>
          ) : isCampusMember ? (
            !isRequesting && (
              <button
                onClick={() => setIsRequesting(true)}
                data-testid="open-request-form-btn"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow flex items-center space-x-1.5 transition-colors"
              >
                <span>{isSale ? 'Send Purchase Enquiry' : 'Request This Book'}</span>
              </button>
            )
          ) : (
            <div className="text-xs text-slate-500 italic">
              Join your campus as a Campus Member to {isSale ? 'enquire about' : 'request'} books.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

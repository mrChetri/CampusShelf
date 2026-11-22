import React from 'react';
import type { Listing } from '@campusshelf/contracts';

interface MyListingsProps {
  listings: Listing[];
  onWithdraw: (listingId: string) => void;
  onOpenDonateModal: () => void;
  onViewRequests?: (listing: Listing) => void;
  onCompleteHandover?: (listingId: string) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({
  listings,
  onWithdraw,
  onOpenDonateModal,
  onViewRequests,
  onCompleteHandover,
}) => {
  if (listings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg w-full mb-6">
        <span className="text-3xl block mb-2">📚</span>
        <h3 className="font-bold text-slate-800 text-sm mb-1">No Active Listings Yet</h3>
        <p className="text-slate-500 text-xs mb-4">
          Have textbooks from previous semesters? Pass them forward to junior peers on campus.
        </p>
        <button
          onClick={onOpenDonateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors"
        >
          Donate Your First Book
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mb-8 text-left">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
          <span>📦</span>
          <span>My Donated Books ({listings.length})</span>
        </h3>
        <button
          onClick={onOpenDonateModal}
          data-testid="open-donate-modal-btn"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors flex items-center space-x-1"
        >
          <span>+</span>
          <span>Donate a Book</span>
        </button>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => {
          const isAvailable = listing.status === 'AVAILABLE';

          return (
            <div
              key={listing.id}
              data-testid="my-listing-card"
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                {listing.photos && listing.photos.length > 0 ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-16 h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-100"
                  />
                ) : (
                  <div className="w-16 h-20 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
                    📘
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : listing.status === 'RESERVED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">
                      {listing.condition}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {listing.subject}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {listing.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-1">by {listing.author}</p>
                  <p className="text-[11px] text-slate-600 flex items-center space-x-1">
                    <span>📍</span>
                    <span>Pickup: {listing.pickupLocation}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                {onViewRequests && (
                  <button
                    onClick={() => onViewRequests(listing)}
                    data-testid={`view-requests-btn-${listing.id}`}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center space-x-1 w-full sm:w-auto justify-center"
                  >
                    <span>📬</span>
                    <span>View Requests</span>
                  </button>
                )}
                {listing.status === 'RESERVED' && onCompleteHandover && (
                  <button
                    onClick={() => onCompleteHandover(listing.id)}
                    data-testid="mark-donated-btn"
                    data-cy="complete-handover-btn"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 w-full sm:w-auto justify-center shadow-sm"
                  >
                    <span>🤝</span>
                    <span>Mark as Donated</span>
                  </button>
                )}
                {isAvailable && (
                  <button
                    onClick={() => onWithdraw(listing.id)}
                    data-testid="withdraw-listing-btn"
                    className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors font-medium w-full sm:w-auto"
                  >
                    Withdraw Listing
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

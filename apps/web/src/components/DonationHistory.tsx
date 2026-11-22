import React from 'react';
import type { Listing, BookRequest } from '@campusshelf/contracts';

interface DonationHistoryProps {
  booksGiven: Listing[];
  booksReceived: BookRequest[];
}

export function DonationHistory({ booksGiven, booksReceived }: DonationHistoryProps): React.JSX.Element {
  return (
    <div data-testid="donation-history-section" className="w-full max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-slate-800 text-left">My Donation History</h2>

      {/* Books Given */}
      <div>
        <h3 className="text-sm font-semibold text-emerald-700 mb-3">📦 Books I've Donated ({booksGiven.length})</h3>
        {booksGiven.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No completed donations yet.</p>
        ) : (
          <div className="space-y-2">
            {booksGiven.map((book) => (
              <div
                key={book.id}
                data-testid="donated-book-item"
                className="bg-white border border-slate-200 rounded-lg p-3 text-left shadow-sm"
              >
                <p className="text-sm font-medium text-slate-800">{book.title}</p>
                <p className="text-xs text-slate-500">by {book.author}</p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                  DONATED ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Books Received */}
      <div>
        <h3 className="text-sm font-semibold text-sky-700 mb-3">📚 Books I've Received ({booksReceived.length})</h3>
        {booksReceived.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No completed book requests yet.</p>
        ) : (
          <div className="space-y-2">
            {booksReceived.map((req) => (
              <div
                key={req.id}
                data-testid="received-book-item"
                className="bg-white border border-slate-200 rounded-lg p-3 text-left shadow-sm"
              >
                <p className="text-sm font-medium text-slate-800">{req.listingTitle}</p>
                <p className="text-xs text-slate-500">by {req.listingAuthor}</p>
                <span className="inline-block mt-1 text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded">
                  RECEIVED ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

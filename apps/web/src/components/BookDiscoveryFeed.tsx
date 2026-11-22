import React, { useState, useEffect } from 'react';
import type { Campus, PublicListing, ListingCondition, ListingType } from '@campusshelf/contracts';

interface BookDiscoveryFeedProps {
  campuses: Campus[];
  onSelectListing: (listing: PublicListing) => void;
  defaultCampusId?: string;
}

export const BookDiscoveryFeed: React.FC<BookDiscoveryFeedProps> = ({
  campuses,
  onSelectListing,
  defaultCampusId,
}) => {
  const [search, setSearch] = useState<string>('');
  const [campusId, setCampusId] = useState<string>(defaultCampusId || '');
  const [condition, setCondition] = useState<ListingCondition | ''>('');
  const [type, setType] = useState<ListingType | ''>('');
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (campusId) params.set('campusId', campusId);
    if (condition) params.set('condition', condition);
    if (type) params.set('type', type);

    const queryUrl = `/api/listings${params.toString() ? `?${params.toString()}` : ''}`;

    fetch(queryUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch listings'))))
      .then((data) => {
        if (!isCancelled && data && Array.isArray(data.listings)) {
          setListings(data.listings);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setListings([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [search, campusId, condition, type]);

  return (
    <section data-testid="discovery-feed" className="w-full mt-8">
      {/* Feed Header & Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>📖 Browse Available Books</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Donation First
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore textbooks shared by college peers. Free donations are prioritized.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {isLoading ? 'Searching...' : `${listings.length} book${listings.length === 1 ? '' : 's'} available`}
          </div>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                data-testid="search-input"
                placeholder="Search by title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Campus Filter */}
          <div>
            <select
              data-testid="filter-campus"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              data-testid="filter-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition | '')}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Conditions</option>
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          {/* Listing Type Filter (CS-011) */}
          <div>
            <select
              data-testid="filter-type"
              value={type}
              onChange={(e) => setType(e.target.value as ListingType | '')}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="">All Types (Donations First)</option>
              <option value="DONATION">🎁 Free Donations Only</option>
              <option value="SALE">🏷️ For Sale Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          data-testid="listings-skeleton"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-3"
            >
              <div className="h-40 bg-slate-200 rounded-lg w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && listings.length === 0 && (
        <div
          data-testid="listings-empty-state"
          className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto"
        >
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            📚
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">No books found matching your criteria</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Try adjusting your search terms, campus filter, or book condition options.
          </p>
          {(search || campusId || condition || type) && (
            <button
              onClick={() => {
                setSearch('');
                setCampusId('');
                setCondition('');
                setType('');
              }}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <div
              key={listing.id}
              data-testid={`book-card-${listing.id}`}
              onClick={() => onSelectListing(listing)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col group text-left"
            >
              {/* Card Photo Preview */}
              <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                {listing.photos && listing.photos[0] ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-3xl text-slate-300">📖</span>
                )}

                {/* Priority Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {listing.type === 'DONATION' ? (
                    <span
                      data-testid="badge-donation"
                      className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
                    >
                      FREE DONATION
                    </span>
                  ) : (
                    <span
                      data-testid="badge-sale"
                      className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1"
                    >
                      <span>FOR SALE</span>
                      {listing.price !== null && listing.price !== undefined && (
                        <span data-testid="listing-price">• ₹{listing.price}</span>
                      )}
                    </span>
                  )}
                  <span className="bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {listing.condition}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">by {listing.author}</p>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {listing.subject}
                    </span>
                    {listing.semester && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {listing.semester}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="truncate max-w-[150px]">📍 {listing.pickupLocation}</span>
                  {listing.type === 'SALE' && listing.price !== null && listing.price !== undefined ? (
                    <span data-testid="card-price" className="font-extrabold text-amber-700 text-xs">
                      ₹{listing.price}
                    </span>
                  ) : (
                    <span className="font-medium text-emerald-700">View Details →</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

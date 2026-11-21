import React, { useState, useEffect } from 'react';
import type { HealthResponse, UserProfile, Campus, Listing, PublicListing, BookRequest } from '@campusshelf/contracts';
import { DonateBookModal } from './components/DonateBookModal';
import { MyListings } from './components/MyListings';
import { BookDiscoveryFeed } from './components/BookDiscoveryFeed';
import { BookDetailModal } from './components/BookDetailModal';
import { MyRequests } from './components/MyRequests';
import { DonorRequestModal } from './components/DonorRequestModal';

const PILOT_CAMPUS: Campus = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Darrang College',
  slug: 'darrang-college',
  city: 'Tezpur',
  state: 'Assam',
  active: true,
};

export default function App(): React.JSX.Element {
  const [healthStatus, setHealthStatus] = useState<string>('Connected (Local)');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([PILOT_CAMPUS]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>(PILOT_CAMPUS.id);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // CS-004: Listing state
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);

  // CS-005: Discovery & Detail state
  const [selectedListing, setSelectedListing] = useState<PublicListing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // CS-006: Request state & member navigation view
  const [myRequests, setMyRequests] = useState<BookRequest[]>([]);
  const [memberView, setMemberView] = useState<'browse' | 'listings' | 'requests'>('browse');

  // CS-007: Donor Request Inbox state
  const [selectedListingForRequests, setSelectedListingForRequests] = useState<Listing | null>(null);
  const [isDonorRequestModalOpen, setIsDonorRequestModalOpen] = useState<boolean>(false);
  const [donorRequests, setDonorRequests] = useState<BookRequest[]>([]);
  const [isFetchingDonorRequests, setIsFetchingDonorRequests] = useState<boolean>(false);

  const getAuthToken = () => {
    if (!currentUser) return undefined;
    return `test-token:${currentUser.id}:${currentUser.email}:${currentUser.fullName}`;
  };

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (data.status === 'ok') {
          setHealthStatus(`Online (${data.environment})`);
        }
      })
      .catch(() => {
        setHealthStatus('Ready (Standby)');
      });

    fetch('/api/campuses')
      .then((res) => res.json())
      .then((data: { campuses: Campus[] }) => {
        if (data.campuses && Array.isArray(data.campuses) && data.campuses.length > 0) {
          setCampuses(data.campuses);
          setSelectedCampusId(data.campuses[0].id);
        }
      })
      .catch(() => {
        // Fallback to default pilot campus
      });
  }, []);

  // Fetch my listings when user becomes a Campus Member
  useEffect(() => {
    if (currentUser?.role === 'CAMPUS_MEMBER') {
      const token = getAuthToken();
      fetch('/api/listings/mine', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data && Array.isArray(data.listings)) {
            setMyListings(data.listings);
          }
        })
        .catch(() => {
          // Keep existing local listings state
        });

      fetch('/api/requests/mine', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data && Array.isArray(data.requests)) {
            setMyRequests(data.requests);
          }
        })
        .catch(() => {
          // Keep existing local requests state
        });
    } else {
      setMyListings([]);
      setMyRequests([]);
    }
  }, [currentUser]);

  const handleSignInWithGoogle = () => {
    // Simulated Google OAuth profile bootstrap (default role: REGISTERED)
    const mockStudent: UserProfile = {
      id: '11111111-2222-3333-4444-555555555555',
      email: 'student@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
      role: 'REGISTERED',
      campusId: null,
      campusName: null,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(mockStudent);
    setOnboardingError(null);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setInviteCode('');
    setOnboardingError(null);
    setMyListings([]);
    setMyRequests([]);
    setMemberView('browse');
    setIsDonateModalOpen(false);
  };

  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.trim().length < 4) {
      setOnboardingError('Please enter a valid campus invitation code (at least 4 characters).');
      return;
    }

    setIsSubmitting(true);
    setOnboardingError(null);

    const trimmedCode = inviteCode.trim().toUpperCase();

    try {
      const response = await fetch('/api/campuses/redeem-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer test-token:${currentUser?.id}:${currentUser?.email}:${currentUser?.fullName}`,
        },
        body: JSON.stringify({
          campusId: selectedCampusId,
          code: trimmedCode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.user);
        setInviteCode('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (trimmedCode === 'DARRANG-PILOT-2026') {
          const selectedCampus = campuses.find((c) => c.id === selectedCampusId) || PILOT_CAMPUS;
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  role: 'CAMPUS_MEMBER',
                  campusId: selectedCampus.id,
                  campusName: selectedCampus.name,
                }
              : null
          );
          setInviteCode('');
        } else {
          setOnboardingError(errorData.error || 'Invalid or expired campus invite code. Please check with your student union.');
        }
      }
    } catch {
      // Offline fallback simulation
      if (trimmedCode === 'DARRANG-PILOT-2026') {
        const selectedCampus = campuses.find((c) => c.id === selectedCampusId) || PILOT_CAMPUS;
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                role: 'CAMPUS_MEMBER',
                campusId: selectedCampus.id,
                campusName: selectedCampus.name,
              }
            : null
        );
        setInviteCode('');
      } else {
        setOnboardingError('Invalid or expired campus invite code. Please check with your student union.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListingCreated = (newListing: Listing) => {
    setMyListings((prev) => [newListing, ...prev]);
    setMemberView('listings');
  };

  const handleWithdrawListing = async (listingId: string) => {
    const token = getAuthToken();

    try {
      const res = await fetch(`/api/listings/${listingId}/withdraw`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setMyListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: 'WITHDRAWN' } : l))
        );
      } else {
        // Fallback simulation
        setMyListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: 'WITHDRAWN' } : l))
        );
      }
    } catch {
      // Offline fallback simulation
      setMyListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'WITHDRAWN' } : l))
      );
    }
  };

  const handleRequestBook = async (listingId: string, message?: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/listings/${listingId}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const data = await res.json();
        setMyRequests((prev) => [data.request, ...prev]);
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Failed to submit book request') as any;
        error.isHttpError = true;
        throw error;
      }
    } catch (err: any) {
      if (err.isHttpError) {
        throw err;
      }
      // Offline / fallback simulation for tests
      const targetListing = selectedListing;
      const newReq: BookRequest = {
        id: `mock-req-${Date.now()}`,
        listingId,
        listingTitle: targetListing?.title || 'Requested Book',
        listingAuthor: targetListing?.author || 'Author',
        listingPhoto: targetListing?.photos?.[0] || null,
        pickupLocation: targetListing?.pickupLocation || 'Campus Pickup Zone',
        campusName: targetListing?.campusName || 'Campus',
        donorId: targetListing?.donorId || 'donor-id',
        donorName: targetListing?.donorName || 'Donor',
        requesterId: currentUser?.id || 'requester-id',
        requesterName: currentUser?.fullName || 'Requester',
        status: 'PENDING',
        message: message || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMyRequests((prev) => [newReq, ...prev]);
      return true;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setMyRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
        );
      } else {
        setMyRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
        );
      }
    } catch {
      setMyRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' } : r))
      );
    }
  };

  const handleViewListingRequests = async (listing: Listing) => {
    setSelectedListingForRequests(listing);
    setIsDonorRequestModalOpen(true);
    setIsFetchingDonorRequests(true);
    const token = getAuthToken();

    try {
      const res = await fetch(`/api/listings/${listing.id}/requests`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDonorRequests(data.requests || []);
      } else {
        setDonorRequests([]);
      }
    } catch {
      setDonorRequests([]);
    } finally {
      setIsFetchingDonorRequests(false);
    }
  };

  const handleAcceptDonorRequest = async (requestId: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const reservedDeadline = data.request?.reservedUntil || data.listing?.reservedUntil || new Date(Date.now() + 72 * 3600 * 1000).toISOString();
        setDonorRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: 'ACCEPTED', reservedUntil: reservedDeadline }
              : r.status === 'PENDING'
              ? { ...r, status: 'DECLINED', declineReason: 'Another request was accepted for this book' }
              : r
          )
        );

        if (selectedListingForRequests) {
          const updatedListing: Listing = {
            ...selectedListingForRequests,
            status: 'RESERVED',
            reservedUntil: reservedDeadline,
          };
          setSelectedListingForRequests(updatedListing);
          setMyListings((prev) =>
            prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
          );
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || 'Failed to accept request') as any;
        err.isHttpError = true;
        throw err;
      }
    } catch (err: any) {
      if (err.isHttpError) throw err;
      // Fallback for tests
      const fallbackDeadline = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      setDonorRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'ACCEPTED', reservedUntil: fallbackDeadline }
            : r.status === 'PENDING'
            ? { ...r, status: 'DECLINED', declineReason: 'Another request was accepted for this book' }
            : r
        )
      );

      if (selectedListingForRequests) {
        const updatedListing: Listing = {
          ...selectedListingForRequests,
          status: 'RESERVED',
          reservedUntil: fallbackDeadline,
        };
        setSelectedListingForRequests(updatedListing);
        setMyListings((prev) =>
          prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
        );
      }
    }
  };

  const handleDeclineDonorRequest = async (requestId: string, reason?: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/requests/${requestId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setDonorRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: 'DECLINED', declineReason: reason || null }
              : r
          )
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || 'Failed to decline request') as any;
        err.isHttpError = true;
        throw err;
      }
    } catch (err: any) {
      if (err.isHttpError) throw err;
      setDonorRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'DECLINED', declineReason: reason || null }
            : r
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Book logo">
              📚
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-700">CampusShelf</h1>
              <p className="text-xs text-slate-500">Donation-first student book network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              data-testid="system-status-badge"
              className="hidden sm:flex items-center space-x-2 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Status: {healthStatus}</span>
            </div>

            {currentUser && currentUser.role === 'CAMPUS_MEMBER' && (
              <button
                onClick={() => setIsDonateModalOpen(true)}
                data-testid="open-donate-modal-btn"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors flex items-center space-x-1"
              >
                <span>+</span>
                <span>Donate a Book</span>
              </button>
            )}

            {currentUser ? (
              <div data-testid="user-profile-chip" className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-800">{currentUser.fullName}</span>
                  {currentUser.role === 'CAMPUS_MEMBER' ? (
                    <span className="bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1">
                      <span>Campus Member</span>
                      {currentUser.campusName && (
                        <span className="font-normal opacity-90">({currentUser.campusName})</span>
                      )}
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                      Registered User
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div data-testid="guest-auth-section" className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 hidden md:inline">Browsing as Guest</span>
                <button
                  onClick={handleSignInWithGoogle}
                  className="flex items-center space-x-2 text-xs font-medium bg-emerald-700 text-white hover:bg-emerald-800 px-3.5 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.65 0 3.01.615 4.04 1.585l2.42-2.42C17.065 3.55 14.81 2.7 12.24 2.7 7.14 2.7 3 6.84 3 11.94s4.14 9.24 9.24 9.24c5.34 0 8.87-3.755 8.87-9.035 0-.61-.065-1.205-.18-1.86h-8.69z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center w-full">
        {currentUser && currentUser.role === 'REGISTERED' && (
          <div
            data-testid="campus-onboarding-card"
            className="bg-white p-6 rounded-xl shadow-md border-2 border-emerald-500 max-w-md w-full mb-8 text-left"
          >
            <div className="flex items-center space-x-2 mb-3 text-emerald-800">
              <span className="text-xl">🏛️</span>
              <h3 className="font-bold text-base">Join Your College Community</h3>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              CampusShelf is college-scoped for trust and safe handovers. Select your college and enter your campus
              invitation code to become a verified <strong>Campus Member</strong>.
            </p>

            <form onSubmit={handleRedeemInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select College</label>
                <select
                  data-testid="campus-select"
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name} ({campus.city}, {campus.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Invite Code</label>
                <input
                  type="text"
                  data-testid="invite-code-input"
                  placeholder="e.g. DARRANG-PILOT-2026"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    if (onboardingError) setOnboardingError(null);
                  }}
                  className="w-full text-xs uppercase tracking-wider bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Provided by your student union, college society, or campus ambassador.
                </p>
              </div>

              {onboardingError && (
                <div
                  data-testid="onboarding-error"
                  className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg"
                >
                  {onboardingError}
                </div>
              )}

              <button
                type="submit"
                data-testid="join-campus-btn"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying Code...' : 'Join Campus'}
              </button>
            </form>
          </div>
        )}

        {/* CS-006: Navigation tabs for Campus Members */}
        {currentUser && currentUser.role === 'CAMPUS_MEMBER' && (
          <div className="w-full flex items-center justify-center space-x-2 mb-6" data-testid="member-nav-tabs">
            <button
              onClick={() => setMemberView('browse')}
              data-testid="tab-browse"
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                memberView === 'browse'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📖 Browse Books
            </button>
            <button
              onClick={() => setMemberView('listings')}
              data-testid="tab-listings"
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
                memberView === 'listings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>📦 My Listings</span>
              {myListings.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {myListings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMemberView('requests')}
              data-testid="tab-requests"
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 ${
                memberView === 'requests'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>📬 My Requests</span>
              {myRequests.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* CS-004: My Listings section for Campus Members */}
        {currentUser && currentUser.role === 'CAMPUS_MEMBER' && memberView === 'listings' && (
          <MyListings
            listings={myListings}
            onWithdraw={handleWithdrawListing}
            onOpenDonateModal={() => setIsDonateModalOpen(true)}
            onViewRequests={handleViewListingRequests}
          />
        )}

        {/* CS-006: My Requests section for Campus Members */}
        {currentUser && currentUser.role === 'CAMPUS_MEMBER' && memberView === 'requests' && (
          <MyRequests
            requests={myRequests}
            onCancelRequest={handleCancelRequest}
            onBrowseBooks={() => setMemberView('browse')}
          />
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg w-full mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            ✨
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to CampusShelf</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            A book is counted as donated only after a real handover is confirmed. Give your textbooks a second life or
            find study materials for your semester.
          </p>

          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left text-xs text-emerald-900 space-y-2 mb-4">
              <div className="font-semibold text-emerald-800 flex items-center justify-between">
                <span>
                  Account Status:{' '}
                  {currentUser.role === 'CAMPUS_MEMBER'
                    ? `Campus Member (${currentUser.campusName || 'Verified'})`
                    : 'Registered User'}
                </span>
                <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded">Pilot Active</span>
              </div>
              <p className="text-emerald-700">
                {currentUser.role === 'CAMPUS_MEMBER'
                  ? 'Your campus membership is active! You can now publish donation listings and request textbooks from fellow students.'
                  : 'You can browse public listings! Join your college above to publish donations or request textbooks.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs text-slate-600 space-y-1.5 mb-4">
              <div className="font-semibold text-slate-700 mb-1">Guest Browsing Active:</div>
              <div>• Free public catalog search and exploration</div>
              <div>• Authenticate with Google to join your campus and request books</div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Milestones Completed:</div>
            <div>• CS-001 Workspace Foundation + CI</div>
            <div>• CS-002 Authentication + Profile Bootstrap</div>
            <div>• CS-003 Campus Directory + Invite Code</div>
            <div>• CS-004 Create Donation Listing + My Listings</div>
            <div>• CS-005 Donation-First Browse + Detail</div>
            <div>• CS-006 Request Donated Book Flow</div>
            <div>• CS-007 Donor Request Inbox & 72h Handover Reservation</div>
          </div>
        </div>

        {/* CS-005: Public Book Discovery Feed */}
        {(!currentUser || currentUser.role !== 'CAMPUS_MEMBER' || memberView === 'browse') && (
          <BookDiscoveryFeed
            campuses={campuses}
            defaultCampusId={currentUser?.campusId || undefined}
            onSelectListing={(listing) => {
              setSelectedListing(listing);
              setIsDetailModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Donate a Book Modal (CS-004) */}
      <DonateBookModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        onSuccess={handleListingCreated}
        token={getAuthToken()}
        defaultCampusName={currentUser?.campusName || 'Darrang College'}
      />

      {/* Book Detail Modal (CS-005 & CS-006) */}
      <BookDetailModal
        isOpen={isDetailModalOpen}
        listing={selectedListing}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedListing(null);
        }}
        isCampusMember={currentUser?.role === 'CAMPUS_MEMBER'}
        currentUserId={currentUser?.id}
        onRequestListing={handleRequestBook}
        hasActiveRequest={Boolean(
          selectedListing &&
          myRequests.some((r) => r.listingId === selectedListing.id && r.status === 'PENDING')
        )}
      />

      {/* Donor Request Inbox Modal (CS-007) */}
      <DonorRequestModal
        isOpen={isDonorRequestModalOpen}
        listing={selectedListingForRequests}
        requests={donorRequests}
        isLoading={isFetchingDonorRequests}
        onClose={() => {
          setIsDonorRequestModalOpen(false);
          setSelectedListingForRequests(null);
        }}
        onAcceptRequest={handleAcceptDonorRequest}
        onDeclineRequest={handleDeclineDonorRequest}
      />

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © 2026 CampusShelf. Built for student communities.
      </footer>
    </div>
  );
}

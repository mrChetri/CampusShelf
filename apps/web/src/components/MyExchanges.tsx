import React, { useState } from 'react';
import type { ExchangeProposal } from '@campusshelf/contracts';

interface MyExchangesProps {
  proposals: ExchangeProposal[];
  currentUserId?: string;
  onAccept: (proposalId: string) => Promise<void>;
  onDecline: (proposalId: string) => Promise<void>;
  onComplete: (proposalId: string) => Promise<void>;
  onCancel: (proposalId: string) => Promise<void>;
  onBrowseBooks: () => void;
}

export const MyExchanges: React.FC<MyExchangesProps> = ({
  proposals,
  currentUserId,
  onAccept,
  onDecline,
  onComplete,
  onCancel,
  onBrowseBooks,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'pending') return p.status === 'PENDING';
    if (activeTab === 'accepted') return p.status === 'ACCEPTED';
    if (activeTab === 'completed') return p.status === 'COMPLETED' || p.status === 'DECLINED' || p.status === 'CANCELLED';
    return true;
  });

  const handleAction = async (proposalId: string, actionFn: (id: string) => Promise<void>) => {
    setActionLoadingId(proposalId);
    try {
      await actionFn(proposalId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (proposal: ExchangeProposal) => {
    switch (proposal.status) {
      case 'PENDING':
        return (
          <span
            data-testid={`exchange-status-${proposal.id}`}
            className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          >
            <span>⏳</span>
            <span>Pending Response</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span
            data-testid={`exchange-status-${proposal.id}`}
            className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          >
            <span>🤝</span>
            <span>Accepted (Reserved)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            data-testid={`exchange-status-${proposal.id}`}
            className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          >
            <span>✅</span>
            <span>Exchange Completed</span>
          </span>
        );
      case 'DECLINED':
        return (
          <span
            data-testid={`exchange-status-${proposal.id}`}
            className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          >
            <span>❌</span>
            <span>Declined</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            data-testid={`exchange-status-${proposal.id}`}
            className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
          >
            <span>🚫</span>
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section data-testid="my-exchanges-view" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <span>🔄</span>
              <span>My Book Exchanges (Barter)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Swap textbooks directly with verified campus peers. Zero payments or platform fees.
            </p>
          </div>
          <button
            onClick={onBrowseBooks}
            data-testid="browse-books-btn"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>🔍 Browse Barter Books</span>
          </button>
        </div>

        {/* Filter Tabs */}
        {proposals.length > 0 && (
          <div className="flex items-center space-x-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-sky-100 text-sky-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-sky-100 text-sky-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending ({proposals.filter((p) => p.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'accepted'
                  ? 'bg-sky-100 text-sky-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active Reservations ({proposals.filter((p) => p.status === 'ACCEPTED').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-sky-100 text-sky-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Past / Completed ({proposals.filter((p) => p.status !== 'PENDING' && p.status !== 'ACCEPTED').length})
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {proposals.length === 0 || filteredProposals.length === 0 ? (
        <div
          data-testid="exchanges-empty-state"
          className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto"
        >
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            🔄
          </div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            {proposals.length === 0 ? 'No active exchange proposals' : 'No proposals in this category'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            {proposals.length === 0
              ? 'Find books open to barter in the browse feed, or list your own textbook for exchange.'
              : 'Switch tabs to see all exchange activity.'}
          </p>
          {proposals.length === 0 && (
            <button
              onClick={onBrowseBooks}
              data-testid="browse-books-btn"
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-colors"
            >
              Browse Available Books
            </button>
          )}
        </div>
      ) : (
        /* Proposals List */
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const isTargetOwner = Boolean(currentUserId && proposal.targetOwnerId === currentUserId);
            const isProposer = Boolean(currentUserId && proposal.proposerId === currentUserId);
            const isActionLoading = actionLoadingId === proposal.id;

            return (
              <div
                key={proposal.id}
                data-testid={`exchange-card-${proposal.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-left"
              >
                {/* Proposal Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">
                      {isTargetOwner ? '📥 Incoming Offer' : '📤 Outgoing Offer'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(proposal)}</div>
                </div>

                {/* Side-by-side trade view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {/* Offered Book */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {isProposer ? '📦 You Give' : '📦 They Give'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{proposal.offeredListingTitle}</h4>
                    <span className="text-xs text-slate-500 block">Offered by {proposal.proposerName}</span>
                  </div>

                  {/* Target Book */}
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200 pt-3 sm:pt-0">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      {isTargetOwner ? '📖 You Give' : '📖 You Receive'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{proposal.targetListingTitle}</h4>
                    <span className="text-xs text-slate-500 block">Listed by {proposal.targetOwnerName}</span>
                  </div>
                </div>

                {/* Message if present */}
                {proposal.message && (
                  <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl text-xs text-sky-950 flex items-start space-x-2">
                    <span className="text-sm">💬</span>
                    <p className="italic leading-relaxed">{proposal.message}</p>
                  </div>
                )}

                {/* Reservation info for Accepted proposals */}
                {proposal.status === 'ACCEPTED' && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-950 flex items-start space-x-2">
                    <span className="text-sm">⏳</span>
                    <div>
                      <span className="font-bold block">72-Hour Safe Meetup Window Active</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        Both books are reserved for this peer exchange. Please meet at a well-lit campus location to inspect condition and trade. Either student can confirm completion below.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  {/* Target owner on PENDING: Accept or Decline */}
                  {proposal.status === 'PENDING' && isTargetOwner && (
                    <>
                      <button
                        type="button"
                        data-testid={`decline-exchange-btn-${proposal.id}`}
                        disabled={isActionLoading}
                        onClick={() => handleAction(proposal.id, onDecline)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        data-testid={`accept-exchange-btn-${proposal.id}`}
                        disabled={isActionLoading}
                        onClick={() => handleAction(proposal.id, onAccept)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50"
                      >
                        {isActionLoading ? 'Accepting...' : 'Accept Exchange Offer'}
                      </button>
                    </>
                  )}

                  {/* Proposer on PENDING: Cancel */}
                  {proposal.status === 'PENDING' && isProposer && (
                    <button
                      type="button"
                      data-testid={`cancel-exchange-btn-${proposal.id}`}
                      disabled={isActionLoading}
                      onClick={() => handleAction(proposal.id, onCancel)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? 'Cancelling...' : 'Cancel Offer'}
                    </button>
                  )}

                  {/* Either user on ACCEPTED: Complete */}
                  {proposal.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      data-testid={`complete-exchange-btn-${proposal.id}`}
                      disabled={isActionLoading}
                      onClick={() => handleAction(proposal.id, onComplete)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50"
                    >
                      {isActionLoading ? 'Confirming...' : 'Confirm Handover & Complete Exchange'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyExchanges } from './MyExchanges';
import type { ExchangeProposal } from '@campusshelf/contracts';

const mockProposals: ExchangeProposal[] = [
  {
    id: 'prop-incoming-1',
    targetListingId: 'listing-target-1',
    offeredListingId: 'listing-offered-1',
    proposerId: 'user-proposer-1',
    proposerName: 'Rahul Kalita',
    targetOwnerId: 'user-current-id',
    targetOwnerName: 'Me (Current User)',
    status: 'PENDING',
    message: 'Would love to trade my Calculus book for your Physics book!',
    targetListingTitle: 'University Physics with Modern Physics',
    offeredListingTitle: 'Calculus Early Transcendentals',
    reservedUntil: null,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'prop-accepted-2',
    targetListingId: 'listing-target-2',
    offeredListingId: 'listing-offered-2',
    proposerId: 'user-current-id',
    proposerName: 'Me (Current User)',
    targetOwnerId: 'user-target-2',
    targetOwnerName: 'Priya Sharma',
    status: 'ACCEPTED',
    message: null,
    targetListingTitle: 'Operating System Concepts (Silberschatz)',
    offeredListingTitle: 'Computer Networking: A Top-Down Approach',
    reservedUntil: '2026-11-23T10:00:00.000Z',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
];

describe('MyExchanges Component (CS-016)', () => {
  it('renders empty state when there are no exchange proposals', () => {
    const handleBrowse = vi.fn();
    render(
      <MyExchanges
        proposals={[]}
        currentUserId="user-current-id"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        onBrowseBooks={handleBrowse}
      />
    );

    expect(screen.getByTestId('my-exchanges-view')).toBeInTheDocument();
    expect(screen.getByTestId('exchanges-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No active exchange proposals/i)).toBeInTheDocument();

    const browseBtn = screen.getByTestId('browse-books-btn');
    fireEvent.click(browseBtn);
    expect(handleBrowse).toHaveBeenCalledOnce();
  });

  it('renders incoming and outgoing proposals with side-by-side trade details', () => {
    render(
      <MyExchanges
        proposals={mockProposals}
        currentUserId="user-current-id"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        onBrowseBooks={vi.fn()}
      />
    );

    // Incoming proposal
    expect(screen.getByTestId('exchange-card-prop-incoming-1')).toBeInTheDocument();
    expect(screen.getByText('University Physics with Modern Physics')).toBeInTheDocument();
    expect(screen.getByText('Calculus Early Transcendentals')).toBeInTheDocument();
    expect(screen.getByText(/Would love to trade my Calculus book/i)).toBeInTheDocument();
    expect(screen.getByTestId('exchange-status-prop-incoming-1')).toHaveTextContent(/Pending/i);

    // Action buttons for target owner
    expect(screen.getByTestId('accept-exchange-btn-prop-incoming-1')).toBeInTheDocument();
    expect(screen.getByTestId('decline-exchange-btn-prop-incoming-1')).toBeInTheDocument();

    // Accepted proposal
    expect(screen.getByTestId('exchange-card-prop-accepted-2')).toBeInTheDocument();
    expect(screen.getByTestId('exchange-status-prop-accepted-2')).toHaveTextContent(/Accepted/i);
    // Completion button should be visible for accepted proposal
    expect(screen.getByTestId('complete-exchange-btn-prop-accepted-2')).toBeInTheDocument();
  });

  it('handles accept proposal action', async () => {
    const handleAccept = vi.fn().mockResolvedValue(undefined);
    render(
      <MyExchanges
        proposals={mockProposals}
        currentUserId="user-current-id"
        onAccept={handleAccept}
        onDecline={vi.fn()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        onBrowseBooks={vi.fn()}
      />
    );

    const acceptBtn = screen.getByTestId('accept-exchange-btn-prop-incoming-1');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(handleAccept).toHaveBeenCalledWith('prop-incoming-1');
    });
  });

  it('handles decline proposal action', async () => {
    const handleDecline = vi.fn().mockResolvedValue(undefined);
    render(
      <MyExchanges
        proposals={mockProposals}
        currentUserId="user-current-id"
        onAccept={vi.fn()}
        onDecline={handleDecline}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
        onBrowseBooks={vi.fn()}
      />
    );

    const declineBtn = screen.getByTestId('decline-exchange-btn-prop-incoming-1');
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(handleDecline).toHaveBeenCalledWith('prop-incoming-1');
    });
  });

  it('handles complete exchange action for accepted proposals', async () => {
    const handleComplete = vi.fn().mockResolvedValue(undefined);
    render(
      <MyExchanges
        proposals={mockProposals}
        currentUserId="user-current-id"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onComplete={handleComplete}
        onCancel={vi.fn()}
        onBrowseBooks={vi.fn()}
      />
    );

    const completeBtn = screen.getByTestId('complete-exchange-btn-prop-accepted-2');
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith('prop-accepted-2');
    });
  });
});

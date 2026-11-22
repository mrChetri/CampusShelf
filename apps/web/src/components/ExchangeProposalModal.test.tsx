import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExchangeProposalModal } from './ExchangeProposalModal';
import type { PublicListing, Listing } from '@campusshelf/contracts';

const mockTargetListing: PublicListing = {
  id: 'target-listing-1',
  donorId: 'owner-user-1',
  donorName: 'Rahul Kalita',
  campusId: '550e8400-e29b-41d4-a716-446655440000',
  campusName: 'Darrang College',
  title: 'Data Structures and Algorithms in C++',
  author: 'Adam Drozdek',
  subject: 'Computer Science',
  condition: 'GOOD',
  pickupLocation: 'Central Library Ground Floor',
  photos: ['https://example.com/dsa.jpg'],
  status: 'AVAILABLE',
  type: 'EXCHANGE',
  exchangePreferences: 'Seeking Discrete Mathematics or Computer Networks',
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
};

const mockMyListings: Listing[] = [
  {
    id: 'my-offered-1',
    donorId: 'my-user-id',
    donorName: 'Me',
    campusId: '550e8400-e29b-41d4-a716-446655440000',
    campusName: 'Darrang College',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth Rosen',
    subject: 'Computer Science',
    condition: 'LIKE_NEW',
    pickupLocation: 'Old Academic Block',
    photos: ['https://example.com/rosen.jpg'],
    status: 'AVAILABLE',
    type: 'EXCHANGE',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'my-offered-reserved',
    donorId: 'my-user-id',
    donorName: 'Me',
    campusId: '550e8400-e29b-41d4-a716-446655440000',
    campusName: 'Darrang College',
    title: 'Engineering Physics',
    author: 'Gaur & Gupta',
    subject: 'Physics',
    condition: 'FAIR',
    pickupLocation: 'Library Steps',
    photos: ['https://example.com/phys.jpg'],
    status: 'RESERVED',
    type: 'EXCHANGE',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
];

describe('ExchangeProposalModal Component (CS-016)', () => {
  it('does not render when isOpen is false or targetListing is null', () => {
    const { container } = render(
      <ExchangeProposalModal
        isOpen={false}
        targetListing={null}
        myAvailableListings={mockMyListings}
        onClose={vi.fn()}
        onSubmitProposal={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders target book summary and filters to only available offered listings', () => {
    render(
      <ExchangeProposalModal
        isOpen={true}
        targetListing={mockTargetListing}
        myAvailableListings={mockMyListings}
        onClose={vi.fn()}
        onSubmitProposal={vi.fn()}
      />
    );

    expect(screen.getByTestId('exchange-proposal-modal')).toBeInTheDocument();
    expect(screen.getByTestId('target-book-summary')).toBeInTheDocument();
    expect(screen.getByText('Data Structures and Algorithms in C++')).toBeInTheDocument();
    expect(screen.getByText(/Seeking Discrete Mathematics or Computer Networks/i)).toBeInTheDocument();

    // Select dropdown should contain only available book
    const select = screen.getByTestId('select-offered-listing');
    expect(select).toBeInTheDocument();
    expect(screen.getByText(/Discrete Mathematics and Its Applications/i)).toBeInTheDocument();
    // Reserved book should not be selectable
    expect(screen.queryByText(/Engineering Physics/i)).not.toBeInTheDocument();
  });

  it('shows empty state warning with list book CTA when user has no available books', () => {
    const handleOpenDonate = vi.fn();
    const handleClose = vi.fn();

    render(
      <ExchangeProposalModal
        isOpen={true}
        targetListing={mockTargetListing}
        myAvailableListings={[]}
        onClose={handleClose}
        onSubmitProposal={vi.fn()}
        onOpenDonateModal={handleOpenDonate}
      />
    );

    expect(screen.getByText(/You don't have any available books listed to offer for exchange/i)).toBeInTheDocument();
    const listBtn = screen.getByTestId('list-book-to-exchange-btn');
    expect(listBtn).toBeInTheDocument();

    fireEvent.click(listBtn);
    expect(handleOpenDonate).toHaveBeenCalledOnce();
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('submits exchange proposal with selected book and optional message', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <ExchangeProposalModal
        isOpen={true}
        targetListing={mockTargetListing}
        myAvailableListings={mockMyListings}
        onClose={handleClose}
        onSubmitProposal={handleSubmit}
      />
    );

    // Select offered listing
    fireEvent.change(screen.getByTestId('select-offered-listing'), {
      target: { value: 'my-offered-1' },
    });

    // Enter message
    fireEvent.change(screen.getByTestId('exchange-message-input'), {
      target: { value: 'Hey Rahul, I have the exact Discrete Math book you are looking for!' },
    });

    // Submit
    fireEvent.click(screen.getByTestId('submit-exchange-btn'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        'target-listing-1',
        'my-offered-1',
        'Hey Rahul, I have the exact Discrete Math book you are looking for!'
      );
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });
});

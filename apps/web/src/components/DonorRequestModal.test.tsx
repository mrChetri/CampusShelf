import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DonorRequestModal } from './DonorRequestModal';
import type { Listing, BookRequest } from '@campusshelf/contracts';

const sampleListing: Listing = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  donorId: 'donor-1',
  donorName: 'Rahul Kalita',
  campusId: 'campus-1',
  campusName: 'Darrang College',
  title: 'University Physics with Modern Physics',
  author: 'Young and Freedman',
  isbn: null,
  edition: '14th Edition',
  course: 'B.Sc Physics',
  subject: 'Physics',
  semester: 'Semester 1',
  condition: 'GOOD',
  pickupLocation: 'Central Library Entrance',
  photos: ['https://example.com/physics.jpg'],
  description: null,
  status: 'AVAILABLE',
  type: 'DONATION',
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
};

const sampleRequests: BookRequest[] = [
  {
    id: 'req-1',
    listingId: sampleListing.id,
    listingTitle: sampleListing.title,
    listingAuthor: sampleListing.author,
    listingPhoto: null,
    pickupLocation: sampleListing.pickupLocation,
    campusName: 'Darrang College',
    donorId: 'donor-1',
    donorName: 'Rahul Kalita',
    requesterId: 'student-1',
    requesterName: 'Aarav Sharma',
    status: 'PENDING',
    message: 'Need this for my semester exams.',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'req-2',
    listingId: sampleListing.id,
    listingTitle: sampleListing.title,
    listingAuthor: sampleListing.author,
    listingPhoto: null,
    pickupLocation: sampleListing.pickupLocation,
    campusName: 'Darrang College',
    donorId: 'donor-1',
    donorName: 'Rahul Kalita',
    requesterId: 'student-2',
    requesterName: 'Bikash Nath',
    status: 'PENDING',
    message: 'Taking physics honours this year.',
    createdAt: '2026-11-20T11:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
];

describe('DonorRequestModal Component (CS-007)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DonorRequestModal
        isOpen={false}
        listing={sampleListing}
        requests={sampleRequests}
        onClose={vi.fn()}
        onAcceptRequest={vi.fn()}
        onDeclineRequest={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders empty state when there are no incoming requests', () => {
    render(
      <DonorRequestModal
        isOpen={true}
        listing={sampleListing}
        requests={[]}
        onClose={vi.fn()}
        onAcceptRequest={vi.fn()}
        onDeclineRequest={vi.fn()}
      />
    );

    expect(screen.getByTestId('donor-request-modal')).toBeInTheDocument();
    expect(screen.getByTestId('requests-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No requests received yet for this book/i)).toBeInTheDocument();
  });

  it('renders incoming requests list with requester names, notes, and statuses', () => {
    render(
      <DonorRequestModal
        isOpen={true}
        listing={sampleListing}
        requests={sampleRequests}
        onClose={vi.fn()}
        onAcceptRequest={vi.fn()}
        onDeclineRequest={vi.fn()}
      />
    );

    const items = screen.getAllByTestId('donor-request-item');
    expect(items).toHaveLength(2);

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Need this for my semester exams.')).toBeInTheDocument();
    expect(screen.getByText('Bikash Nath')).toBeInTheDocument();
    expect(screen.getByText('Taking physics honours this year.')).toBeInTheDocument();
  });

  it('allows donor to accept a pending request and triggers onAcceptRequest', async () => {
    const handleAccept = vi.fn().mockResolvedValue(undefined);

    render(
      <DonorRequestModal
        isOpen={true}
        listing={sampleListing}
        requests={sampleRequests}
        onClose={vi.fn()}
        onAcceptRequest={handleAccept}
        onDeclineRequest={vi.fn()}
      />
    );

    const acceptButtons = screen.getAllByTestId('accept-request-btn');
    expect(acceptButtons).toHaveLength(2);

    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(handleAccept).toHaveBeenCalledWith('req-1');
    });
  });

  it('allows donor to decline a pending request and triggers onDeclineRequest', async () => {
    const handleDecline = vi.fn().mockResolvedValue(undefined);

    render(
      <DonorRequestModal
        isOpen={true}
        listing={sampleListing}
        requests={sampleRequests}
        onClose={vi.fn()}
        onAcceptRequest={vi.fn()}
        onDeclineRequest={handleDecline}
      />
    );

    const declineButtons = screen.getAllByTestId('decline-request-btn');
    expect(declineButtons).toHaveLength(2);

    // Clicking decline opens reason input
    fireEvent.click(declineButtons[0]);

    const reasonInput = screen.getByTestId('decline-reason-input');
    expect(reasonInput).toBeInTheDocument();
    fireEvent.change(reasonInput, { target: { value: 'Promised to another classmate' } });

    const confirmBtn = screen.getByTestId('confirm-decline-btn');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleDecline).toHaveBeenCalledWith('req-1', 'Promised to another classmate');
    });
  });

  it('displays 72-hour handover reservation banner when listing status is RESERVED', () => {
    const reservedListing: Listing = {
      ...sampleListing,
      status: 'RESERVED',
      reservedUntil: '2026-11-23T10:00:00.000Z',
    };

    render(
      <DonorRequestModal
        isOpen={true}
        listing={reservedListing}
        requests={sampleRequests}
        onClose={vi.fn()}
        onAcceptRequest={vi.fn()}
        onDeclineRequest={vi.fn()}
      />
    );

    const banner = screen.getByTestId('handover-reservation-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Listing is RESERVED/i);
    expect(banner).toHaveTextContent(/72 hours/i);
  });
});

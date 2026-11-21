import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyRequests } from './MyRequests';
import type { BookRequest } from '@campusshelf/contracts';

const sampleRequests: BookRequest[] = [
  {
    id: 'req-1',
    listingId: 'list-1',
    listingTitle: 'University Physics with Modern Physics',
    listingAuthor: 'Young and Freedman',
    listingPhoto: 'https://example.com/physics.jpg',
    pickupLocation: 'Central Library Entrance',
    campusName: 'Darrang College',
    donorId: 'donor-1',
    donorName: 'Rahul Kalita',
    requesterId: 'student-1',
    requesterName: 'Aarav Sharma',
    status: 'PENDING',
    message: 'Need this for 1st semester physics exam.',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'req-2',
    listingId: 'list-2',
    listingTitle: 'Organic Chemistry',
    listingAuthor: 'Paula Bruice',
    listingPhoto: null,
    pickupLocation: 'Science Block Lobby',
    campusName: 'Darrang College',
    donorId: 'donor-2',
    donorName: 'Bikash Nath',
    requesterId: 'student-1',
    requesterName: 'Aarav Sharma',
    status: 'CANCELLED',
    message: null,
    createdAt: '2026-11-19T10:00:00.000Z',
    updatedAt: '2026-11-19T11:00:00.000Z',
  },
];

describe('MyRequests Component', () => {
  it('renders an empty state when user has no requests', () => {
    render(<MyRequests requests={[]} onCancelRequest={vi.fn()} />);

    expect(screen.getByTestId('requests-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No requests yet/i)).toBeInTheDocument();
  });

  it('renders request cards with book details, status badges, and message notes', () => {
    render(<MyRequests requests={sampleRequests} onCancelRequest={vi.fn()} />);

    expect(screen.getByTestId('my-requests-section')).toBeInTheDocument();
    expect(screen.getByText('University Physics with Modern Physics')).toBeInTheDocument();
    expect(screen.getByText('Organic Chemistry')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    expect(screen.getByText(/Need this for 1st semester physics exam/i)).toBeInTheDocument();
  });

  it('shows Cancel Request button only for PENDING requests and triggers cancellation handler', () => {
    const handleCancel = vi.fn();
    render(<MyRequests requests={sampleRequests} onCancelRequest={handleCancel} />);

    const cancelButtons = screen.getAllByTestId('cancel-request-btn');
    expect(cancelButtons).toHaveLength(1); // Only for req-1 (PENDING)

    fireEvent.click(cancelButtons[0]);
    expect(handleCancel).toHaveBeenCalledWith('req-1');
  });
});

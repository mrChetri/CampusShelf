import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisputeModal } from './DisputeModal';
import type { BookRequest } from '@campusshelf/contracts';

const sampleRequest: BookRequest = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  listingId: '550e8400-e29b-41d4-a716-446655440002',
  listingTitle: 'University Physics with Modern Physics',
  listingAuthor: 'Young and Freedman',
  listingPhoto: null,
  pickupLocation: 'Central Library Entrance',
  campusName: 'Darrang College',
  donorId: '550e8400-e29b-41d4-a716-446655440003',
  donorName: 'Rahul Kalita',
  requesterId: '550e8400-e29b-41d4-a716-446655440004',
  requesterName: 'Aarav Sharma',
  status: 'ACCEPTED',
  message: 'Need for physics class',
  reservedUntil: '2026-11-25T10:00:00.000Z',
  createdAt: '2026-11-22T10:00:00.000Z',
  updatedAt: '2026-11-22T10:00:00.000Z',
};

describe('DisputeModal Component (CS-008)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DisputeModal
        isOpen={false}
        request={sampleRequest}
        onClose={vi.fn()}
        onSubmitDispute={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with book information and dispute form when open', () => {
    render(
      <DisputeModal
        isOpen={true}
        request={sampleRequest}
        onClose={vi.fn()}
        onSubmitDispute={vi.fn()}
      />
    );

    expect(screen.getByTestId('dispute-modal')).toBeInTheDocument();
    expect(screen.getByText(/Report a Problem with Handover/i)).toBeInTheDocument();
    expect(screen.getByText('University Physics with Modern Physics')).toBeInTheDocument();
    expect(screen.getByTestId('dispute-reason-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-dispute-btn')).toBeInTheDocument();
  });

  it('validates minimum reason length and submits dispute', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <DisputeModal
        isOpen={true}
        request={sampleRequest}
        onClose={vi.fn()}
        onSubmitDispute={handleSubmit}
      />
    );

    const submitBtn = screen.getByTestId('submit-dispute-btn');
    const reasonInput = screen.getByTestId('dispute-reason-input');
    const detailsInput = screen.getByTestId('dispute-details-input');

    // Trying to submit empty shows error
    fireEvent.click(submitBtn);
    expect(await screen.findByTestId('dispute-form-error')).toBeInTheDocument();

    // Fill valid reason and details
    fireEvent.change(reasonInput, {
      target: { value: 'Donor did not show up at Central Library' },
    });
    fireEvent.change(detailsInput, {
      target: { value: 'Waited for 45 minutes.' },
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        sampleRequest.id,
        'Donor did not show up at Central Library',
        'Waited for 45 minutes.'
      );
    });
  });

  it('closes on cancel button click', () => {
    const handleClose = vi.fn();

    render(
      <DisputeModal
        isOpen={true}
        request={sampleRequest}
        onClose={handleClose}
        onSubmitDispute={vi.fn()}
      />
    );

    const cancelBtn = screen.getByTestId('cancel-dispute-btn');
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});

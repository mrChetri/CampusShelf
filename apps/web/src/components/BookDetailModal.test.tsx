import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BookDetailModal } from './BookDetailModal';
import type { PublicListing } from '@campusshelf/contracts';

const sampleListing: PublicListing = {
  id: 'a0000000-0000-0000-0000-000000000001',
  donorId: 'd0000000-0000-0000-0000-000000000001',
  donorName: 'Rahul Kalita',
  campusId: '550e8400-e29b-41d4-a716-446655440000',
  campusName: 'Darrang College',
  title: 'Advanced Engineering Mathematics',
  author: 'Erwin Kreyszig',
  isbn: '9780470458365',
  edition: '10th',
  course: 'B.Tech Mechanical',
  subject: 'Mathematics',
  semester: '3rd Semester',
  condition: 'GOOD',
  pickupLocation: 'Old Library Front Steps',
  photos: [
    'https://example.com/cover.jpg',
    'https://example.com/pages.jpg',
  ],
  description: 'Slightly used with pencil notes on chapter 3.',
  status: 'AVAILABLE',
  type: 'DONATION',
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
};

describe('BookDetailModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <BookDetailModal isOpen={false} listing={sampleListing} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all book details, photos, trust badge, safe pickup location, and condition guide', () => {
    const handleClose = vi.fn();
    render(<BookDetailModal isOpen={true} listing={sampleListing} onClose={handleClose} />);

    expect(screen.getByTestId('book-detail-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Advanced Engineering Mathematics/i);
    expect(screen.getByText(/by Erwin Kreyszig/i)).toBeInTheDocument();
    expect(screen.getByText(/Old Library Front Steps/i)).toBeInTheDocument();
    expect(screen.getByText(/Handover-Verified Integrity/i)).toBeInTheDocument();
    expect(screen.getByText(/Rahul Kalita/i)).toBeInTheDocument();
    expect(screen.getByText(/9780470458365/i)).toBeInTheDocument();
    expect(screen.getByText(/B.Tech Mechanical/i)).toBeInTheDocument();
    expect(screen.getByText(/3rd Semester/i)).toBeInTheDocument();
    expect(screen.getByText(/Slightly used with pencil notes/i)).toBeInTheDocument();

    // Verify Condition Explainer
    expect(screen.getByText(/Clean copy with intact spine/i)).toBeInTheDocument();

    // Verify close button calls handler
    fireEvent.click(screen.getByTestId('close-detail-modal-btn'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('strictly hides donor phone numbers, email addresses, and full private contact info', () => {
    render(<BookDetailModal isOpen={true} listing={sampleListing} onClose={vi.fn()} />);

    const modal = screen.getByTestId('book-detail-modal');

    // Assert that no email or phone patterns are found
    expect(within(modal).queryByText(/@/i)).not.toBeInTheDocument();
    expect(within(modal).queryByText(/\+91/i)).not.toBeInTheDocument();
    expect(within(modal).queryByText(/phone/i)).not.toBeInTheDocument();
    expect(within(modal).getByText(/Privacy Protected/i)).toBeInTheDocument();
  });

  it('supports photo gallery thumbnail selection', () => {
    render(<BookDetailModal isOpen={true} listing={sampleListing} onClose={vi.fn()} />);

    const thumbnails = screen.getAllByRole('button', { name: /Thumbnail/i });
    expect(thumbnails.length).toBe(2);

    fireEvent.click(thumbnails[1]);
    const mainImg = screen.getByAltText(sampleListing.title) as HTMLImageElement;
    expect(mainImg.src).toBe('https://example.com/pages.jpg');
  });
});

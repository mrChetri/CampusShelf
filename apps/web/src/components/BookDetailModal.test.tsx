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

  it('displays "Your Listing" badge when donor views their own book, preventing self-request', () => {
    render(
      <BookDetailModal
        isOpen={true}
        listing={sampleListing}
        onClose={vi.fn()}
        isCampusMember={true}
        currentUserId={sampleListing.donorId}
      />
    );

    expect(screen.getByTestId('own-listing-badge')).toBeInTheDocument();
    expect(screen.getByText(/Your Listing/i)).toBeInTheDocument();
    expect(screen.queryByTestId('open-request-form-btn')).not.toBeInTheDocument();
  });

  it('allows Campus Member to open request form, input note, and submit request successfully', async () => {
    const handleRequest = vi.fn().mockResolvedValue(true);
    render(
      <BookDetailModal
        isOpen={true}
        listing={sampleListing}
        onClose={vi.fn()}
        isCampusMember={true}
        currentUserId="student-other-id"
        onRequestListing={handleRequest}
      />
    );

    // Click "Request This Book"
    const openFormBtn = screen.getByTestId('open-request-form-btn');
    fireEvent.click(openFormBtn);

    // Form inputs appear
    const noteInput = screen.getByTestId('request-note-input');
    const submitBtn = screen.getByTestId('submit-request-btn');

    fireEvent.change(noteInput, { target: { value: 'Hi! Need this for Mechanical Engineering exams.' } });
    fireEvent.click(submitBtn);

    expect(handleRequest).toHaveBeenCalledWith(sampleListing.id, 'Hi! Need this for Mechanical Engineering exams.');
  });

  it('renders sale listings with For Sale badge, pricing banner, and asking price in INR (CS-011)', () => {
    const saleListing: PublicListing = {
      ...sampleListing,
      id: 'detail-sale-1',
      title: 'Economics for College Students',
      type: 'SALE',
      price: 320,
    };

    render(
      <BookDetailModal
        isOpen={true}
        listing={saleListing}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('badge-sale')).toBeInTheDocument();
    expect(screen.getByTestId('detail-price')).toHaveTextContent(/₹320/);
    expect(screen.getByTestId('sale-pricing-banner')).toBeInTheDocument();
    expect(screen.getByTestId('detail-asking-price')).toHaveTextContent('₹320');
    expect(screen.getByText(/Pay directly to seller \(Cash or UPI\) during campus handover/i)).toBeInTheDocument();
  });

  it('renders purchase enquiry CTA, cash/UPI reminder, and pending badge for sale listings (CS-012)', () => {
    const saleListing: PublicListing = {
      ...sampleListing,
      id: 'detail-sale-2',
      title: 'Digital Systems Principles',
      type: 'SALE',
      price: 280,
    };

    const handleRequest = vi.fn().mockResolvedValue(true);

    const { rerender } = render(
      <BookDetailModal
        isOpen={true}
        listing={saleListing}
        onClose={vi.fn()}
        isCampusMember={true}
        currentUserId="buyer-1"
        onRequestListing={handleRequest}
      />
    );

    // Verify button says "Send Purchase Enquiry"
    const openBtn = screen.getByTestId('open-request-form-btn');
    expect(openBtn).toHaveTextContent(/Send Purchase Enquiry/i);

    fireEvent.click(openBtn);

    // Form inputs and reminder banner appear
    expect(screen.getByText(/Optional Note for Seller/i)).toBeInTheDocument();
    expect(screen.getByTestId('sale-enquiry-reminder')).toBeInTheDocument();
    expect(screen.getByTestId('submit-request-btn')).toHaveTextContent(/Submit Purchase Enquiry/i);

    fireEvent.change(screen.getByTestId('request-note-input'), {
      target: { value: 'Can meet at student union. Will pay ₹280 cash.' },
    });
    fireEvent.click(screen.getByTestId('submit-request-btn'));
    expect(handleRequest).toHaveBeenCalledWith(saleListing.id, 'Can meet at student union. Will pay ₹280 cash.');

    // Rerender with hasActiveRequest=true
    rerender(
      <BookDetailModal
        isOpen={true}
        listing={saleListing}
        onClose={vi.fn()}
        isCampusMember={true}
        currentUserId="buyer-1"
        hasActiveRequest={true}
      />
    );
    expect(screen.getByTestId('request-pending-badge')).toHaveTextContent(/Enquiry Sent \(Pending\)/i);
  });
});

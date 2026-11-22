import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DonateBookModal } from './DonateBookModal';

describe('DonateBookModal Component (CS-004 & CS-011)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DonateBookModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders default Free Donation mode with toggle buttons', () => {
    render(<DonateBookModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByTestId('donate-book-modal')).toBeInTheDocument();
    expect(screen.getByTestId('listing-type-donation-btn')).toBeInTheDocument();
    expect(screen.getByTestId('listing-type-sale-btn')).toBeInTheDocument();
    // In donation mode, asking price input is not displayed
    expect(screen.queryByTestId('input-price')).not.toBeInTheDocument();
  });

  it('switches to Affordable Resale mode and displays asking price input', () => {
    render(<DonateBookModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Click Affordable Resale button
    fireEvent.click(screen.getByTestId('listing-type-sale-btn'));

    // Asking price input should now be visible
    expect(screen.getByTestId('input-price')).toBeInTheDocument();
    expect(screen.getByText(/Affordable student resale/i)).toBeInTheDocument();

    // Click Free Donation button again
    fireEvent.click(screen.getByTestId('listing-type-donation-btn'));
    expect(screen.queryByTestId('input-price')).not.toBeInTheDocument();
  });

  it('validates asking price bounds (₹1 - ₹5,000) when submitting a sale listing', async () => {
    render(<DonateBookModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Switch to sale mode
    fireEvent.click(screen.getByTestId('listing-type-sale-btn'));

    // Fill in required fields
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Organic Chemistry' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'Paula Bruice' } });
    fireEvent.change(screen.getByTestId('input-subject'), { target: { value: 'Chemistry' } });

    // Add photo
    const photoInput = screen.getByTestId('input-photo-url');
    const addPhotoBtn = screen.getByTestId('add-photo-btn');
    fireEvent.change(photoInput, { target: { value: 'https://example.com/chem.jpg' } });
    fireEvent.click(addPhotoBtn);

    // Leave price empty and submit
    fireEvent.click(screen.getByTestId('submit-listing-btn'));
    expect(await screen.findByText(/Asking price must be between ₹1 and ₹5,000/i)).toBeInTheDocument();

    // Enter price over 5000 and submit
    const priceInput = screen.getByTestId('input-price');
    fireEvent.change(priceInput, { target: { value: '8000' } });
    fireEvent.click(screen.getByTestId('submit-listing-btn'));
    expect(await screen.findByText(/Asking price must be between ₹1 and ₹5,000/i)).toBeInTheDocument();
  });

  it('submits a valid secondary sale listing and triggers onSuccess', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          listing: {
            id: 'sale-listing-1',
            title: 'Organic Chemistry',
            author: 'Paula Bruice',
            subject: 'Chemistry',
            condition: 'GOOD',
            pickupLocation: 'Central Library Ground Floor Entrance',
            photos: ['https://example.com/chem.jpg'],
            type: 'SALE',
            price: 350,
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    );

    render(
      <DonateBookModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        token="test-token"
      />
    );

    // Switch to sale mode
    fireEvent.click(screen.getByTestId('listing-type-sale-btn'));

    // Fill in required fields
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Organic Chemistry' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'Paula Bruice' } });
    fireEvent.change(screen.getByTestId('input-subject'), { target: { value: 'Chemistry' } });
    fireEvent.change(screen.getByTestId('input-price'), { target: { value: '350' } });

    // Add photo
    const photoInput = screen.getByTestId('input-photo-url');
    const addPhotoBtn = screen.getByTestId('add-photo-btn');
    fireEvent.change(photoInput, { target: { value: 'https://example.com/chem.jpg' } });
    fireEvent.click(addPhotoBtn);

    // Submit
    fireEvent.click(screen.getByTestId('submit-listing-btn'));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SALE',
          price: 350,
          title: 'Organic Chemistry',
        })
      );
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });
});

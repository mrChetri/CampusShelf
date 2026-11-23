import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DonateBookModal } from './DonateBookModal';

describe('DonateBookModal Component (CS-004 & CS-011)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (_url, options) => {
        const body = options?.body ? JSON.parse(options.body) : {};
        return {
          ok: true,
          json: async () => ({
            listing: {
              id: 'test-listing-id',
              status: 'AVAILABLE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...body,
            },
          }),
        };
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
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

  it('displays campaign donation banner and attaches campaignNeedId on submit (CS-014)', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <DonateBookModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        initialCampaignNeedId="need-123"
        initialCampaignTitle="First-Year Physics Drive"
        initialPartnerName="Tezpur Book Bank"
        initialSubject="Physics"
        initialCourse="B.Sc"
      />
    );

    expect(screen.getByTestId('campaign-donation-banner')).toBeInTheDocument();
    expect(screen.getByText(/Donating to Campaign:/i)).toBeInTheDocument();
    expect(screen.getByText(/First-Year Physics Drive/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Tezpur Book Bank\)/i)).toBeInTheDocument();

    // Verify initial values pre-populated
    expect(screen.getByTestId('input-subject')).toHaveValue('Physics');
    expect(screen.getByTestId('input-course')).toHaveValue('B.Sc');

    // Fill remaining required fields
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Halliday and Resnick Physics' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'Walker' } });

    // Add photo
    const photoInput = screen.getByTestId('input-photo-url');
    const addPhotoBtn = screen.getByTestId('add-photo-btn');
    fireEvent.change(photoInput, { target: { value: 'https://example.com/phys.jpg' } });
    fireEvent.click(addPhotoBtn);

    // Submit
    fireEvent.click(screen.getByTestId('submit-listing-btn'));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DONATION',
          campaignNeedId: 'need-123',
          title: 'Halliday and Resnick Physics',
        })
      );
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });

  it('switches to Exchange (Barter) mode and submits exchangePreferences (CS-016)', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    render(<DonateBookModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />);

    // Click Exchange mode button
    const exchangeBtn = screen.getByTestId('listing-type-exchange-btn');
    expect(exchangeBtn).toBeInTheDocument();
    fireEvent.click(exchangeBtn);

    // Exchange preferences input should now be displayed
    const prefInput = screen.getByTestId('input-exchange-preferences');
    expect(prefInput).toBeInTheDocument();
    fireEvent.change(prefInput, { target: { value: 'Looking for Organic Chemistry 2nd Sem' } });

    // Asking price should not be present
    expect(screen.queryByTestId('input-price')).not.toBeInTheDocument();

    // Fill in required fields
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Inorganic Chemistry' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'J.D. Lee' } });
    fireEvent.change(screen.getByTestId('input-subject'), { target: { value: 'Chemistry' } });

    // Add photo
    const photoInput = screen.getByTestId('input-photo-url');
    const addPhotoBtn = screen.getByTestId('add-photo-btn');
    fireEvent.change(photoInput, { target: { value: 'https://example.com/jdlee.jpg' } });
    fireEvent.click(addPhotoBtn);

    // Submit
    fireEvent.click(screen.getByTestId('submit-listing-btn'));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'EXCHANGE',
          exchangePreferences: 'Looking for Organic Chemistry 2nd Sem',
          title: 'Inorganic Chemistry',
        })
      );
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });
});

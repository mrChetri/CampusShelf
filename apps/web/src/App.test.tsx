import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('App Root Shell (Frontend Seam)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            json: async () => ({
              status: 'ok',
              environment: 'test',
              uptime: 10,
              timestamp: new Date().toISOString(),
            }),
          });
        }
        return Promise.reject(new Error('Not found'));
      })
    );
  });

  it('renders the CampusShelf application branding and mission', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/CampusShelf/i);
    expect(screen.getByText(/Donation-first student book network/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('system-status-badge')).toBeInTheDocument();
    });
  });

  it('renders the system status indicator badge and reflects live status', async () => {
    render(<App />);
    expect(screen.getByTestId('system-status-badge')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/System Status: Online \(test\)/i)).toBeInTheDocument();
    });
  });

  it('renders guest mode by default with Sign in with Google button', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('guest-auth-section')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
  });

  it('displays student profile and Registered User badge when authenticated and supports signing out', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('guest-auth-section')).toBeInTheDocument();
    });

    // Trigger sign in
    const signInBtn = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Profile chip and badge should now be rendered in the header
    await waitFor(() => {
      const profileChip = screen.getByTestId('user-profile-chip');
      expect(profileChip).toBeInTheDocument();
      expect(within(profileChip).getByText(/Registered User/i)).toBeInTheDocument();
      expect(within(profileChip).getByText(/Aarav Sharma/i)).toBeInTheDocument();
    });

    // Clicking sign out returns to guest mode
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    });
  });

  it('renders campus onboarding card for Registered Users and allows redeeming invite code', async () => {
    render(<App />);

    // Sign in as Registered User
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Onboarding card should appear
    const onboardingCard = await screen.findByTestId('campus-onboarding-card');
    expect(onboardingCard).toBeInTheDocument();
    expect(screen.getByText(/Join Your College Community/i)).toBeInTheDocument();

    const campusSelect = screen.getByTestId('campus-select');
    expect(campusSelect).toBeInTheDocument();

    const codeInput = screen.getByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');

    // Attempt with empty/invalid code triggers error
    fireEvent.change(codeInput, { target: { value: 'BAD' } });
    fireEvent.click(submitBtn);

    const errorAlert = await screen.findByTestId('onboarding-error');
    expect(errorAlert).toBeInTheDocument();

    // Submit valid pilot code
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Transition to Campus Member
    await waitFor(() => {
      const profileChip = screen.getByTestId('user-profile-chip');
      expect(within(profileChip).getByText(/Campus Member/i)).toBeInTheDocument();
      expect(within(profileChip).getByText(/Darrang College/i)).toBeInTheDocument();
    });

    // Onboarding card disappears once user is a Campus Member
    expect(screen.queryByTestId('campus-onboarding-card')).not.toBeInTheDocument();
  });

  it('renders "Donate a Book" button for Campus Members and opens the donation modal', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Donate button should be visible
    const donateBtn = await screen.findByTestId('open-donate-modal-btn');
    expect(donateBtn).toBeInTheDocument();
    expect(donateBtn).toHaveTextContent(/Donate a Book/i);

    // Click opens modal
    fireEvent.click(donateBtn);
    expect(screen.getByTestId('donate-book-modal')).toBeInTheDocument();
    expect(screen.getByText(/Book Condition Guide/i)).toBeInTheDocument();
  });

  it('validates required fields, previews photos, creates listing and allows withdrawal', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Open donate modal
    const donateBtn = await screen.findByTestId('open-donate-modal-btn');
    fireEvent.click(donateBtn);

    // Submit with empty fields shows error
    const publishBtn = screen.getByTestId('submit-listing-btn');
    fireEvent.click(publishBtn);
    expect(await screen.findByTestId('listing-form-error')).toBeInTheDocument();

    // Fill valid book metadata
    fireEvent.change(screen.getByTestId('input-title'), {
      target: { value: 'University Physics with Modern Physics' },
    });
    fireEvent.change(screen.getByTestId('input-author'), {
      target: { value: 'Young and Freedman' },
    });
    fireEvent.change(screen.getByTestId('input-subject'), {
      target: { value: 'Physics' },
    });
    fireEvent.change(screen.getByTestId('input-pickup-location'), {
      target: { value: 'Central Library Entrance' },
    });

    // Add photo
    const photoInput = screen.getByTestId('input-photo-url');
    fireEvent.change(photoInput, {
      target: { value: 'https://supabase.co/storage/v1/object/public/listings/sample.jpg' },
    });
    const addPhotoBtn = screen.getByTestId('add-photo-btn');
    fireEvent.click(addPhotoBtn);

    // Photo preview should appear
    expect(screen.getByTestId('photo-preview-0')).toBeInTheDocument();

    // Submit listing
    fireEvent.click(publishBtn);

    // Modal should close and listing should be in My Listings
    await waitFor(() => {
      expect(screen.queryByTestId('donate-book-modal')).not.toBeInTheDocument();
    });

    // Check listing rendered in My Listings
    const listingCard = await screen.findByTestId('my-listing-card');
    expect(listingCard).toBeInTheDocument();
    expect(within(listingCard).getByText(/University Physics with Modern Physics/i)).toBeInTheDocument();
    expect(within(listingCard).getByText(/AVAILABLE/i)).toBeInTheDocument();

    // Withdraw listing
    const withdrawBtn = within(listingCard).getByTestId('withdraw-listing-btn');
    fireEvent.click(withdrawBtn);

    // Status changes to WITHDRAWN
    await waitFor(() => {
      expect(within(listingCard).getByText(/WITHDRAWN/i)).toBeInTheDocument();
    });
  });
});

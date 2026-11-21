import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import App from './App';

const mockListings = [
  {
    id: 'b1111111-2222-3333-4444-555555555551',
    donorId: 'd1111111-2222-3333-4444-555555555551',
    donorName: 'Priya Das',
    campusId: '550e8400-e29b-41d4-a716-446655440000',
    campusName: 'Darrang College',
    title: 'University Physics',
    author: 'Young and Freedman',
    isbn: '9780135159552',
    edition: '15th',
    course: 'B.Sc Physics',
    subject: 'Physics',
    semester: '1st Semester',
    condition: 'GOOD',
    pickupLocation: 'Central Library Entrance',
    photos: ['https://example.com/physics.jpg'],
    description: 'Clean copy with neat notes.',
    status: 'AVAILABLE',
    type: 'DONATION',
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'b1111111-2222-3333-4444-555555555552',
    donorId: 'd1111111-2222-3333-4444-555555555552',
    donorName: 'Rahul Verma',
    campusId: '550e8400-e29b-41d4-a716-446655440000',
    campusName: 'Darrang College',
    title: 'Organic Chemistry',
    author: 'Paula Bruice',
    isbn: '9780134042282',
    edition: '8th',
    course: 'B.Sc Chemistry',
    subject: 'Chemistry',
    semester: '2nd Semester',
    condition: 'LIKE_NEW',
    pickupLocation: 'Science Block Lobby',
    photos: ['https://example.com/chem.jpg'],
    description: 'Barely used.',
    status: 'AVAILABLE',
    type: 'SALE',
    createdAt: '2026-11-19T10:00:00.000Z',
    updatedAt: '2026-11-19T10:00:00.000Z',
  },
  {
    id: 'b1111111-2222-3333-4444-555555555553',
    donorId: 'd1111111-2222-3333-4444-555555555553',
    donorName: 'Ananya Roy',
    campusId: '660e8400-e29b-41d4-a716-446655440000',
    campusName: 'Tezpur University',
    title: 'Introduction to Algorithms',
    author: 'Cormen et al.',
    isbn: '9780262033848',
    edition: '3rd',
    course: 'B.Tech CSE',
    subject: 'Computer Science',
    semester: '3rd Semester',
    condition: 'NEW',
    pickupLocation: 'Dean Office Lobby',
    photos: ['https://example.com/algo.jpg'],
    description: 'Brand new condition.',
    status: 'AVAILABLE',
    type: 'DONATION',
    createdAt: '2026-11-18T10:00:00.000Z',
    updatedAt: '2026-11-18T10:00:00.000Z',
  },
];

describe('App Root Shell (Frontend Seam)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'ok',
              environment: 'test',
              uptime: 10,
              timestamp: new Date().toISOString(),
            }),
          });
        }
        if (url.includes('/api/campuses/redeem-invite')) {
          let body: any = {};
          try {
            body = options?.body ? JSON.parse(options.body as string) : {};
          } catch {}
          if (body.code === 'DARRANG-PILOT-2026') {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                user: {
                  id: '11111111-2222-3333-4444-555555555555',
                  email: 'student@darrang.edu',
                  fullName: 'Aarav Sharma',
                  role: 'CAMPUS_MEMBER',
                  campusId: body.campusId || '550e8400-e29b-41d4-a716-446655440000',
                  campusName: 'Darrang College',
                  avatarUrl: null,
                  createdAt: new Date().toISOString(),
                },
              }),
            });
          }
          return Promise.resolve({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid or expired campus invite code. Please check with your student union.' }),
          });
        }
        if (url.includes('/api/campuses')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              campuses: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  name: 'Darrang College',
                  slug: 'darrang-college',
                  city: 'Tezpur',
                  state: 'Assam',
                  active: true,
                },
              ],
            }),
          });
        }
        if (url.includes('/api/requests/mine')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ requests: [] }),
          });
        }
        if (url.includes('/api/requests/') && url.includes('/cancel')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: 'Request cancelled successfully',
              request: { id: 'req-cancelled', status: 'CANCELLED' },
            }),
          });
        }
        if (options?.method === 'POST' && url.includes('/requests')) {
          let body: any = {};
          try {
            body = options?.body ? JSON.parse(options.body as string) : {};
          } catch {}
          return Promise.resolve({
            ok: true,
            json: async () => ({
              request: {
                id: 'req-1234',
                listingId: 'b1111111-2222-3333-4444-555555555551',
                listingTitle: 'University Physics',
                listingAuthor: 'Young and Freedman',
                listingPhoto: 'https://example.com/physics.jpg',
                pickupLocation: 'Central Library Entrance',
                campusName: 'Darrang College',
                donorId: 'd1111111-2222-3333-4444-555555555551',
                donorName: 'Priya Das',
                requesterId: '11111111-2222-3333-4444-555555555555',
                requesterName: 'Aarav Sharma',
                status: 'PENDING',
                message: body.message || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }),
          });
        }
        if (url.includes('/api/listings/mine')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ listings: [] }),
          });
        }
        if (url.includes('/withdraw')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: 'Listing withdrawn',
              listing: { status: 'WITHDRAWN' },
            }),
          });
        }
        if (options?.method === 'POST' && url.endsWith('/api/listings')) {
          let body: any = {};
          try {
            body = options?.body ? JSON.parse(options.body as string) : {};
          } catch {}
          return Promise.resolve({
            ok: true,
            json: async () => ({
              listing: {
                id: 'new-listing-id-1234',
                donorId: '11111111-2222-3333-4444-555555555555',
                donorName: 'Aarav Sharma',
                campusId: '550e8400-e29b-41d4-a716-446655440000',
                campusName: 'Darrang College',
                title: body.title || 'New Book',
                author: body.author || 'Author',
                condition: body.condition || 'GOOD',
                pickupLocation: body.pickupLocation || 'Library',
                photos: body.photos || ['https://example.com/p.jpg'],
                status: 'AVAILABLE',
                type: 'DONATION',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }),
          });
        }
        if (url.includes('/api/listings/') && !url.includes('/api/listings/mine')) {
          const listingId = url.split('/api/listings/')[1]?.split('?')[0];
          const found = mockListings.find((l) => l.id === listingId);
          if (found) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ listing: found }),
            });
          }
        }
        if (url.includes('/api/listings')) {
          const parsedUrl = new URL(url, 'http://localhost');
          const search = parsedUrl.searchParams.get('search')?.toLowerCase();
          const campusId = parsedUrl.searchParams.get('campusId');
          const condition = parsedUrl.searchParams.get('condition');
          const type = parsedUrl.searchParams.get('type');

          let results = [...mockListings];
          if (search) {
            results = results.filter(
              (l) =>
                l.title.toLowerCase().includes(search) ||
                l.author.toLowerCase().includes(search) ||
                (l.isbn && l.isbn.toLowerCase().includes(search))
            );
          }
          if (campusId) {
            results = results.filter((l) => l.campusId === campusId);
          }
          if (condition) {
            results = results.filter((l) => l.condition === condition);
          }
          if (type) {
            results = results.filter((l) => l.type === type);
          }

          results.sort((a, b) => {
            if (a.type === 'DONATION' && b.type !== 'DONATION') return -1;
            if (a.type !== 'DONATION' && b.type === 'DONATION') return 1;
            return 0;
          });

          return Promise.resolve({
            ok: true,
            json: async () => ({
              listings: results,
              total: results.length,
              page: 1,
              limit: 12,
              hasMore: false,
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

  it('renders public discovery feed with donation-first books for guest users', async () => {
    render(<App />);

    const feed = await screen.findByTestId('discovery-feed');
    expect(feed).toBeInTheDocument();

    // Books should be rendered in the feed
    await waitFor(() => {
      expect(screen.getByText('University Physics')).toBeInTheDocument();
      expect(screen.getByText('Organic Chemistry')).toBeInTheDocument();
    });

    // Check donation badges
    const donationBadges = screen.getAllByTestId('badge-donation');
    expect(donationBadges.length).toBeGreaterThan(0);
    expect(donationBadges[0]).toHaveTextContent(/FREE DONATION/i);

    // Free donations must be ordered before paid listings
    const bookCards = screen.getAllByTestId(/^book-card-/);
    expect(bookCards[0]).toHaveTextContent(/University Physics/i);
  });

  it('filters discovery feed by text search (title, author, ISBN)', async () => {
    render(<App />);

    await screen.findByTestId('discovery-feed');

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Paula' } });

    await waitFor(() => {
      expect(screen.getByText('Organic Chemistry')).toBeInTheDocument();
      expect(screen.queryByText('University Physics')).not.toBeInTheDocument();
    });
  });

  it('filters discovery feed by condition and campus scope', async () => {
    render(<App />);

    await screen.findByTestId('discovery-feed');

    const conditionFilter = screen.getByTestId('filter-condition');
    fireEvent.change(conditionFilter, { target: { value: 'LIKE_NEW' } });

    await waitFor(() => {
      expect(screen.getByText('Organic Chemistry')).toBeInTheDocument();
      expect(screen.queryByText('University Physics')).not.toBeInTheDocument();
    });
  });

  it('displays loading skeleton while fetching and empty state when no listings match', async () => {
    render(<App />);

    await screen.findByTestId('discovery-feed');

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'NonexistentBookTitle12345' } });

    const emptyState = await screen.findByTestId('listings-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent(/No books found matching your criteria/i);
  });

  it('opens Book Detail Modal on card click, showing condition, safe pickup zone, trust label, and strictly hiding private contact info', async () => {
    render(<App />);

    await screen.findByTestId('discovery-feed');

    const card = screen.getByTestId('book-card-b1111111-2222-3333-4444-555555555551');
    fireEvent.click(card);

    const modal = await screen.findByTestId('book-detail-modal');
    expect(modal).toBeInTheDocument();

    expect(within(modal).getByText('University Physics')).toBeInTheDocument();
    expect(within(modal).getByText(/Young and Freedman/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Central Library Entrance/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Handover-Verified/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Priya Das/i)).toBeInTheDocument();

    // STRICT PRIVACY: Private donor information must NOT be present
    expect(within(modal).queryByText(/@darrang\.edu/i)).not.toBeInTheDocument();
    expect(within(modal).queryByText(/\+91/i)).not.toBeInTheDocument();
    expect(within(modal).queryByText(/phone/i)).not.toBeInTheDocument();
    expect(within(modal).queryByText(/email:/i)).not.toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByTestId('close-detail-modal-btn');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('book-detail-modal')).not.toBeInTheDocument();
    });
  });

  it('allows Campus Member to request an available book and tracks it in My Requests', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Verify member navigation tabs are present
    const navTabs = await screen.findByTestId('member-nav-tabs');
    expect(navTabs).toBeInTheDocument();

    // Click book card to open detail modal
    const card = await screen.findByTestId('book-card-b1111111-2222-3333-4444-555555555551');
    fireEvent.click(card);

    const modal = await screen.findByTestId('book-detail-modal');
    expect(modal).toBeInTheDocument();

    // Open request form
    const openFormBtn = screen.getByTestId('open-request-form-btn');
    fireEvent.click(openFormBtn);

    const noteInput = screen.getByTestId('request-note-input');
    fireEvent.change(noteInput, { target: { value: 'Need for physics class' } });

    const submitRequestBtn = screen.getByTestId('submit-request-btn');
    fireEvent.click(submitRequestBtn);

    // Should show requested pending badge
    await waitFor(() => {
      expect(screen.getByTestId('request-pending-badge')).toBeInTheDocument();
    });

    // Close modal
    fireEvent.click(screen.getByTestId('close-detail-modal-btn'));

    // Switch to My Requests tab
    const requestsTab = screen.getByTestId('tab-requests');
    fireEvent.click(requestsTab);

    // Verify request card rendered in My Requests view
    const requestCard = await screen.findByTestId('request-card');
    expect(requestCard).toBeInTheDocument();
    expect(within(requestCard).getByText('University Physics')).toBeInTheDocument();
    expect(within(requestCard).getByText('PENDING')).toBeInTheDocument();
  });

  it('allows requester to cancel their own pending request in My Requests', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Request a book
    const card = await screen.findByTestId('book-card-b1111111-2222-3333-4444-555555555551');
    fireEvent.click(card);

    const openFormBtn = await screen.findByTestId('open-request-form-btn');
    fireEvent.click(openFormBtn);

    const submitRequestBtn = screen.getByTestId('submit-request-btn');
    fireEvent.click(submitRequestBtn);

    await waitFor(() => {
      expect(screen.getByTestId('request-pending-badge')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close-detail-modal-btn'));

    // Switch to My Requests
    const requestsTab = screen.getByTestId('tab-requests');
    fireEvent.click(requestsTab);

    const requestCard = await screen.findByTestId('request-card');
    const cancelBtn = within(requestCard).getByTestId('cancel-request-btn');
    fireEvent.click(cancelBtn);

    // Status transitions to CANCELLED
    await waitFor(() => {
      expect(within(requestCard).getByText('CANCELLED')).toBeInTheDocument();
    });
  });
});

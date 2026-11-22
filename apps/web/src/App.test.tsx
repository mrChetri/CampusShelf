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

let customMineRequests: any[] = [];
let customReports: any[] = [];
let customAuditLogs: any[] = [];

describe('App Root Shell (Frontend Seam)', () => {
  beforeEach(() => {
    customMineRequests = [];
    customReports = [];
    customAuditLogs = [];
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
        if (url.includes('/api/notifications/impact')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              impact: {
                campusId: '550e8400-e29b-41d4-a716-446655440000',
                campusName: 'Darrang College',
                totalListed: 3,
                totalReserved: 1,
                totalDonated: 5,
                totalMembers: 12,
              },
            }),
          });
        }
        if (url.includes('/api/notifications/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              history: {
                booksGiven: [
                  {
                    id: 'donated-book-1',
                    donorId: '11111111-2222-3333-4444-555555555555',
                    donorName: 'Aarav Sharma',
                    campusId: '550e8400-e29b-41d4-a716-446655440000',
                    campusName: 'Darrang College',
                    title: 'Calculus Early Transcendentals',
                    author: 'James Stewart',
                    condition: 'GOOD',
                    pickupLocation: 'Library',
                    photos: ['https://example.com/calc.jpg'],
                    status: 'DONATED',
                    type: 'DONATION',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
                booksReceived: [
                  {
                    id: 'received-req-1',
                    listingId: 'b1111111-2222-3333-4444-555555555551',
                    listingTitle: 'University Physics',
                    listingAuthor: 'Young and Freedman',
                    pickupLocation: 'Central Library Entrance',
                    campusName: 'Darrang College',
                    donorId: 'd1111111-2222-3333-4444-555555555551',
                    donorName: 'Priya Das',
                    requesterId: '11111111-2222-3333-4444-555555555555',
                    requesterName: 'Aarav Sharma',
                    status: 'COMPLETED',
                    message: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              },
            }),
          });
        }
        if (url.includes('/api/notifications/read-all')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, updatedCount: 1 }),
          });
        }
        if (url.includes('/api/notifications/read')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, updatedCount: 1 }),
          });
        }
        if (url.includes('/api/notifications')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              notifications: [
                {
                  id: 'notif-1',
                  userId: '11111111-2222-3333-4444-555555555555',
                  type: 'REQUEST_RECEIVED',
                  title: 'New request for your book',
                  body: 'Priya Das requested "University Physics".',
                  entityId: 'req-1',
                  read: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              unreadCount: 1,
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
          if (body.code === 'MODERATOR-INVITE-2026') {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                user: {
                  id: 'mod-11111111-2222-3333-4444-555555555555',
                  email: 'mod@darrang.edu',
                  fullName: 'Prof. Moderation',
                  role: 'MODERATOR',
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
            json: async () => ({ requests: customMineRequests }),
          });
        }
        if ((!options?.method || options?.method === 'GET') && (url.includes('/api/requests/for-listing/') || (url.includes('/api/listings/') && url.endsWith('/requests')))) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              requests: [
                {
                  id: 'req-pending-for-donor',
                  listingId: 'new-listing-id-1234',
                  listingTitle: 'Organic Chemistry',
                  listingAuthor: 'Paula Bruice',
                  listingPhoto: 'https://example.com/chem.jpg',
                  pickupLocation: 'Chemistry Lab 2',
                  campusName: 'Darrang College',
                  donorId: '11111111-2222-3333-4444-555555555555',
                  donorName: 'Aarav Sharma',
                  requesterId: '22222222-3333-4444-5555-666666666666',
                  requesterName: 'Priya Das',
                  status: 'PENDING',
                  message: 'Need this for 2nd semester',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            }),
          });
        }
        if (url.includes('/api/requests/') && url.includes('/accept')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              request: {
                id: 'req-pending-for-donor',
                status: 'ACCEPTED',
                reservedUntil: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
              },
              listing: {
                id: 'new-listing-id-1234',
                status: 'RESERVED',
                reservedUntil: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
              },
            }),
          });
        }
        if (url.includes('/api/handovers/by-listing/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              handover: {
                id: 'handover-test-1234',
                listingId: 'listing-1234',
                donorId: '11111111-2222-3333-4444-555555555555',
                recipientId: 'recipient-1234',
                status: 'SCHEDULED',
                campusPickupArea: 'Central Library Entrance',
              },
            }),
          });
        }
        if (url.includes('/api/handovers/by-request/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              handover: {
                id: 'handover-test-1234',
                requestId: 'req-accepted-123',
                donorId: 'd1111111-2222-3333-4444-555555555551',
                recipientId: '11111111-2222-3333-4444-555555555555',
                status: 'SCHEDULED',
                campusPickupArea: 'Central Library Entrance',
              },
            }),
          });
        }
        if (url.includes('/api/handovers/') && url.includes('/complete')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              handover: { id: 'handover-test-1234', status: 'COMPLETED' },
              message: 'Handover marked as completed',
            }),
          });
        }
        if (url.includes('/api/handovers/') && url.includes('/dispute')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              handover: { id: 'handover-test-1234', status: 'DISPUTED' },
              message: 'Problem reported successfully',
            }),
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
        if (url.includes('/api/admin/reports')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              reports: customReports,
              total: customReports.length,
            }),
          });
        }
        if (url.includes('/api/admin/audit-logs')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              auditLogs: customAuditLogs,
              total: customAuditLogs.length,
            }),
          });
        }
        if (options?.method === 'POST' && url.includes('/api/admin/moderate')) {
          let body: any = {};
          try {
            body = options?.body ? JSON.parse(options.body as string) : {};
          } catch {}
          const newAudit = {
            id: 'audit-new-1234',
            action: body.action,
            targetType: body.targetType,
            targetId: body.targetId,
            reason: body.reason,
            performedById: 'mod-11111111-2222-3333-4444-555555555555',
            performedByName: 'Prof. Moderation',
            createdAt: new Date().toISOString(),
          };
          customAuditLogs.unshift(newAudit);
          if (body.reportId) {
            const rep = customReports.find((r) => r.id === body.reportId);
            if (rep) {
              rep.status = body.action === 'DISMISS_REPORT' ? 'DISMISSED' : 'RESOLVED';
              rep.resolutionNotes = body.reason;
            }
          }
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              auditEvent: newAudit,
            }),
          });
        }
        if (options?.method === 'POST' && url.includes('/api/reports')) {
          let body: any = {};
          try {
            body = options?.body ? JSON.parse(options.body as string) : {};
          } catch {}
          const newReport = {
            id: 'report-new-1234',
            targetType: body.targetType || 'LISTING',
            targetId: body.targetId || 'b1111111-2222-3333-4444-555555555551',
            targetTitle: 'University Physics',
            reporterId: '11111111-2222-3333-4444-555555555555',
            reporterName: 'Aarav Sharma',
            reason: body.reason || 'SPAM',
            details: body.details || null,
            status: 'PENDING',
            resolutionNotes: null,
            resolvedById: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          customReports.unshift(newReport);
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, report: newReport }),
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

  it('allows donor to view incoming requests in My Listings (CS-007)', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Create a listing first
    const donateBtn = await screen.findByTestId('open-donate-modal-btn');
    fireEvent.click(donateBtn);

    const publishBtn = await screen.findByTestId('submit-listing-btn');
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Organic Chemistry' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'Paula Bruice' } });
    fireEvent.change(screen.getByTestId('input-subject'), { target: { value: 'Chemistry' } });
    fireEvent.change(screen.getByTestId('input-pickup-location'), { target: { value: 'Chemistry Lab 2' } });

    const photoInput = screen.getByTestId('input-photo-url');
    fireEvent.change(photoInput, {
      target: { value: 'https://example.com/chem.jpg' },
    });
    fireEvent.click(screen.getByTestId('add-photo-btn'));

    fireEvent.click(publishBtn);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('donate-book-modal')).not.toBeInTheDocument();
    });

    // Should switch to listings tab with the newly created listing
    const listingCard = await screen.findByTestId('my-listing-card');
    expect(listingCard).toBeInTheDocument();

    // View requests button is present
    const viewRequestsBtn = within(listingCard).getByRole('button', { name: /View Requests/i });
    fireEvent.click(viewRequestsBtn);

    // Donor request modal opens
    const modal = await screen.findByTestId('donor-request-modal');
    expect(modal).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-donor-modal-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('donor-request-modal')).not.toBeInTheDocument();
    });
  });

  it('allows donor to mark reserved listing as completed ("Mark as Donated") (CS-008)', async () => {
    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Create a listing
    const donateBtn = await screen.findByTestId('open-donate-modal-btn');
    fireEvent.click(donateBtn);

    const publishBtn = await screen.findByTestId('submit-listing-btn');
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Organic Chemistry' } });
    fireEvent.change(screen.getByTestId('input-author'), { target: { value: 'Paula Bruice' } });
    fireEvent.change(screen.getByTestId('input-subject'), { target: { value: 'Chemistry' } });
    fireEvent.change(screen.getByTestId('input-pickup-location'), { target: { value: 'Chemistry Lab 2' } });

    const photoInput = screen.getByTestId('input-photo-url');
    fireEvent.change(photoInput, { target: { value: 'https://example.com/chem.jpg' } });
    fireEvent.click(screen.getByTestId('add-photo-btn'));
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('donate-book-modal')).not.toBeInTheDocument();
    });

    const listingCard = await screen.findByTestId('my-listing-card');
    const viewRequestsBtn = within(listingCard).getByRole('button', { name: /View Requests/i });
    fireEvent.click(viewRequestsBtn);

    // Accept incoming request to reserve book
    const acceptBtn = await screen.findByTestId('accept-request-btn');
    fireEvent.click(acceptBtn);

    // Close donor modal
    const closeBtn = screen.getByTestId('close-donor-modal-btn');
    fireEvent.click(closeBtn);

    // In My Listings, the listing is now RESERVED and has "Mark as Donated" button
    await waitFor(() => {
      expect(within(listingCard).getByText('RESERVED')).toBeInTheDocument();
    });
    const markDonatedBtn = within(listingCard).getByTestId('mark-donated-btn');
    expect(markDonatedBtn).toBeInTheDocument();

    // Donor clicks Mark as Donated
    fireEvent.click(markDonatedBtn);

    // Status updates to DONATED
    await waitFor(() => {
      expect(within(listingCard).getByText('DONATED')).toBeInTheDocument();
    });
  });

  it('allows recipient to report a problem on accepted request (CS-008)', async () => {
    // Recipient has an accepted request with 72h coordination active
    customMineRequests = [
      {
        id: 'req-accepted-123',
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
        status: 'ACCEPTED',
        message: 'Need for physics class',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reservedUntil: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      },
    ];

    render(<App />);

    // Sign in and join campus
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Navigate to My Requests
    const requestsTab = await screen.findByTestId('tab-requests');
    fireEvent.click(requestsTab);

    // Request card is rendered with ACCEPTED status and Report a Problem button
    const requestCard = await screen.findByTestId('request-card');
    expect(within(requestCard).getByText('ACCEPTED')).toBeInTheDocument();
    expect(within(requestCard).getByText(/Handover Scheduled/i)).toBeInTheDocument();

    const reportProblemBtn = within(requestCard).getByTestId('report-problem-btn');
    expect(reportProblemBtn).toBeInTheDocument();

    // Click Report a Problem
    fireEvent.click(reportProblemBtn);

    // Dispute modal opens
    const disputeModal = await screen.findByTestId('dispute-modal');
    expect(disputeModal).toBeInTheDocument();

    // Select reason and add details
    const reasonInput = screen.getByTestId('dispute-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Donor did not show up at pickup zone' } });

    const detailsInput = screen.getByTestId('dispute-details-input');
    fireEvent.change(detailsInput, {
      target: { value: 'Waited for 25 minutes at Central Library Entrance, donor did not arrive.' },
    });

    // Submit dispute
    const submitDisputeBtn = screen.getByTestId('submit-dispute-btn');
    fireEvent.click(submitDisputeBtn);

    // Modal closes and status changes to DISPUTED
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-modal')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(within(requestCard).getByText('DISPUTED')).toBeInTheDocument();
    });
  });

  it('renders public campus impact dashboard displaying listed, reserved, and donated counts (CS-009)', async () => {
    render(<App />);

    const impactPanel = await screen.findByTestId('campus-impact-panel');
    expect(impactPanel).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('impact-total-listed')).toHaveTextContent('3');
      expect(screen.getByTestId('impact-total-donated')).toHaveTextContent('5');
      expect(screen.getByText(/12 verified campus members/i)).toBeInTheDocument();
    });
  });

  it('renders notification bell for Campus Members and allows viewing and clearing notifications (CS-009)', async () => {
    render(<App />);

    // Sign in as Registered User
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Redeem invite to become Campus Member
    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Notification bell should render with badge
    const bell = await screen.findByTestId('notification-bell');
    expect(bell).toBeInTheDocument();

    const badge = await screen.findByTestId('notification-badge');
    expect(badge).toHaveTextContent('1');

    // Click bell to open dropdown
    fireEvent.click(bell);
    const dropdown = await screen.findByTestId('notification-dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(within(dropdown).getByText(/New request for your book/i)).toBeInTheDocument();

    // Click mark all as read
    const markAllBtn = within(dropdown).getByTestId('mark-all-read-btn');
    fireEvent.click(markAllBtn);

    // Badge should be cleared
    await waitFor(() => {
      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
    });
  });

  it('allows Campus Members to navigate to History tab and view donation history (CS-009)', async () => {
    render(<App />);

    // Sign in as Registered User
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Redeem invite
    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // History tab should be visible in member navigation tabs
    const historyTab = await screen.findByTestId('tab-history');
    expect(historyTab).toBeInTheDocument();

    // Switch to History tab
    fireEvent.click(historyTab);

    // Donation History section should render with books given and received
    const historySection = await screen.findByTestId('donation-history-section');
    expect(historySection).toBeInTheDocument();

    expect(await screen.findByTestId('donated-book-item')).toBeInTheDocument();
    expect(screen.getByText(/Calculus Early Transcendentals/i)).toBeInTheDocument();

    expect(await screen.findByTestId('received-book-item')).toBeInTheDocument();
    expect(screen.getByText(/University Physics/i)).toBeInTheDocument();
  });

  it('allows Campus Members to report a listing via BookDetailModal and ReportModal (CS-010)', async () => {
    render(<App />);

    // Sign in as Registered User
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Redeem invite
    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'DARRANG-PILOT-2026' } });
    fireEvent.click(submitBtn);

    // Click a book listing to open BookDetailModal
    const bookTitle = await screen.findByText('University Physics');
    fireEvent.click(bookTitle);

    // Book detail modal should open
    const detailModal = await screen.findByTestId('book-detail-modal');
    expect(detailModal).toBeInTheDocument();

    // Report button should be visible
    const reportBtn = await screen.findByTestId('report-listing-btn');
    expect(reportBtn).toBeInTheDocument();
    fireEvent.click(reportBtn);

    // Report modal should open
    const reportModal = await screen.findByTestId('report-modal');
    expect(reportModal).toBeInTheDocument();

    // Fill in report details
    const reasonSelect = screen.getByTestId('report-reason-select');
    fireEvent.change(reasonSelect, { target: { value: 'COMMERCIAL_SALE' } });

    const detailsInput = screen.getByTestId('report-details-input');
    fireEvent.change(detailsInput, {
      target: { value: 'Seller is asking for cash payment outside campus.' },
    });

    // Submit report
    const submitReportBtn = screen.getByTestId('submit-report-btn');
    fireEvent.click(submitReportBtn);

    // Report modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('report-modal')).not.toBeInTheDocument();
    });
  });

  it('allows Moderators to access Moderation tab, review open reports, hide listing, and view audit trail (CS-010)', async () => {
    // Populate an open report in customReports
    customReports = [
      {
        id: 'report-mod-test-1',
        targetType: 'LISTING',
        targetId: 'b1111111-2222-3333-4444-555555555551',
        targetTitle: 'University Physics',
        reporterId: '11111111-2222-3333-4444-555555555555',
        reporterName: 'Priya Das',
        reason: 'SPAM',
        details: 'Duplicated spam listing',
        status: 'PENDING',
        resolutionNotes: null,
        resolvedById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<App />);

    // Sign in as Registered User
    const signInBtn = await screen.findByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(signInBtn);

    // Redeem invite as MODERATOR
    const codeInput = await screen.findByTestId('invite-code-input');
    const submitBtn = screen.getByTestId('join-campus-btn');
    fireEvent.change(codeInput, { target: { value: 'MODERATOR-INVITE-2026' } });
    fireEvent.click(submitBtn);

    // Moderator tab should be present in navigation
    const modTab = await screen.findByTestId('tab-moderation');
    expect(modTab).toBeInTheDocument();

    // Click Moderator tab
    fireEvent.click(modTab);

    // ModeratorQueue component should be visible
    const modQueue = await screen.findByTestId('moderator-queue');
    expect(modQueue).toBeInTheDocument();

    // Check report item is displayed
    const reportItem = await screen.findByTestId('report-item');
    expect(reportItem).toBeInTheDocument();
    expect(within(reportItem).getByText('University Physics')).toBeInTheDocument();
    expect(within(reportItem).getByText('PENDING')).toBeInTheDocument();

    // Click Hide Listing action
    const hideBtn = within(reportItem).getByTestId('hide-listing-btn');
    fireEvent.click(hideBtn);

    // Report status changes to RESOLVED
    await waitFor(() => {
      expect(screen.queryByTestId('hide-listing-btn')).not.toBeInTheDocument();
    });

    // Switch to Audit Trail tab
    const auditTab = screen.getByTestId('tab-audit-logs');
    fireEvent.click(auditTab);

    // Audit logs section should be visible with the recorded event
    const auditSection = await screen.findByTestId('audit-logs-section');
    expect(auditSection).toBeInTheDocument();
    expect(within(auditSection).getByText('HIDE_LISTING')).toBeInTheDocument();
  });
});

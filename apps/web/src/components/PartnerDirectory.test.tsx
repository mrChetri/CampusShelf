import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PartnerDirectory } from './PartnerDirectory';
import type { PartnerOrganization } from '@campusshelf/contracts';

const mockVerifiedLibrary: PartnerOrganization = {
  id: 'partner-1',
  name: 'Darrang College Central Library',
  type: 'CAMPUS_LIBRARY',
  campusId: 'campus-1',
  campusName: 'Darrang College',
  description: 'Official academic central library with textbook stacks and reading halls.',
  website: 'https://darrangcollege.edu.in/library',
  contactEmail: 'library@darrangcollege.edu.in',
  contactPhone: '+91 3712 220014',
  address: 'Central Campus, Tezpur',
  verificationStatus: 'VERIFIED',
  verifiedAt: '2026-11-20T00:00:00.000Z',
  adminReviewNotes: 'Verified official college library profile.',
  createdAt: '2026-11-20T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
};

const mockVerifiedNGO: PartnerOrganization = {
  id: 'partner-2',
  name: 'Tezpur Community Book Bank',
  type: 'NGO',
  campusId: null,
  campusName: null,
  description: 'Grassroots book bank collecting and circulating textbooks for underprivileged students.',
  website: 'https://tezpurbookbank.org',
  contactEmail: 'connect@tezpurbookbank.org',
  contactPhone: '+91 94350 99887',
  address: 'Mission Chariali, Tezpur',
  verificationStatus: 'VERIFIED',
  verifiedAt: '2026-11-21T00:00:00.000Z',
  adminReviewNotes: 'Verified registration documentation.',
  createdAt: '2026-11-21T00:00:00.000Z',
  updatedAt: '2026-11-21T00:00:00.000Z',
};

const mockPendingPartner: PartnerOrganization = {
  id: 'partner-3',
  name: 'Pending Learning Center',
  type: 'COMMUNITY_LIBRARY',
  campusId: null,
  campusName: null,
  description: 'New neighborhood reading room currently under review.',
  website: null,
  contactEmail: 'pending@learning.org',
  contactPhone: null,
  address: null,
  verificationStatus: 'PENDING',
  verifiedAt: null,
  adminReviewNotes: null,
  createdAt: '2026-11-22T00:00:00.000Z',
  updatedAt: '2026-11-22T00:00:00.000Z',
};

describe('PartnerDirectory Component (CS-013 Verified Partner Directory)', () => {
  it('renders directory with verified partner cards and verified badges', () => {
    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        isAdmin={false}
        onOnboardPartner={vi.fn()}
        onReviewPartner={vi.fn()}
      />
    );

    expect(screen.getByText('Darrang College Central Library')).toBeInTheDocument();
    expect(screen.getByText('Tezpur Community Book Bank')).toBeInTheDocument();

    // Verified badges rendered for approved partners
    const badges = screen.getAllByTestId('verified-partner-badge');
    expect(badges.length).toBe(2);
    expect(badges[0]).toHaveTextContent('🛡️ Verified Partner');
  });

  it('opens public partner profile modal with verified badge and admin review notes', () => {
    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        isAdmin={false}
        onOnboardPartner={vi.fn()}
        onReviewPartner={vi.fn()}
      />
    );

    // Click "View Profile"
    fireEvent.click(screen.getByTestId('view-partner-profile-partner-1'));

    // Modal is opened
    expect(screen.getByTestId('partner-detail-modal')).toBeInTheDocument();
    expect(screen.getByTestId('detail-verified-badge')).toHaveTextContent('🛡️ Verified Partner');
    expect(screen.getByText(/"Verified official college library profile."/)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-partner-detail-btn'));
    expect(screen.queryByTestId('partner-detail-modal')).not.toBeInTheDocument();
  });

  it('filters partner directory by type (e.g. NGO)', () => {
    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        isAdmin={false}
        onOnboardPartner={vi.fn()}
        onReviewPartner={vi.fn()}
      />
    );

    // Click NGO filter tab
    const ngoFilterBtn = screen.getByTestId('filter-type-NGO');
    fireEvent.click(ngoFilterBtn);

    expect(screen.getByText('Tezpur Community Book Bank')).toBeInTheDocument();
    expect(screen.queryByText('Darrang College Central Library')).not.toBeInTheDocument();

    // Reset filter to All
    const allFilterBtn = screen.getByTestId('filter-type-ALL');
    fireEvent.click(allFilterBtn);
    expect(screen.getByText('Darrang College Central Library')).toBeInTheDocument();
  });

  it('searches partners by keyword', () => {
    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        isAdmin={false}
        onOnboardPartner={vi.fn()}
        onReviewPartner={vi.fn()}
      />
    );

    const searchInput = screen.getByTestId('partner-search-input');
    fireEvent.change(searchInput, { target: { value: 'Central Library' } });

    expect(screen.getByText('Darrang College Central Library')).toBeInTheDocument();
    expect(screen.queryByText('Tezpur Community Book Bank')).not.toBeInTheDocument();
  });

  it('shows admin panel when isAdmin is true and allows onboarding a partner', async () => {
    const handleOnboard = vi.fn().mockResolvedValue(mockPendingPartner);

    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        allAdminPartners={[mockVerifiedLibrary, mockVerifiedNGO, mockPendingPartner]}
        isAdmin={true}
        onOnboardPartner={handleOnboard}
        onReviewPartner={vi.fn()}
      />
    );

    // Admin should see admin toggle/tab
    const adminTab = screen.getByTestId('tab-admin-partners');
    expect(adminTab).toBeInTheDocument();
    fireEvent.click(adminTab);

    // Open Onboard modal/form
    const openOnboardBtn = screen.getByTestId('open-onboard-partner-btn');
    fireEvent.click(openOnboardBtn);

    fireEvent.change(screen.getByTestId('onboard-partner-name'), {
      target: { value: 'New Youth Library' },
    });
    fireEvent.change(screen.getByTestId('onboard-partner-type'), {
      target: { value: 'COMMUNITY_LIBRARY' },
    });
    fireEvent.change(screen.getByTestId('onboard-partner-desc'), {
      target: { value: 'Community learning center for neighborhood youth.' },
    });
    fireEvent.change(screen.getByTestId('onboard-partner-email'), {
      target: { value: 'youth@library.org' },
    });

    fireEvent.click(screen.getByTestId('submit-onboard-partner-btn'));

    await waitFor(() => {
      expect(handleOnboard).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Youth Library',
          type: 'COMMUNITY_LIBRARY',
          contactEmail: 'youth@library.org',
        })
      );
    });
  });

  it('allows admin to review a pending partner and submit verification', async () => {
    const handleReview = vi.fn().mockResolvedValue({
      ...mockPendingPartner,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      adminReviewNotes: 'Accreditation verified.',
    });

    render(
      <PartnerDirectory
        partners={[mockVerifiedLibrary, mockVerifiedNGO]}
        allAdminPartners={[mockVerifiedLibrary, mockVerifiedNGO, mockPendingPartner]}
        isAdmin={true}
        onOnboardPartner={vi.fn()}
        onReviewPartner={handleReview}
      />
    );

    // Go to admin view
    fireEvent.click(screen.getByTestId('tab-admin-partners'));

    // Find review button for pending partner
    const reviewBtn = screen.getByTestId(`review-partner-${mockPendingPartner.id}`);
    fireEvent.click(reviewBtn);

    // Review modal opened
    const notesInput = screen.getByTestId('admin-review-notes');
    fireEvent.change(notesInput, { target: { value: 'Accreditation verified.' } });

    const approveBtn = screen.getByTestId('approve-partner-btn');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(handleReview).toHaveBeenCalledWith(mockPendingPartner.id, {
        verificationStatus: 'VERIFIED',
        adminReviewNotes: 'Accreditation verified.',
      });
    });
  });
});

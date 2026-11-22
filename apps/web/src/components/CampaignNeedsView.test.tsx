import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CampaignNeedsView } from './CampaignNeedsView';
import type { CampaignNeed, PartnerOrganization } from '@campusshelf/contracts';

const mockPartner: PartnerOrganization = {
  id: 'partner-1',
  name: 'Tezpur Community Book Bank',
  type: 'NGO',
  campusId: null,
  campusName: null,
  description: 'Grassroots book bank collecting textbooks.',
  website: 'https://tezpurbookbank.org',
  contactEmail: 'connect@tezpurbookbank.org',
  contactPhone: '+91 94350 99887',
  address: 'Mission Chariali, Tezpur',
  verificationStatus: 'VERIFIED',
  verifiedAt: '2026-11-21T00:00:00.000Z',
  adminReviewNotes: null,
  createdAt: '2026-11-21T00:00:00.000Z',
  updatedAt: '2026-11-21T00:00:00.000Z',
};

const mockNeeds: CampaignNeed[] = [
  {
    id: 'need-1',
    partnerId: 'partner-1',
    partnerName: 'Tezpur Community Book Bank',
    title: 'B.Sc 1st Semester Physics Drive',
    category: 'ACADEMIC',
    course: 'B.Sc Physics',
    description: 'Collecting physics textbooks for underprivileged first-year scholars.',
    targetQuantity: 20,
    fulfilledQuantity: 8,
    status: 'ACTIVE',
    urgent: true,
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z',
  },
  {
    id: 'need-2',
    partnerId: 'partner-1',
    partnerName: 'Tezpur Community Book Bank',
    title: 'Assam Civil Services Exam Guides',
    category: 'COMPETITIVE_EXAM',
    course: null,
    description: 'General studies and CSAT prep guides for public library reading desk.',
    targetQuantity: 10,
    fulfilledQuantity: 10,
    status: 'FULFILLED',
    urgent: false,
    createdAt: '2026-11-21T00:00:00.000Z',
    updatedAt: '2026-11-21T00:00:00.000Z',
  },
];

describe('CampaignNeedsView Component (CS-014 NGO Book Needs)', () => {
  it('renders campaign needs with partner name, title, progress bar, and urgent badge', () => {
    render(
      <CampaignNeedsView
        needs={mockNeeds}
        partners={[mockPartner]}
        isAdmin={false}
        onDonateForNeed={vi.fn()}
      />
    );

    expect(screen.getByTestId('campaign-needs-view')).toBeInTheDocument();
    expect(screen.getByText('B.Sc 1st Semester Physics Drive')).toBeInTheDocument();
    expect(screen.getByText('Assam Civil Services Exam Guides')).toBeInTheDocument();

    // Urgent badge on need-1
    expect(screen.getByTestId('need-urgent-badge')).toHaveTextContent('URGENT NEED');

    // Progress text
    expect(screen.getByText('8 / 20 Books Collected')).toBeInTheDocument();
    expect(screen.getByText('10 / 10 Books Collected')).toBeInTheDocument();
  });

  it('filters needs by category and status', () => {
    render(
      <CampaignNeedsView
        needs={mockNeeds}
        partners={[mockPartner]}
        isAdmin={false}
        onDonateForNeed={vi.fn()}
      />
    );

    // Filter by COMPETITIVE_EXAM
    fireEvent.change(screen.getByTestId('filter-category'), {
      target: { value: 'COMPETITIVE_EXAM' },
    });

    expect(screen.queryByText('B.Sc 1st Semester Physics Drive')).not.toBeInTheDocument();
    expect(screen.getByText('Assam Civil Services Exam Guides')).toBeInTheDocument();

    // Reset category, filter by ACTIVE status
    fireEvent.change(screen.getByTestId('filter-category'), { target: { value: 'ALL' } });
    fireEvent.change(screen.getByTestId('filter-status'), { target: { value: 'ACTIVE' } });

    expect(screen.getByText('B.Sc 1st Semester Physics Drive')).toBeInTheDocument();
    expect(screen.queryByText('Assam Civil Services Exam Guides')).not.toBeInTheDocument();
  });

  it('safely filters needs when searching even if description or course is null', () => {
    const needWithNulls: CampaignNeed = {
      id: 'need-nulls',
      partnerId: 'partner-1',
      partnerName: 'Tezpur Community Book Bank',
      title: 'Elementary Arithmetic Textbooks',
      category: 'CHILDRENS_BOOKS',
      course: null,
      description: null,
      targetQuantity: 10,
      fulfilledQuantity: 0,
      status: 'ACTIVE',
      urgent: false,
      createdAt: '2026-11-22T00:00:00.000Z',
      updatedAt: '2026-11-22T00:00:00.000Z',
    };

    render(
      <CampaignNeedsView
        needs={[...mockNeeds, needWithNulls]}
        partners={[mockPartner]}
        isAdmin={false}
        onDonateForNeed={vi.fn()}
      />
    );

    // Typing in search input should not crash on null description
    fireEvent.change(screen.getByTestId('search-campaign-needs'), {
      target: { value: 'arithmetic' },
    });

    expect(screen.getByText('Elementary Arithmetic Textbooks')).toBeInTheDocument();
    expect(screen.queryByText('B.Sc 1st Semester Physics Drive')).not.toBeInTheDocument();
  });

  it('triggers onDonateForNeed callback when student clicks Donate for this Campaign', () => {
    const handleDonate = vi.fn();
    render(
      <CampaignNeedsView
        needs={mockNeeds}
        partners={[mockPartner]}
        isAdmin={false}
        onDonateForNeed={handleDonate}
      />
    );

    const donateBtn = screen.getByTestId('donate-for-campaign-btn');
    fireEvent.click(donateBtn);

    expect(handleDonate).toHaveBeenCalledTimes(1);
    expect(handleDonate).toHaveBeenCalledWith(mockNeeds[0]);
  });

  it('allows admin to publish a new book campaign need', async () => {
    const handleCreate = vi.fn().mockResolvedValue(undefined);
    render(
      <CampaignNeedsView
        needs={mockNeeds}
        partners={[mockPartner]}
        isAdmin={true}
        onDonateForNeed={vi.fn()}
        onCreateNeed={handleCreate}
      />
    );

    // Open create modal
    const openBtn = screen.getByTestId('open-create-need-btn');
    fireEvent.click(openBtn);

    expect(screen.getByTestId('campaign-need-modal')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByTestId('need-partner-select'), {
      target: { value: 'partner-1' },
    });
    fireEvent.change(screen.getByTestId('need-title-input'), {
      target: { value: 'Higher Secondary Chemistry Guides' },
    });
    fireEvent.change(screen.getByTestId('need-category-select'), {
      target: { value: 'ACADEMIC' },
    });
    fireEvent.change(screen.getByTestId('need-course-input'), {
      target: { value: 'Class 12' },
    });
    fireEvent.change(screen.getByTestId('need-description-input'), {
      target: { value: 'Chemistry textbook collection for high school learners.' },
    });
    fireEvent.change(screen.getByTestId('need-target-quantity-input'), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByTestId('need-urgent-checkbox'));

    // Submit
    fireEvent.click(screen.getByTestId('submit-need-btn'));

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledWith({
        partnerId: 'partner-1',
        title: 'Higher Secondary Chemistry Guides',
        category: 'ACADEMIC',
        course: 'Class 12',
        description: 'Chemistry textbook collection for high school learners.',
        targetQuantity: 15,
        urgent: true,
      });
    });
  });

  it('allows admin to edit an existing book campaign need', async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <CampaignNeedsView
        needs={mockNeeds}
        partners={[mockPartner]}
        isAdmin={true}
        onDonateForNeed={vi.fn()}
        onUpdateNeed={handleUpdate}
      />
    );

    // Open edit modal for need-1
    const editBtn = screen.getByTestId('edit-need-btn-need-1');
    fireEvent.click(editBtn);

    expect(screen.getByTestId('campaign-need-modal')).toBeInTheDocument();
    expect(screen.getByTestId('need-title-input')).toHaveValue('B.Sc 1st Semester Physics Drive');

    // Update target quantity and status
    fireEvent.change(screen.getByTestId('need-target-quantity-input'), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByTestId('need-status-select'), {
      target: { value: 'PAUSED' },
    });

    // Submit
    fireEvent.click(screen.getByTestId('submit-need-btn'));

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith('need-1', {
        title: 'B.Sc 1st Semester Physics Drive',
        category: 'ACADEMIC',
        course: 'B.Sc Physics',
        description: 'Collecting physics textbooks for underprivileged first-year scholars.',
        targetQuantity: 25,
        status: 'PAUSED',
        urgent: true,
      });
    });
  });
});

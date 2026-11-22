import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookDriveView } from './BookDriveView';
import type { BookDriveSummary } from '@campusshelf/contracts';

const mockDrive: BookDriveSummary = {
  campusId: '550e8400-e29b-41d4-a716-446655440000',
  campusName: 'Darrang College',
  campusSlug: 'darrang-college',
  driveTitle: 'Darrang College Semester Book Drive',
  academicYear: '2025-2026',
  totalBooksDonated: 48,
  totalBooksListed: 64,
  activeContributorsCount: 39,
  topCategories: [
    { category: 'Physics', count: 18 },
    { category: 'Chemistry', count: 14 },
    { category: 'Mathematics', count: 10 },
  ],
  shareUrl: 'https://campusshelf.org/drives/darrang-college',
  shareText: '📚 Join the Darrang College Semester Book Drive on CampusShelf! Over 48 textbooks donated & circulated between verified students. Explore or donate: https://campusshelf.org/drives/darrang-college',
};

describe('BookDriveView Component (CS-015 Semester Book Drive + Share Links)', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <BookDriveView
        drive={null}
        isLoading={true}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );
    expect(screen.getByTestId('drive-loading-state')).toBeInTheDocument();
  });

  it('renders empty/not found state when drive is null', () => {
    render(
      <BookDriveView
        drive={null}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );
    expect(screen.getByTestId('drive-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Campus Book Drive Not Found')).toBeInTheDocument();
  });

  it('renders drive landing page with title, aggregate metrics, and top categories', () => {
    render(
      <BookDriveView
        drive={mockDrive}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );

    expect(screen.getByTestId('book-drive-view')).toBeInTheDocument();
    expect(screen.getByTestId('drive-title')).toHaveTextContent('Darrang College Semester Book Drive');
    expect(screen.getByTestId('metric-books-donated')).toHaveTextContent('48');
    expect(screen.getByTestId('metric-contributors')).toHaveTextContent('39');
    expect(screen.getByTestId('metric-books-listed')).toHaveTextContent('64');

    expect(screen.getByText('Physics:')).toBeInTheDocument();
    expect(screen.getByText('Chemistry:')).toBeInTheDocument();
  });

  it('renders mobile share card preview with QR code SVG and campus branding', () => {
    render(
      <BookDriveView
        drive={mockDrive}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );

    expect(screen.getByTestId('drive-share-card')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-svg')).toBeInTheDocument();
  });

  it('copies share link and share text to clipboard with user feedback', async () => {
    render(
      <BookDriveView
        drive={mockDrive}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );

    const copyLinkBtn = screen.getByTestId('copy-share-link-btn');
    fireEvent.click(copyLinkBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockDrive.shareUrl);
    expect(await screen.findByText('✓ Copied!')).toBeInTheDocument();

    const copyTextBtn = screen.getByTestId('copy-share-text-btn');
    fireEvent.click(copyTextBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockDrive.shareText);
    expect(await screen.findByText('✓ Message Copied!')).toBeInTheDocument();
  });

  it('provides WhatsApp share link with encoded message', () => {
    render(
      <BookDriveView
        drive={mockDrive}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );

    const whatsappBtn = screen.getByTestId('share-whatsapp-btn');
    expect(whatsappBtn).toHaveAttribute('href');
    expect(whatsappBtn.getAttribute('href')).toContain('https://api.whatsapp.com/send?text=');
    expect(whatsappBtn.getAttribute('href')).toContain(encodeURIComponent(mockDrive.shareText));
  });

  it('enforces privacy guardrail: verifies privacy banner and no personal student details leaked', () => {
    const { container } = render(
      <BookDriveView
        drive={mockDrive}
        isLoading={false}
        onBrowseBooks={vi.fn()}
        onDonateBook={vi.fn()}
      />
    );

    expect(screen.getByTestId('drive-privacy-guardrail')).toBeInTheDocument();
    expect(screen.getByText(/Privacy Guardrail:/i)).toBeInTheDocument();

    // Verify container text contains no phone numbers or personal emails
    expect(container.textContent).not.toMatch(/\+91[\s-]?\d{10}/);
    expect(container.textContent).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  });
});

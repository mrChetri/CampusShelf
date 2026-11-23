import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { SkeletonListingCard, SkeletonList } from './SkeletonLoader';
import { BookDetailModal } from './BookDetailModal';
import { DisputeModal } from './DisputeModal';
import { ReportModal } from './ReportModal';
import { ExchangeProposalModal } from './ExchangeProposalModal';
import { BookDiscoveryFeed } from './BookDiscoveryFeed';
import type { PublicListing } from '@campusshelf/contracts';

const mockListing: PublicListing = {
  id: 'listing-qa-1',
  title: 'Engineering Mathematics',
  author: 'K.A. Stroud',
  subject: 'Mathematics',
  condition: 'LIKE_NEW',
  status: 'AVAILABLE',
  type: 'DONATION',
  pickupLocation: 'Central Library Portico',
  photos: ['https://example.com/math.jpg'],
  donorId: 'donor-1',
  donorName: 'Ananya Roy',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CS-017 Visual Polish and Responsive QA', () => {
  describe('ErrorBoundary Seam', () => {
    const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Simulation of catastrophic render error');
      }
      return <div data-testid="healthy-child">Healthy Content</div>;
    };

    it('renders child components when there are no errors', () => {
      render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('healthy-child')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('catches render exceptions, displays user-friendly fallback, and allows retry', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let throwFlag = true;
      const DynamicChild = () => {
        if (throwFlag) throw new Error('Dynamic failure');
        return <div data-testid="recovered-child">Recovered Content</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <DynamicChild />
        </ErrorBoundary>
      );

      // Verify fallback is rendered
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Dynamic failure/i)).toBeInTheDocument();

      // Clear throw and click retry
      throwFlag = false;
      const retryBtn = screen.getByTestId('error-boundary-retry-btn');
      expect(retryBtn).toHaveAttribute('type', 'button');
      fireEvent.click(retryBtn);

      rerender(
        <ErrorBoundary>
          <DynamicChild />
        </ErrorBoundary>
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('SkeletonLoader Seam', () => {
    it('renders skeleton loading placeholders with accessible status announcement', () => {
      render(<SkeletonList count={3} />);

      const statusContainer = screen.getByRole('status');
      expect(statusContainer).toBeInTheDocument();
      expect(statusContainer).toHaveAttribute('aria-label', 'Loading content...');

      const cards = screen.getAllByTestId('skeleton-listing-card');
      expect(cards).toHaveLength(3);
      cards.forEach((card) => {
        expect(card).toHaveAttribute('aria-hidden', 'true');
        expect(card.className).toContain('animate-pulse');
      });
    });

    it('renders SkeletonList inside BookDiscoveryFeed during loading state', () => {
      // Mock fetch that hangs or delays to keep isLoading true
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

      render(
        <BookDiscoveryFeed
          campuses={[{ id: 'c-1', name: 'Test Campus', slug: 'test-campus', city: 'Tezpur', state: 'Assam', active: true }]}
          onSelectListing={vi.fn()}
        />
      );

      const skeletonContainer = screen.getByTestId('listings-skeleton');
      expect(skeletonContainer).toBeInTheDocument();
      expect(skeletonContainer).toHaveAttribute('role', 'status');
      expect(skeletonContainer).toHaveAttribute('aria-label', 'Loading content...');
    });
  });

  describe('Accessible Screen Reader Labels (aria-label) and Modal Semantics', () => {
    it('ensures BookDetailModal has dialog role, aria-modal, and accessible close button', () => {
      render(
        <BookDetailModal
          listing={mockListing}
          isOpen={true}
          onClose={vi.fn()}
          currentUserId="user-viewer"
          isCampusMember={true}
          onRequestBook={vi.fn()}
        />
      );

      const closeBtn = screen.getByTestId('close-detail-modal-btn');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('ensures DisputeModal has accessible close button with aria-label', () => {
      const mockRequest = {
        id: 'req-123',
        listingId: 'listing-qa-1',
        requesterId: 'user-requester-1',
        requesterName: 'Deepak Das',
        status: 'ACCEPTED' as const,
        note: null,
        declineReason: null,
        reservedUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        listingTitle: 'Engineering Mathematics',
        listingAuthor: 'K.A. Stroud',
        listingPickupLocation: 'Central Library Portico',
      };

      render(
        <DisputeModal
          isOpen={true}
          request={mockRequest}
          onClose={vi.fn()}
          onSubmitDispute={vi.fn()}
        />
      );

      const closeBtn = screen.getByTestId('close-dispute-modal-btn');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('ensures ReportModal has accessible close button with aria-label', () => {
      render(
        <ReportModal
          isOpen={true}
          target={{
            targetType: 'LISTING',
            targetId: 'listing-123',
            targetTitle: 'Test Book',
          }}
          onClose={vi.fn()}
          onSubmitReport={vi.fn()}
        />
      );

      const closeBtn = screen.getByTestId('close-report-modal-btn');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('ensures ExchangeProposalModal has accessible close button with aria-label', () => {
      render(
        <ExchangeProposalModal
          isOpen={true}
          targetListing={mockListing}
          myAvailableListings={[]}
          onClose={vi.fn()}
          onSubmitProposal={vi.fn()}
        />
      );

      const closeBtn = screen.getByTestId('close-exchange-modal-btn');
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModeratorQueue } from './ModeratorQueue';
import type { Report, AuditEvent } from '@campusshelf/contracts';

const mockReports: Report[] = [
  {
    id: 'rep-1',
    reporterId: 'user-1',
    reporterName: 'Rahul Kalita',
    targetType: 'LISTING',
    targetId: 'listing-1',
    targetTitle: 'Commercial Chemistry Set',
    reason: 'COMMERCIAL_SALE',
    details: 'Bulk selling printed notes.',
    status: 'PENDING',
    createdAt: '2026-11-22T10:00:00.000Z',
    updatedAt: '2026-11-22T10:00:00.000Z',
  },
  {
    id: 'rep-2',
    reporterId: 'user-2',
    reporterName: 'Priya Das',
    targetType: 'USER',
    targetId: 'user-3',
    targetTitle: 'Bad Actor',
    reason: 'HARASSMENT',
    details: 'Inappropriate language in chat.',
    status: 'PENDING',
    createdAt: '2026-11-22T10:30:00.000Z',
    updatedAt: '2026-11-22T10:30:00.000Z',
  },
];

const mockAuditLogs: AuditEvent[] = [
  {
    id: 'audit-1',
    actorId: 'mod-1',
    actorName: 'Lead Mod',
    action: 'HIDE_LISTING',
    targetType: 'LISTING',
    targetId: 'listing-old',
    reason: 'Duplicate spam',
    createdAt: '2026-11-21T10:00:00.000Z',
  },
];

describe('ModeratorQueue Component', () => {
  it('renders report items with details and action buttons', () => {
    render(
      <ModeratorQueue
        reports={mockReports}
        auditLogs={mockAuditLogs}
        onModerateAction={vi.fn()}
      />
    );

    expect(screen.getByTestId('moderator-queue')).toBeInTheDocument();
    expect(screen.getAllByTestId('report-item')).toHaveLength(2);
    expect(screen.getByText(/Commercial Chemistry Set/i)).toBeInTheDocument();
    expect(screen.getByTestId('hide-listing-btn')).toBeInTheDocument();
    expect(screen.getByTestId('suspend-user-btn')).toBeInTheDocument();
    expect(screen.getAllByTestId('dismiss-report-btn')).toHaveLength(2);
  });

  it('triggers onModerateAction with HIDE_LISTING on listing report', async () => {
    const handleModerate = vi.fn().mockResolvedValue(undefined);
    render(
      <ModeratorQueue
        reports={mockReports}
        auditLogs={mockAuditLogs}
        onModerateAction={handleModerate}
      />
    );

    fireEvent.click(screen.getByTestId('hide-listing-btn'));

    await waitFor(() => {
      expect(handleModerate).toHaveBeenCalledWith(
        'HIDE_LISTING',
        'LISTING',
        'listing-1',
        expect.stringContaining('listing hidden'),
        'rep-1'
      );
    });
  });

  it('switches to audit trail view and displays logged audit events', () => {
    render(
      <ModeratorQueue
        reports={mockReports}
        auditLogs={mockAuditLogs}
        onModerateAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-audit-logs'));

    expect(screen.getByTestId('audit-logs-section')).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-item')).toBeInTheDocument();
    expect(screen.getByText(/Lead Mod/i)).toBeInTheDocument();
  });
});

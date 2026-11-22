import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import type { Notification } from '@campusshelf/contracts';

const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    userId: 'u-1',
    type: 'REQUEST_RECEIVED',
    title: 'New request for your book',
    body: 'Priya Das requested "University Physics".',
    entityId: 'req-1',
    read: false,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'n-2',
    userId: 'u-1',
    type: 'HANDOVER_COMPLETED',
    title: 'Handover completed! 📚',
    body: 'Your handover was completed.',
    entityId: 'h-1',
    read: true,
    createdAt: '2026-11-19T10:00:00.000Z',
    updatedAt: '2026-11-19T10:00:00.000Z',
  },
];

describe('NotificationBell Component', () => {
  it('renders notification bell with badge for unread notifications', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkAllRead={vi.fn()}
        onMarkRead={vi.fn()}
      />
    );

    const bell = screen.getByTestId('notification-bell');
    expect(bell).toBeInTheDocument();
    const badge = screen.getByTestId('notification-badge');
    expect(badge).toHaveTextContent('1');
  });

  it('opens notification dropdown on bell click', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkAllRead={vi.fn()}
        onMarkRead={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('notification-bell'));

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    expect(screen.getByText(/New request for your book/i)).toBeInTheDocument();
    expect(screen.getByText(/Handover completed/i)).toBeInTheDocument();
  });

  it('triggers onMarkAllRead when clicking mark all as read button', () => {
    const handleMarkAllRead = vi.fn();
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkAllRead={handleMarkAllRead}
        onMarkRead={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('notification-bell'));
    const markAllBtn = screen.getByTestId('mark-all-read-btn');
    fireEvent.click(markAllBtn);

    expect(handleMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('triggers onMarkRead when clicking an individual notification item', () => {
    const handleMarkRead = vi.fn();
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkAllRead={vi.fn()}
        onMarkRead={handleMarkRead}
      />
    );

    fireEvent.click(screen.getByTestId('notification-bell'));
    const items = screen.getAllByTestId('notification-item');
    fireEvent.click(items[0]);

    expect(handleMarkRead).toHaveBeenCalledWith('n-1');
  });
});

import React, { useState } from 'react';
import type { Notification } from '@campusshelf/contracts';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
}: NotificationBellProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        data-testid="notification-bell"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative p-2 text-slate-600 hover:text-emerald-700 transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                data-testid="mark-all-read-btn"
                onClick={() => { onMarkAllRead(); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  data-testid="notification-item"
                  onClick={() => onMarkRead(n.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                    n.read ? 'opacity-60' : 'bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                    <div className={!n.read ? '' : 'pl-4'}>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

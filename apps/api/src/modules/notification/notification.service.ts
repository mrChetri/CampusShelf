import { randomUUID } from 'node:crypto';
import type { Notification, CreateNotificationParams } from './notification.schema';

// ---------------------------------------------------------------------------
// NotificationService — in-memory, no imports from other feature services.
// All callers pass plain data params to avoid circular dependencies.
// ---------------------------------------------------------------------------
export class NotificationService {
  private notifications: Notification[] = [];

  public createNotification(params: CreateNotificationParams): Notification {
    const now = new Date().toISOString();
    const notification: Notification = {
      id: randomUUID(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      entityId: params.entityId ?? null,
      read: false,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.unshift(notification);
    return notification;
  }

  public getMyNotifications(userId: string): {
    notifications: Notification[];
    unreadCount: number;
  } {
    const userNotifications = this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = userNotifications.filter((n) => !n.read).length;
    return { notifications: userNotifications, unreadCount };
  }

  public markAsRead(
    userId: string,
    notificationIds: string[]
  ): { updatedCount: number } {
    let updatedCount = 0;
    const now = new Date().toISOString();
    for (const n of this.notifications) {
      if (n.userId === userId && notificationIds.includes(n.id) && !n.read) {
        n.read = true;
        n.updatedAt = now;
        updatedCount++;
      }
    }
    return { updatedCount };
  }

  public markAllAsRead(userId: string): { updatedCount: number } {
    let updatedCount = 0;
    const now = new Date().toISOString();
    for (const n of this.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        n.updatedAt = now;
        updatedCount++;
      }
    }
    return { updatedCount };
  }

  public resetForTesting(): void {
    this.notifications = [];
  }
}

export const notificationService = new NotificationService();

import { describe, expect, it } from 'vitest';
import {
  NotificationTypeEnum,
  NotificationSchema,
  NotificationsResponseSchema,
  MarkReadInputSchema,
  MarkReadResponseSchema,
  CampusImpactSchema,
  CampusImpactResponseSchema,
  DonationHistorySchema,
  DonationHistoryResponseSchema,
} from './notification.contract';

const baseNotification = {
  id: '11111111-1111-4111-a111-111111111111',
  userId: '22222222-2222-4222-a222-222222222222',
  type: 'REQUEST_RECEIVED' as const,
  title: 'New request for your book',
  body: 'Aarav has requested your listing.',
  entityId: '33333333-3333-4333-a333-333333333333',
  read: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('NotificationTypeEnum', () => {
  it('accepts all valid notification types', () => {
    const types = [
      'REQUEST_RECEIVED',
      'REQUEST_ACCEPTED',
      'REQUEST_DECLINED',
      'HANDOVER_COMPLETED',
      'HANDOVER_DISPUTED',
      'RESERVATION_EXPIRED',
    ];
    for (const t of types) {
      expect(NotificationTypeEnum.safeParse(t).success).toBe(true);
    }
  });

  it('rejects an unknown type', () => {
    expect(NotificationTypeEnum.safeParse('UNKNOWN_TYPE').success).toBe(false);
  });
});

describe('NotificationSchema', () => {
  it('parses a valid notification', () => {
    const result = NotificationSchema.safeParse(baseNotification);
    expect(result.success).toBe(true);
  });

  it('allows nullable entityId', () => {
    const result = NotificationSchema.safeParse({ ...baseNotification, entityId: null });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const { title: _t, ...bad } = baseNotification;
    expect(NotificationSchema.safeParse(bad).success).toBe(false);
  });
});

describe('NotificationsResponseSchema', () => {
  it('parses a valid response', () => {
    const result = NotificationsResponseSchema.safeParse({
      notifications: [baseNotification],
      unreadCount: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative unreadCount', () => {
    const result = NotificationsResponseSchema.safeParse({
      notifications: [],
      unreadCount: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('MarkReadInputSchema', () => {
  it('parses valid notification IDs', () => {
    const result = MarkReadInputSchema.safeParse({
      notificationIds: ['11111111-1111-4111-a111-111111111111'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty array', () => {
    const result = MarkReadInputSchema.safeParse({ notificationIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID strings', () => {
    const result = MarkReadInputSchema.safeParse({ notificationIds: ['not-a-uuid'] });
    expect(result.success).toBe(false);
  });
});

describe('MarkReadResponseSchema', () => {
  it('parses valid response', () => {
    const result = MarkReadResponseSchema.safeParse({ success: true, updatedCount: 2 });
    expect(result.success).toBe(true);
  });
});

describe('CampusImpactSchema', () => {
  const baseImpact = {
    campusId: '44444444-4444-4444-a444-444444444444',
    campusName: 'Darrang College',
    totalListed: 10,
    totalReserved: 3,
    totalDonated: 5,
    totalMembers: 42,
  };

  it('parses a valid campus impact object', () => {
    expect(CampusImpactSchema.safeParse(baseImpact).success).toBe(true);
  });

  it('rejects negative counts', () => {
    expect(CampusImpactSchema.safeParse({ ...baseImpact, totalListed: -1 }).success).toBe(false);
  });

  it('wraps in CampusImpactResponseSchema', () => {
    expect(
      CampusImpactResponseSchema.safeParse({ impact: baseImpact }).success
    ).toBe(true);
  });
});

describe('DonationHistorySchema', () => {
  it('parses valid empty history', () => {
    const result = DonationHistorySchema.safeParse({
      booksGiven: [],
      booksReceived: [],
    });
    expect(result.success).toBe(true);
  });

  it('wraps in DonationHistoryResponseSchema', () => {
    const result = DonationHistoryResponseSchema.safeParse({
      history: { booksGiven: [], booksReceived: [] },
    });
    expect(result.success).toBe(true);
  });
});

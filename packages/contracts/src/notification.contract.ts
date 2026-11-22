import { z } from 'zod';
import { ListingSchema } from './listing.contract';
import { BookRequestSchema } from './request.contract';

// ---------------------------------------------------------------------------
// Notification type enum
// ---------------------------------------------------------------------------
export const NotificationTypeEnum = z.enum([
  'REQUEST_RECEIVED',
  'REQUEST_ACCEPTED',
  'REQUEST_DECLINED',
  'HANDOVER_COMPLETED',
  'HANDOVER_DISPUTED',
  'RESERVATION_EXPIRED',
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

// ---------------------------------------------------------------------------
// Core notification schema
// ---------------------------------------------------------------------------
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeEnum,
  title: z.string(),
  body: z.string(),
  entityId: z.string().nullable().optional(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// ---------------------------------------------------------------------------
// Response: list notifications
// ---------------------------------------------------------------------------
export const NotificationsResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  unreadCount: z.number().int().nonnegative(),
});

export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;

// ---------------------------------------------------------------------------
// Mark as read input / response
// ---------------------------------------------------------------------------
export const MarkReadInputSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});

export type MarkReadInput = z.infer<typeof MarkReadInputSchema>;

export const MarkReadResponseSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number().int().nonnegative(),
});

export type MarkReadResponse = z.infer<typeof MarkReadResponseSchema>;

// ---------------------------------------------------------------------------
// Campus impact dashboard
// ---------------------------------------------------------------------------
export const CampusImpactSchema = z.object({
  campusId: z.string().uuid(),
  campusName: z.string(),
  totalListed: z.number().int().nonnegative(),
  totalReserved: z.number().int().nonnegative(),
  totalDonated: z.number().int().nonnegative(),
  totalMembers: z.number().int().nonnegative(),
});

export type CampusImpact = z.infer<typeof CampusImpactSchema>;

export const CampusImpactResponseSchema = z.object({
  impact: CampusImpactSchema,
});

export type CampusImpactResponse = z.infer<typeof CampusImpactResponseSchema>;

// ---------------------------------------------------------------------------
// Donation history
// ---------------------------------------------------------------------------
export const DonationHistorySchema = z.object({
  booksGiven: z.array(ListingSchema),
  booksReceived: z.array(BookRequestSchema),
});

export type DonationHistory = z.infer<typeof DonationHistorySchema>;

export const DonationHistoryResponseSchema = z.object({
  history: DonationHistorySchema,
});

export type DonationHistoryResponse = z.infer<typeof DonationHistoryResponseSchema>;

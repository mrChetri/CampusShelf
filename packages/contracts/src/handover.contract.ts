import { z } from 'zod';
import { ListingTypeEnum } from './listing.contract';

export const HandoverStatusEnum = z.enum([
  'SCHEDULED',
  'COMPLETED',
  'DISPUTED',
  'EXPIRED',
]);

export type HandoverStatus = z.infer<typeof HandoverStatusEnum>;

export const HandoverSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  listingTitle: z.string(),
  listingAuthor: z.string(),
  requestId: z.string().uuid(),
  donorId: z.string().uuid(),
  donorName: z.string(),
  recipientId: z.string().uuid(),
  recipientName: z.string(),
  pickupLocation: z.string(),
  scheduleNotes: z.string().nullable().optional(),
  status: HandoverStatusEnum.default('SCHEDULED'),
  listingType: ListingTypeEnum.default('DONATION').optional(),
  price: z.number().int().nullable().optional(),
  reservedUntil: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
  disputedAt: z.string().datetime().nullable().optional(),
  disputeReason: z.string().nullable().optional(),
  disputeDetails: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Handover = z.infer<typeof HandoverSchema>;

export const HandoverResponseSchema = z.object({
  handover: HandoverSchema,
});

export type HandoverResponse = z.infer<typeof HandoverResponseSchema>;

export const CompleteHandoverResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  handover: HandoverSchema,
});

export type CompleteHandoverResponse = z.infer<typeof CompleteHandoverResponseSchema>;

export const DisputeHandoverInputSchema = z.object({
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters').max(200, 'Reason cannot exceed 200 characters'),
  details: z.string().trim().max(500, 'Details cannot exceed 500 characters').optional(),
});

export type DisputeHandoverInput = z.infer<typeof DisputeHandoverInputSchema>;

export const DisputeHandoverResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  handover: HandoverSchema,
});

export type DisputeHandoverResponse = z.infer<typeof DisputeHandoverResponseSchema>;

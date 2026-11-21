import { z } from 'zod';

export const RequestStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'CANCELLED',
  'COMPLETED',
]);

export type RequestStatus = z.infer<typeof RequestStatusEnum>;

export const CreateBookRequestInputSchema = z.object({
  message: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional(),
});

export type CreateBookRequestInput = z.infer<typeof CreateBookRequestInputSchema>;

export const BookRequestSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  listingTitle: z.string(),
  listingAuthor: z.string(),
  listingPhoto: z.string().url().nullable().optional(),
  pickupLocation: z.string(),
  campusName: z.string().optional(),
  donorId: z.string().uuid(),
  donorName: z.string(),
  requesterId: z.string().uuid(),
  requesterName: z.string(),
  status: RequestStatusEnum.default('PENDING'),
  message: z.string().nullable().optional(),
  reservedUntil: z.string().datetime().nullable().optional(),
  declineReason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BookRequest = z.infer<typeof BookRequestSchema>;

export const DeclineBookRequestInputSchema = z.object({
  reason: z.string().trim().max(300, 'Reason cannot exceed 300 characters').optional(),
});

export type DeclineBookRequestInput = z.infer<typeof DeclineBookRequestInputSchema>;

export const BookRequestResponseSchema = z.object({
  request: BookRequestSchema,
});

export type BookRequestResponse = z.infer<typeof BookRequestResponseSchema>;

export const MyRequestsResponseSchema = z.object({
  requests: z.array(BookRequestSchema),
});

export type MyRequestsResponse = z.infer<typeof MyRequestsResponseSchema>;

export const CancelBookRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  request: BookRequestSchema,
});

export type CancelBookRequestResponse = z.infer<typeof CancelBookRequestResponseSchema>;

export const AcceptBookRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  request: BookRequestSchema,
  listing: z.object({
    id: z.string().uuid(),
    status: z.string(),
    reservedUntil: z.string().datetime().nullable().optional(),
  }),
});

export type AcceptBookRequestResponse = z.infer<typeof AcceptBookRequestResponseSchema>;

export const DeclineBookRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  request: BookRequestSchema,
});

export type DeclineBookRequestResponse = z.infer<typeof DeclineBookRequestResponseSchema>;

export const ListingRequestsResponseSchema = z.object({
  requests: z.array(BookRequestSchema),
});

export type ListingRequestsResponse = z.infer<typeof ListingRequestsResponseSchema>;

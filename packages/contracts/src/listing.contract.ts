import { z } from 'zod';

export const ListingConditionEnum = z.enum([
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
  'POOR',
]);

export type ListingCondition = z.infer<typeof ListingConditionEnum>;

export const ListingStatusEnum = z.enum([
  'AVAILABLE',
  'RESERVED',
  'DONATED',
  'WITHDRAWN',
  'HIDDEN',
]);

export type ListingStatus = z.infer<typeof ListingStatusEnum>;

export const ListingTypeEnum = z.enum(['DONATION', 'SALE']);

export type ListingType = z.infer<typeof ListingTypeEnum>;

export const CreateListingInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  author: z.string().trim().min(2).max(150),
  isbn: z.string().trim().max(32).optional(),
  edition: z.string().trim().max(64).optional(),
  course: z.string().trim().max(100).optional(),
  subject: z.string().trim().min(2).max(100),
  semester: z.string().trim().max(50).optional(),
  condition: ListingConditionEnum,
  pickupLocation: z.string().trim().min(3).max(200),
  photos: z
    .array(z.string().url())
    .min(1, 'At least 1 photo is required')
    .max(5, 'Maximum of 5 photos allowed per listing (ADR-0002)'),
  description: z.string().trim().max(1000).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingInputSchema>;

export const ListingSchema = z.object({
  id: z.string().uuid(),
  donorId: z.string().uuid(),
  donorName: z.string(),
  campusId: z.string().uuid(),
  campusName: z.string().optional(),
  title: z.string(),
  author: z.string(),
  isbn: z.string().nullable().optional(),
  edition: z.string().nullable().optional(),
  course: z.string().nullable().optional(),
  subject: z.string(),
  semester: z.string().nullable().optional(),
  condition: ListingConditionEnum,
  pickupLocation: z.string(),
  photos: z.array(z.string().url()),
  description: z.string().nullable().optional(),
  status: ListingStatusEnum.default('AVAILABLE'),
  reservedUntil: z.string().datetime().nullable().optional(),
  type: ListingTypeEnum.default('DONATION'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Listing = z.infer<typeof ListingSchema>;

export const ListingResponseSchema = z.object({
  listing: ListingSchema,
});

export type ListingResponse = z.infer<typeof ListingResponseSchema>;

export const MyListingsResponseSchema = z.object({
  listings: z.array(ListingSchema),
});

export type MyListingsResponse = z.infer<typeof MyListingsResponseSchema>;

export const WithdrawListingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  listing: ListingSchema,
});

export type WithdrawListingResponse = z.infer<typeof WithdrawListingResponseSchema>;

export const ListingsQuerySchema = z.object({
  search: z.string().trim().optional(),
  campusId: z.string().uuid().optional(),
  condition: ListingConditionEnum.optional(),
  course: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  type: ListingTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export type ListingsQuery = z.infer<typeof ListingsQuerySchema>;

export const PublicListingSchema = ListingSchema;
export type PublicListing = z.infer<typeof PublicListingSchema>;

export const ListingsFeedResponseSchema = z.object({
  listings: z.array(PublicListingSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});

export type ListingsFeedResponse = z.infer<typeof ListingsFeedResponseSchema>;

export const ListingDetailResponseSchema = z.object({
  listing: PublicListingSchema,
});

export type ListingDetailResponse = z.infer<typeof ListingDetailResponseSchema>;


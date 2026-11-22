import { z } from 'zod';

export const ExchangeProposalStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
]);

export type ExchangeProposalStatus = z.infer<typeof ExchangeProposalStatusSchema>;

export const CreateExchangeProposalInputSchema = z.object({
  targetListingId: z.string().uuid(),
  offeredListingId: z.string().uuid(),
  message: z.string().trim().max(500).optional(),
});

export type CreateExchangeProposalInput = z.infer<typeof CreateExchangeProposalInputSchema>;

export const ExchangeProposalSchema = z.object({
  id: z.string().uuid(),
  proposerId: z.string().uuid(),
  proposerName: z.string(),
  targetOwnerId: z.string().uuid(),
  targetOwnerName: z.string(),
  targetListingId: z.string().uuid(),
  targetListingTitle: z.string(),
  targetListingPhoto: z.string().nullable().optional(),
  offeredListingId: z.string().uuid(),
  offeredListingTitle: z.string(),
  offeredListingPhoto: z.string().nullable().optional(),
  pickupLocation: z.string(),
  message: z.string().nullable().optional(),
  status: ExchangeProposalStatusSchema.default('PENDING'),
  reservedUntil: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ExchangeProposal = z.infer<typeof ExchangeProposalSchema>;

export const ExchangeProposalResponseSchema = z.object({
  proposal: ExchangeProposalSchema,
});

export type ExchangeProposalResponse = z.infer<typeof ExchangeProposalResponseSchema>;

export const ExchangeProposalsListResponseSchema = z.object({
  incoming: z.array(ExchangeProposalSchema),
  outgoing: z.array(ExchangeProposalSchema),
});

export type ExchangeProposalsListResponse = z.infer<typeof ExchangeProposalsListResponseSchema>;

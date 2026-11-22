import { z } from 'zod';

export const CampaignNeedStatusSchema = z.enum([
  'ACTIVE',
  'FULFILLED',
  'PAUSED',
]);

export type CampaignNeedStatus = z.infer<typeof CampaignNeedStatusSchema>;

export const CampaignNeedCategorySchema = z.enum([
  'ACADEMIC',
  'COMPETITIVE_EXAM',
  'LITERATURE_FICTION',
  'GENERAL_READING',
  'CHILDRENS_BOOKS',
]);

export type CampaignNeedCategory = z.infer<typeof CampaignNeedCategorySchema>;

export const CreateCampaignNeedInputSchema = z.object({
  partnerId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(100),
  course: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  targetQuantity: z.number().int().min(1, 'Target quantity must be at least 1').max(10000),
  urgent: z.boolean().default(false).optional(),
});

export type CreateCampaignNeedInput = z.infer<typeof CreateCampaignNeedInputSchema>;

export const UpdateCampaignNeedInputSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  category: z.string().trim().min(2).max(100).optional(),
  course: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  targetQuantity: z.number().int().min(1).max(10000).optional(),
  status: CampaignNeedStatusSchema.optional(),
  urgent: z.boolean().optional(),
});

export type UpdateCampaignNeedInput = z.infer<typeof UpdateCampaignNeedInputSchema>;

export const CampaignNeedSchema = z.object({
  id: z.string().uuid(),
  partnerId: z.string().uuid(),
  partnerName: z.string(),
  title: z.string(),
  category: z.string(),
  course: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  targetQuantity: z.number().int().positive(),
  fulfilledQuantity: z.number().int().nonnegative().default(0),
  status: CampaignNeedStatusSchema.default('ACTIVE'),
  urgent: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CampaignNeed = z.infer<typeof CampaignNeedSchema>;

export const CampaignNeedResponseSchema = z.object({
  need: CampaignNeedSchema,
});

export type CampaignNeedResponse = z.infer<typeof CampaignNeedResponseSchema>;

export const CampaignNeedsListResponseSchema = z.object({
  needs: z.array(CampaignNeedSchema),
  total: z.number().int().nonnegative(),
});

export type CampaignNeedsListResponse = z.infer<typeof CampaignNeedsListResponseSchema>;

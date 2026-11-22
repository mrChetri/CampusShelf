import { z } from 'zod';

export const PartnerVerificationStatusSchema = z.enum([
  'PENDING',
  'VERIFIED',
  'REJECTED',
]);

export type PartnerVerificationStatus = z.infer<typeof PartnerVerificationStatusSchema>;

export const PartnerTypeSchema = z.enum([
  'CAMPUS_LIBRARY',
  'COMMUNITY_LIBRARY',
  'STUDENT_UNION',
  'NGO',
]);

export type PartnerType = z.infer<typeof PartnerTypeSchema>;

export const CreatePartnerInputSchema = z.object({
  name: z.string().min(2).max(150),
  type: PartnerTypeSchema,
  campusId: z.string().uuid().nullable().optional(),
  description: z.string().min(10).max(2000),
  website: z.string().url().nullable().optional().or(z.literal('')),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(30).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerInputSchema>;

export const UpdatePartnerInputSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  type: PartnerTypeSchema.optional(),
  campusId: z.string().uuid().nullable().optional(),
  description: z.string().min(10).max(2000).optional(),
  website: z.string().url().nullable().optional().or(z.literal('')),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  adminReviewNotes: z.string().max(1000).nullable().optional(),
});

export type UpdatePartnerInput = z.infer<typeof UpdatePartnerInputSchema>;

export const ReviewPartnerInputSchema = z.object({
  verificationStatus: z.enum(['VERIFIED', 'REJECTED']),
  adminReviewNotes: z.string().max(1000).nullable().optional(),
});

export type ReviewPartnerInput = z.infer<typeof ReviewPartnerInputSchema>;

export const PartnerOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: PartnerTypeSchema,
  description: z.string(),
  website: z.string().url().nullable().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  campusId: z.string().uuid().nullable().optional(),
  campusName: z.string().nullable().optional(),
  verificationStatus: PartnerVerificationStatusSchema,
  verifiedAt: z.string().datetime().nullable().optional(),
  adminReviewNotes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PartnerOrganization = z.infer<typeof PartnerOrganizationSchema>;

export const PartnerResponseSchema = z.object({
  partner: PartnerOrganizationSchema,
});

export const PartnersListResponseSchema = z.object({
  partners: z.array(PartnerOrganizationSchema),
  total: z.number().int().nonnegative(),
});

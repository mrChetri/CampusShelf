import { z } from 'zod';
import { UserProfileSchema } from './user.contract';

export const CampusSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  active: z.boolean().default(true),
});

export type Campus = z.infer<typeof CampusSchema>;

export const CampusesResponseSchema = z.object({
  campuses: z.array(CampusSchema),
});

export type CampusesResponse = z.infer<typeof CampusesResponseSchema>;

export const RedeemInviteInputSchema = z.object({
  campusId: z.string().uuid(),
  code: z.string().trim().min(4).max(64),
});

export type RedeemInviteInput = z.infer<typeof RedeemInviteInputSchema>;

export const RedeemInviteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserProfileSchema,
});

export type RedeemInviteResponse = z.infer<typeof RedeemInviteResponseSchema>;

export const AdminCreateInviteInputSchema = z.object({
  campusId: z.string().uuid(),
  code: z.string().trim().min(4).max(64),
  maxUses: z.number().int().positive().default(100),
  expiresAt: z.string().datetime().optional(),
});

export type AdminCreateInviteInput = z.infer<typeof AdminCreateInviteInputSchema>;

export const AdminRevokeInviteInputSchema = z.object({
  inviteId: z.string().uuid(),
});

export type AdminRevokeInviteInput = z.infer<typeof AdminRevokeInviteInputSchema>;

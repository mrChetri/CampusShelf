import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'REGISTERED',
  'CAMPUS_MEMBER',
  'MODERATOR',
  'ADMIN',
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
  role: UserRoleSchema,
  campusId: z.string().uuid().nullable().optional(),
  campusName: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).default('ACTIVE').optional(),
  createdAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

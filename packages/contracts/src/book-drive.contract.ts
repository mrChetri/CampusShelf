import { z } from 'zod';

export const BookDriveSummarySchema = z.object({
  campusId: z.string().uuid(),
  campusName: z.string().min(2).max(100),
  campusSlug: z.string().min(2).max(100),
  driveTitle: z.string().min(2).max(150),
  academicYear: z.string().min(4).max(20),
  totalBooksDonated: z.number().int().nonnegative(),
  totalBooksListed: z.number().int().nonnegative(),
  activeContributorsCount: z.number().int().nonnegative(),
  topCategories: z.array(
    z.object({
      category: z.string(),
      count: z.number().int().nonnegative(),
    })
  ).default([]),
  shareUrl: z.string().url(),
  shareText: z.string().min(10).max(1000),
});

export type BookDriveSummary = z.infer<typeof BookDriveSummarySchema>;

export const PublicBookDriveResponseSchema = z.object({
  drive: BookDriveSummarySchema,
});

export type PublicBookDriveResponse = z.infer<typeof PublicBookDriveResponseSchema>;

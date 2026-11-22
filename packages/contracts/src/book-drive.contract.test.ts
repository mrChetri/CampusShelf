import { describe, it, expect } from 'vitest';
import {
  BookDriveSummarySchema,
  PublicBookDriveResponseSchema,
} from './book-drive.contract';

describe('Book Drive Contract (CS-015 Semester Book Drive + Share Links)', () => {
  it('validates a valid BookDriveSummary payload', () => {
    const validDrive = {
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      campusName: 'Darrang College',
      campusSlug: 'darrang-college',
      driveTitle: 'Spring 2026 Semester Book Drive',
      academicYear: '2025-2026',
      totalBooksDonated: 42,
      totalBooksListed: 58,
      activeContributorsCount: 35,
      topCategories: [
        { category: 'Physics', count: 18 },
        { category: 'Chemistry', count: 12 },
        { category: 'Mathematics', count: 8 },
      ],
      shareUrl: 'https://campusshelf.org/drives/darrang-college',
      shareText: 'Join the Darrang College Semester Book Drive on CampusShelf! 42 textbooks already donated.',
    };

    const parsed = BookDriveSummarySchema.safeParse(validDrive);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.totalBooksDonated).toBe(42);
      expect(parsed.data.campusSlug).toBe('darrang-college');
      expect(parsed.data.topCategories.length).toBe(3);
    }
  });

  it('rejects invalid inputs such as non-UUID campusId or negative numbers', () => {
    const invalidDrive = {
      campusId: 'invalid-uuid',
      campusName: '',
      campusSlug: 'darrang',
      driveTitle: '',
      academicYear: '26',
      totalBooksDonated: -5,
      totalBooksListed: 10,
      activeContributorsCount: 0,
      topCategories: [],
      shareUrl: 'not-a-url',
      shareText: 'short',
    };

    const parsed = BookDriveSummarySchema.safeParse(invalidDrive);
    expect(parsed.success).toBe(false);
  });

  it('validates PublicBookDriveResponseSchema structure', () => {
    const responsePayload = {
      drive: {
        campusId: '550e8400-e29b-41d4-a716-446655440000',
        campusName: 'Darrang College',
        campusSlug: 'darrang-college',
        driveTitle: 'Semester Book Drive',
        academicYear: '2025-2026',
        totalBooksDonated: 10,
        totalBooksListed: 20,
        activeContributorsCount: 8,
        topCategories: [],
        shareUrl: 'https://campusshelf.org/drives/darrang-college',
        shareText: 'Check out the Darrang College Book Drive on CampusShelf!',
      },
    };

    const parsed = PublicBookDriveResponseSchema.safeParse(responsePayload);
    expect(parsed.success).toBe(true);
  });
});

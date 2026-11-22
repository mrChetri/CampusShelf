import { describe, it, expect } from 'vitest';
import {
  PartnerVerificationStatusSchema,
  PartnerTypeSchema,
  PartnerOrganizationSchema,
  CreatePartnerInputSchema,
  UpdatePartnerInputSchema,
  ReviewPartnerInputSchema,
} from './partner.contract';

describe('Partner Contract', () => {
  describe('Enums', () => {
    it('validates partner verification statuses: PENDING, VERIFIED, REJECTED', () => {
      expect(PartnerVerificationStatusSchema.safeParse('PENDING').success).toBe(true);
      expect(PartnerVerificationStatusSchema.safeParse('VERIFIED').success).toBe(true);
      expect(PartnerVerificationStatusSchema.safeParse('REJECTED').success).toBe(true);
      expect(PartnerVerificationStatusSchema.safeParse('UNKNOWN').success).toBe(false);
    });

    it('validates partner types: CAMPUS_LIBRARY, COMMUNITY_LIBRARY, STUDENT_UNION, NGO', () => {
      expect(PartnerTypeSchema.safeParse('CAMPUS_LIBRARY').success).toBe(true);
      expect(PartnerTypeSchema.safeParse('COMMUNITY_LIBRARY').success).toBe(true);
      expect(PartnerTypeSchema.safeParse('STUDENT_UNION').success).toBe(true);
      expect(PartnerTypeSchema.safeParse('NGO').success).toBe(true);
      expect(PartnerTypeSchema.safeParse('COMMERCIAL').success).toBe(false);
    });
  });

  describe('CreatePartnerInputSchema', () => {
    it('accepts valid partner creation input', () => {
      const input = {
        name: 'Darrang College Central Library',
        type: 'CAMPUS_LIBRARY',
        campusId: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Central academic library supporting Darrang College students with course textbooks and reference guides.',
        website: 'https://darrangcollege.edu.in/library',
        contactEmail: 'library@darrangcollege.edu.in',
        contactPhone: '+91 98765 43210',
        address: 'Mahabhairab, Tezpur, Assam 784001',
      };
      const result = CreatePartnerInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects partner creation with missing required fields or invalid email', () => {
      const input = {
        name: '',
        type: 'INVALID_TYPE',
        contactEmail: 'not-an-email',
      };
      const result = CreatePartnerInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdatePartnerInputSchema', () => {
    it('accepts partial update input', () => {
      const input = {
        website: 'https://new-website.org',
        contactPhone: '+91 99887 11223',
        adminReviewNotes: 'Updated phone and web address.',
      };
      const result = UpdatePartnerInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('ReviewPartnerInputSchema', () => {
    it('validates review input with status and optional review notes', () => {
      const validReview = {
        verificationStatus: 'VERIFIED',
        adminReviewNotes: 'Verified official campus library contact and accreditation.',
      };
      const result = ReviewPartnerInputSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('rejects review input with invalid status', () => {
      const invalidReview = {
        verificationStatus: 'SUPER_VERIFIED',
      };
      const result = ReviewPartnerInputSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });
  });

  describe('PartnerOrganizationSchema', () => {
    it('validates complete PartnerOrganization entity with verified status', () => {
      const entity = {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Tezpur Community Book Bank',
        type: 'NGO',
        description: 'Grassroots initiative distributing school and college textbooks to underprivileged students.',
        website: 'https://tezpurbooks.org',
        contactEmail: 'connect@tezpurbooks.org',
        contactPhone: '+91 99887 76655',
        address: 'Mission Chariali, Tezpur',
        campusId: null,
        verificationStatus: 'VERIFIED',
        verifiedAt: '2026-11-23T00:00:00.000Z',
        adminReviewNotes: 'Verified registration documentation with local district registrar.',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
      };
      const result = PartnerOrganizationSchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });
});

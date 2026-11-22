import { describe, it, expect } from 'vitest';
import {
  CampaignNeedStatusSchema,
  CampaignNeedCategorySchema,
  CampaignNeedSchema,
  CreateCampaignNeedInputSchema,
  UpdateCampaignNeedInputSchema,
} from './campaign.contract';
import { CreateListingInputSchema, ListingSchema } from './listing.contract';

describe('Campaign Contract (CS-014 NGO Book Needs)', () => {
  describe('CampaignNeedStatusSchema', () => {
    it('validates statuses: ACTIVE, FULFILLED, PAUSED', () => {
      expect(CampaignNeedStatusSchema.safeParse('ACTIVE').success).toBe(true);
      expect(CampaignNeedStatusSchema.safeParse('FULFILLED').success).toBe(true);
      expect(CampaignNeedStatusSchema.safeParse('PAUSED').success).toBe(true);
      expect(CampaignNeedStatusSchema.safeParse('ARCHIVED').success).toBe(false);
    });
  });

  describe('CampaignNeedCategorySchema', () => {
    it('validates standard campaign categories', () => {
      expect(CampaignNeedCategorySchema.safeParse('ACADEMIC').success).toBe(true);
      expect(CampaignNeedCategorySchema.safeParse('COMPETITIVE_EXAM').success).toBe(true);
      expect(CampaignNeedCategorySchema.safeParse('LITERATURE_FICTION').success).toBe(true);
      expect(CampaignNeedCategorySchema.safeParse('GENERAL_READING').success).toBe(true);
      expect(CampaignNeedCategorySchema.safeParse('CHILDRENS_BOOKS').success).toBe(true);
      expect(CampaignNeedCategorySchema.safeParse('INVALID_CAT').success).toBe(false);
    });
  });

  describe('CreateCampaignNeedInputSchema', () => {
    it('accepts valid campaign need input', () => {
      const input = {
        partnerId: '770e8400-e29b-41d4-a716-446655440002',
        title: 'Class 11 & 12 NCERT Chemistry and Physics Textbooks',
        category: 'SCIENCE',
        course: 'Higher Secondary Science',
        description: 'Urgent requirement for 25 high school science textbooks for rural student learning camps.',
        targetQuantity: 25,
        urgent: true,
      };
      const result = CreateCampaignNeedInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects targetQuantity less than 1 or invalid UUID', () => {
      const input = {
        partnerId: 'invalid-id',
        title: '',
        category: 'SCIENCE',
        targetQuantity: 0,
      };
      const result = CreateCampaignNeedInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateCampaignNeedInputSchema', () => {
    it('accepts partial update input', () => {
      const input = {
        targetQuantity: 30,
        status: 'FULFILLED',
        urgent: false,
      };
      const result = UpdateCampaignNeedInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('CampaignNeedSchema', () => {
    it('validates complete CampaignNeed entity', () => {
      const entity = {
        id: '990e8400-e29b-41d4-a716-446655440001',
        partnerId: '770e8400-e29b-41d4-a716-446655440002',
        partnerName: 'Tezpur Community Book Bank',
        title: 'B.Sc Mathematics Reference Guides',
        category: 'MATHEMATICS',
        course: 'B.Sc Mathematics',
        description: 'Calculus, Real Analysis, and Linear Algebra reference textbooks.',
        targetQuantity: 15,
        fulfilledQuantity: 7,
        status: 'ACTIVE',
        urgent: false,
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
      };
      const result = CampaignNeedSchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });

  describe('ListingContract Campaign Linkage', () => {
    it('accepts campaignNeedId on CreateListingInputSchema', () => {
      const input = {
        campusId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Higher Secondary Physics Vol 1',
        author: 'SL Arora',
        subject: 'Physics',
        condition: 'GOOD',
        pickupLocation: 'Central Library Entrance',
        photos: ['https://example.com/sl-arora.jpg'],
        type: 'DONATION',
        campaignNeedId: '990e8400-e29b-41d4-a716-446655440001',
      };
      const result = CreateListingInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.campaignNeedId).toBe('990e8400-e29b-41d4-a716-446655440001');
      }
    });

    it('validates listing entity with campaign fields', () => {
      const listing = {
        id: '550e8400-e29b-41d4-a716-446655440099',
        donorId: '550e8400-e29b-41d4-a716-446655440088',
        donorName: 'Aarav Sharma',
        campusId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'NCERT Physics Class 12',
        author: 'NCERT',
        subject: 'Physics',
        condition: 'GOOD',
        pickupLocation: 'Library',
        photos: ['https://example.com/ncert.jpg'],
        status: 'AVAILABLE',
        type: 'DONATION',
        campaignNeedId: '990e8400-e29b-41d4-a716-446655440001',
        campaignTitle: 'Class 11 & 12 NCERT Chemistry and Physics Textbooks',
        partnerName: 'Tezpur Community Book Bank',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
      };
      const result = ListingSchema.safeParse(listing);
      expect(result.success).toBe(true);
    });
  });
});

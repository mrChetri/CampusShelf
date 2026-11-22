import { describe, it, expect } from 'vitest';
import {
  HandoverStatusEnum,
  HandoverSchema,
  CompleteHandoverResponseSchema,
  DisputeHandoverInputSchema,
  DisputeHandoverResponseSchema,
  HandoverResponseSchema,
} from './handover.contract';

describe('Handover Contracts (CS-008)', () => {
  describe('HandoverStatusEnum', () => {
    it('accepts valid handover statuses: SCHEDULED, COMPLETED, DISPUTED, EXPIRED', () => {
      expect(HandoverStatusEnum.parse('SCHEDULED')).toBe('SCHEDULED');
      expect(HandoverStatusEnum.parse('COMPLETED')).toBe('COMPLETED');
      expect(HandoverStatusEnum.parse('DISPUTED')).toBe('DISPUTED');
      expect(HandoverStatusEnum.parse('EXPIRED')).toBe('EXPIRED');
    });

    it('rejects invalid statuses', () => {
      expect(() => HandoverStatusEnum.parse('UNKNOWN')).toThrow();
      expect(() => HandoverStatusEnum.parse('PENDING')).toThrow();
    });
  });

  describe('HandoverSchema', () => {
    const validHandover = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      listingId: '550e8400-e29b-41d4-a716-446655440002',
      listingTitle: 'University Physics with Modern Physics',
      listingAuthor: 'Young and Freedman',
      requestId: '550e8400-e29b-41d4-a716-446655440003',
      donorId: '550e8400-e29b-41d4-a716-446655440004',
      donorName: 'Rahul Kalita',
      recipientId: '550e8400-e29b-41d4-a716-446655440005',
      recipientName: 'Aarav Sharma',
      pickupLocation: 'Central Library Entrance',
      scheduleNotes: 'Will meet after 3 PM physics lecture.',
      status: 'SCHEDULED',
      reservedUntil: '2026-11-25T10:00:00.000Z',
      createdAt: '2026-11-22T10:00:00.000Z',
      updatedAt: '2026-11-22T10:00:00.000Z',
    };

    it('validates a complete Handover payload according to domain rules', () => {
      const parsed = HandoverSchema.parse(validHandover);
      expect(parsed.id).toBe(validHandover.id);
      expect(parsed.status).toBe('SCHEDULED');
      expect(parsed.pickupLocation).toBe('Central Library Entrance');
    });

    it('strictly enforces UUID format for all entity foreign keys', () => {
      expect(() => HandoverSchema.parse({ ...validHandover, id: 'bad-id' })).toThrow();
      expect(() => HandoverSchema.parse({ ...validHandover, listingId: 'bad-id' })).toThrow();
      expect(() => HandoverSchema.parse({ ...validHandover, requestId: 'bad-id' })).toThrow();
      expect(() => HandoverSchema.parse({ ...validHandover, donorId: 'bad-id' })).toThrow();
      expect(() => HandoverSchema.parse({ ...validHandover, recipientId: 'bad-id' })).toThrow();
    });

    it('validates optional completion and dispute timestamps', () => {
      const completed = {
        ...validHandover,
        status: 'COMPLETED',
        completedAt: '2026-11-22T15:30:00.000Z',
      };
      const parsedCompleted = HandoverSchema.parse(completed);
      expect(parsedCompleted.completedAt).toBe('2026-11-22T15:30:00.000Z');

      const disputed = {
        ...validHandover,
        status: 'DISPUTED',
        disputedAt: '2026-11-22T16:00:00.000Z',
        disputeReason: 'Donor did not arrive at pickup location',
        disputeDetails: 'Waited for 30 minutes outside library.',
      };
      const parsedDisputed = HandoverSchema.parse(disputed);
      expect(parsedDisputed.disputeReason).toBe('Donor did not arrive at pickup location');
    });

    it('validates HandoverResponseSchema wrapper', () => {
      const parsed = HandoverResponseSchema.parse({ handover: validHandover });
      expect(parsed.handover.id).toBe(validHandover.id);
    });
  });

  describe('CompleteHandoverResponseSchema (Single-Sided Confirmation ADR-0001)', () => {
    it('validates completion payload', () => {
      const parsed = CompleteHandoverResponseSchema.parse({
        success: true,
        message: 'Handover marked as completed. Thank you for donating!',
        handover: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          listingId: '550e8400-e29b-41d4-a716-446655440002',
          listingTitle: 'University Physics',
          listingAuthor: 'Young',
          requestId: '550e8400-e29b-41d4-a716-446655440003',
          donorId: '550e8400-e29b-41d4-a716-446655440004',
          donorName: 'Rahul Kalita',
          recipientId: '550e8400-e29b-41d4-a716-446655440005',
          recipientName: 'Aarav Sharma',
          pickupLocation: 'Central Library Entrance',
          status: 'COMPLETED',
          reservedUntil: '2026-11-25T10:00:00.000Z',
          completedAt: '2026-11-22T15:30:00.000Z',
          createdAt: '2026-11-22T10:00:00.000Z',
          updatedAt: '2026-11-22T15:30:00.000Z',
        },
      });

      expect(parsed.success).toBe(true);
      expect(parsed.handover.status).toBe('COMPLETED');
    });
  });

  describe('DisputeHandoverInputSchema (Recipient Report a Problem ADR-0001)', () => {
    it('requires a dispute reason of at least 3 characters', () => {
      expect(() => DisputeHandoverInputSchema.parse({ reason: 'no' })).toThrow();
      const parsed = DisputeHandoverInputSchema.parse({
        reason: 'Book was already given to someone else',
      });
      expect(parsed.reason).toBe('Book was already given to someone else');
    });

    it('trims whitespace and accepts optional details up to 500 characters', () => {
      const parsed = DisputeHandoverInputSchema.parse({
        reason: '  Donor did not show up  ',
        details: '  Waited by Central Library for 45 minutes.  ',
      });
      expect(parsed.reason).toBe('Donor did not show up');
      expect(parsed.details).toBe('Waited by Central Library for 45 minutes.');
    });

    it('rejects details exceeding 500 characters', () => {
      expect(() =>
        DisputeHandoverInputSchema.parse({
          reason: 'Valid reason',
          details: 'X'.repeat(501),
        })
      ).toThrow();
    });
  });

  describe('DisputeHandoverResponseSchema', () => {
    it('validates dispute response wrapper', () => {
      const parsed = DisputeHandoverResponseSchema.parse({
        success: true,
        message: 'Problem reported. Our campus moderation team has been notified.',
        handover: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          listingId: '550e8400-e29b-41d4-a716-446655440002',
          listingTitle: 'University Physics',
          listingAuthor: 'Young',
          requestId: '550e8400-e29b-41d4-a716-446655440003',
          donorId: '550e8400-e29b-41d4-a716-446655440004',
          donorName: 'Rahul Kalita',
          recipientId: '550e8400-e29b-41d4-a716-446655440005',
          recipientName: 'Aarav Sharma',
          pickupLocation: 'Central Library Entrance',
          status: 'DISPUTED',
          reservedUntil: '2026-11-25T10:00:00.000Z',
          disputedAt: '2026-11-22T16:00:00.000Z',
          disputeReason: 'Donor did not show up',
          createdAt: '2026-11-22T10:00:00.000Z',
          updatedAt: '2026-11-22T16:00:00.000Z',
        },
      });

      expect(parsed.success).toBe(true);
      expect(parsed.handover.status).toBe('DISPUTED');
    });
  });
});

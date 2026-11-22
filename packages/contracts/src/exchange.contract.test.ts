import { describe, it, expect } from 'vitest';
import {
  ExchangeProposalStatusSchema,
  CreateExchangeProposalInputSchema,
  ExchangeProposalSchema,
  ExchangeProposalsListResponseSchema,
} from './exchange.contract';
import { ListingTypeEnum, ListingStatusEnum } from './listing.contract';

describe('Exchange Contract (CS-016 Book Exchange Offers)', () => {
  it('validates ListingTypeEnum and ListingStatusEnum for EXCHANGE', () => {
    expect(ListingTypeEnum.safeParse('EXCHANGE').success).toBe(true);
    expect(ListingStatusEnum.safeParse('EXCHANGED').success).toBe(true);
  });

  it('validates ExchangeProposalStatusSchema statuses', () => {
    expect(ExchangeProposalStatusSchema.safeParse('PENDING').success).toBe(true);
    expect(ExchangeProposalStatusSchema.safeParse('ACCEPTED').success).toBe(true);
    expect(ExchangeProposalStatusSchema.safeParse('DECLINED').success).toBe(true);
    expect(ExchangeProposalStatusSchema.safeParse('COMPLETED').success).toBe(true);
    expect(ExchangeProposalStatusSchema.safeParse('CANCELLED').success).toBe(true);
    expect(ExchangeProposalStatusSchema.safeParse('UNKNOWN').success).toBe(false);
  });

  it('validates CreateExchangeProposalInputSchema', () => {
    const input = {
      targetListingId: '550e8400-e29b-41d4-a716-446655440001',
      offeredListingId: '550e8400-e29b-41d4-a716-446655440002',
      message: 'Offering my Organic Chemistry book in exchange for University Physics.',
    };
    const parsed = CreateExchangeProposalInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid UUIDs in CreateExchangeProposalInputSchema', () => {
    const invalidInput = {
      targetListingId: 'not-a-uuid',
      offeredListingId: '123',
    };
    const parsed = CreateExchangeProposalInputSchema.safeParse(invalidInput);
    expect(parsed.success).toBe(false);
  });

  it('validates complete ExchangeProposalSchema entity', () => {
    const proposal = {
      id: '550e8400-e29b-41d4-a716-446655440010',
      proposerId: '550e8400-e29b-41d4-a716-446655440020',
      proposerName: 'Rahul Verma',
      targetOwnerId: '550e8400-e29b-41d4-a716-446655440030',
      targetOwnerName: 'Priya Das',
      targetListingId: '550e8400-e29b-41d4-a716-446655440001',
      targetListingTitle: 'University Physics',
      targetListingPhoto: 'https://example.com/phys.jpg',
      offeredListingId: '550e8400-e29b-41d4-a716-446655440002',
      offeredListingTitle: 'Organic Chemistry',
      offeredListingPhoto: 'https://example.com/chem.jpg',
      pickupLocation: 'Central Library Entrance',
      message: 'Can exchange after classes tomorrow.',
      status: 'PENDING',
      reservedUntil: null,
      completedAt: null,
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
    };

    const parsed = ExchangeProposalSchema.safeParse(proposal);
    expect(parsed.success).toBe(true);
  });

  it('validates ExchangeProposalsListResponseSchema with incoming and outgoing arrays', () => {
    const listPayload = {
      incoming: [],
      outgoing: [],
    };
    const parsed = ExchangeProposalsListResponseSchema.safeParse(listPayload);
    expect(parsed.success).toBe(true);
  });
});

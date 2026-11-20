import { describe, expect, it } from 'vitest';
import {
  CreateListingInputSchema,
  ListingSchema,
  MyListingsResponseSchema,
  WithdrawListingResponseSchema,
} from './listing.contract';

describe('Listing Contracts', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const validCampusUUID = '660e8400-e29b-41d4-a716-446655440001';

  it('validates a valid CreateListingInputSchema payload', () => {
    const input = {
      title: 'University Physics with Modern Physics',
      author: 'Young and Freedman',
      isbn: '978-0133969290',
      edition: '14th Edition',
      course: 'B.Sc Physics',
      subject: 'Physics',
      semester: 'Semester 1',
      condition: 'GOOD',
      pickupLocation: 'Central Library Ground Floor Entrance',
      photos: [
        'https://supabase.co/storage/v1/object/public/listings/photo1.jpg',
        'https://supabase.co/storage/v1/object/public/listings/photo2.jpg',
      ],
      description: 'Minor pencil highlights in chapter 3, binding is firm.',
    };

    const parsed = CreateListingInputSchema.parse(input);
    expect(parsed.title).toBe('University Physics with Modern Physics');
    expect(parsed.condition).toBe('GOOD');
    expect(parsed.photos).toHaveLength(2);
  });

  it('rejects CreateListingInputSchema with empty title or author', () => {
    const invalidInput = {
      title: '',
      author: '',
      subject: 'Math',
      condition: 'GOOD',
      pickupLocation: 'Main Gate',
      photos: ['https://example.com/photo.jpg'],
    };

    expect(() => CreateListingInputSchema.parse(invalidInput)).toThrow();
  });

  it('rejects CreateListingInputSchema with zero photos or more than 5 photos per ADR-0002', () => {
    const noPhotos = {
      title: 'Calculus',
      author: 'Stewart',
      subject: 'Mathematics',
      condition: 'GOOD',
      pickupLocation: 'Main Gate',
      photos: [],
    };
    expect(() => CreateListingInputSchema.parse(noPhotos)).toThrow();

    const sixPhotos = {
      title: 'Calculus',
      author: 'Stewart',
      subject: 'Mathematics',
      condition: 'GOOD',
      pickupLocation: 'Main Gate',
      photos: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
        'https://example.com/6.jpg',
      ],
    };
    expect(() => CreateListingInputSchema.parse(sixPhotos)).toThrow();
  });

  it('rejects invalid condition enum values', () => {
    const invalidCondition = {
      title: 'Organic Chemistry',
      author: 'Morrison and Boyd',
      subject: 'Chemistry',
      condition: 'SUPER_MINT', // invalid
      pickupLocation: 'Chemistry Dept Lobby',
      photos: ['https://example.com/photo.jpg'],
    };

    expect(() => CreateListingInputSchema.parse(invalidCondition)).toThrow();
  });

  it('validates a complete ListingSchema entity', () => {
    const entity = {
      id: validUUID,
      donorId: validUUID,
      donorName: 'Gopal Chetri',
      campusId: validCampusUUID,
      campusName: 'Darrang College',
      title: 'Concepts of Physics Vol 1',
      author: 'H.C. Verma',
      isbn: '978-8177091878',
      edition: '2020',
      course: 'Higher Secondary Science',
      subject: 'Physics',
      semester: 'Class 11',
      condition: 'LIKE_NEW',
      pickupLocation: 'College Canteen Corner',
      photos: ['https://supabase.co/storage/v1/object/public/listings/hcverma.jpg'],
      description: 'Used for one year, clean pages.',
      status: 'AVAILABLE',
      type: 'DONATION',
      createdAt: '2026-11-20T10:00:00.000Z',
      updatedAt: '2026-11-20T10:00:00.000Z',
    };

    const parsed = ListingSchema.parse(entity);
    expect(parsed.id).toBe(validUUID);
    expect(parsed.status).toBe('AVAILABLE');
    expect(parsed.type).toBe('DONATION');
  });

  it('validates MyListingsResponseSchema and WithdrawListingResponseSchema', () => {
    const listingEntity = {
      id: validUUID,
      donorId: validUUID,
      donorName: 'Gopal Chetri',
      campusId: validCampusUUID,
      campusName: 'Darrang College',
      title: 'Concepts of Physics Vol 1',
      author: 'H.C. Verma',
      subject: 'Physics',
      condition: 'LIKE_NEW',
      pickupLocation: 'College Canteen Corner',
      photos: ['https://supabase.co/storage/v1/object/public/listings/hcverma.jpg'],
      status: 'AVAILABLE',
      type: 'DONATION',
      createdAt: '2026-11-20T10:00:00.000Z',
      updatedAt: '2026-11-20T10:00:00.000Z',
    };

    const myListings = MyListingsResponseSchema.parse({
      listings: [listingEntity],
    });
    expect(myListings.listings).toHaveLength(1);

    const withdrawRes = WithdrawListingResponseSchema.parse({
      success: true,
      message: 'Listing withdrawn successfully',
      listing: {
        ...listingEntity,
        status: 'WITHDRAWN',
      },
    });
    expect(withdrawRes.success).toBe(true);
    expect(withdrawRes.listing.status).toBe('WITHDRAWN');
  });
});

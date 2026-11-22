import { describe, expect, it } from 'vitest';
import {
  CreateListingInputSchema,
  ListingSchema,
  ListingStatusEnum,
  MyListingsResponseSchema,
  WithdrawListingResponseSchema,
  ListingsQuerySchema,
  ListingsFeedResponseSchema,
  ListingDetailResponseSchema,
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

  describe('Discovery & Browse Contracts (CS-005)', () => {
    it('parses ListingsQuerySchema with default pagination and trimmed values', () => {
      const emptyQuery = {};
      const parsedDefault = ListingsQuerySchema.parse(emptyQuery);
      expect(parsedDefault.page).toBe(1);
      expect(parsedDefault.limit).toBe(12);

      const fullQuery = {
        search: '  physics vol 1  ',
        campusId: validCampusUUID,
        condition: 'GOOD',
        course: 'B.Sc Physics',
        semester: 'Semester 1',
        page: '2',
        limit: '20',
      };
      const parsedFull = ListingsQuerySchema.parse(fullQuery);
      expect(parsedFull.search).toBe('physics vol 1');
      expect(parsedFull.campusId).toBe(validCampusUUID);
      expect(parsedFull.condition).toBe('GOOD');
      expect(parsedFull.page).toBe(2);
      expect(parsedFull.limit).toBe(20);
    });

    it('validates ListingsFeedResponseSchema with public listings list and pagination meta', () => {
      const feedPayload = {
        listings: [
          {
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
          },
        ],
        total: 1,
        page: 1,
        limit: 12,
        hasMore: false,
      };

      const parsedFeed = ListingsFeedResponseSchema.parse(feedPayload);
      expect(parsedFeed.listings).toHaveLength(1);
      expect(parsedFeed.total).toBe(1);
      expect(parsedFeed.hasMore).toBe(false);

      // Verify that no private contact fields exist on the public listing
      const publicItem = parsedFeed.listings[0] as any;
      expect(publicItem.email).toBeUndefined();
      expect(publicItem.phoneNumber).toBeUndefined();
      expect(publicItem.fullAddress).toBeUndefined();
    });

    it('validates ListingDetailResponseSchema for a single book', () => {
      const detailPayload = {
        listing: {
          id: validUUID,
          donorId: validUUID,
          donorName: 'Asha Sharma',
          campusId: validCampusUUID,
          campusName: 'Darrang College',
          title: 'University Physics',
          author: 'Young and Freedman',
          subject: 'Physics',
          condition: 'GOOD',
          pickupLocation: 'Central Library Entrance',
          photos: ['https://example.com/p1.jpg'],
          status: 'AVAILABLE',
          type: 'DONATION',
          createdAt: '2026-11-20T10:00:00.000Z',
          updatedAt: '2026-11-20T10:00:00.000Z',
        },
      };

      const parsed = ListingDetailResponseSchema.parse(detailPayload);
      expect(parsed.listing.title).toBe('University Physics');
      expect(parsed.listing.donorName).toBe('Asha Sharma');
    });
  });

  describe('CS-011 Secondary Sale Listings Contracts', () => {
    const baseInput = {
      title: 'Advanced Engineering Mathematics',
      author: 'Erwin Kreyszig',
      subject: 'Mathematics',
      condition: 'GOOD' as const,
      pickupLocation: 'Main Building Foyer',
      photos: ['https://example.com/math.jpg'],
    };

    it('defaults type to DONATION with optional price when omitted', () => {
      const parsed = CreateListingInputSchema.parse(baseInput);
      expect(parsed.type).toBe('DONATION');
      expect(parsed.price).toBeUndefined();
    });

    it('validates a SALE listing with a valid asking price in INR', () => {
      const saleInput = {
        ...baseInput,
        type: 'SALE' as const,
        price: 350,
      };
      const parsed = CreateListingInputSchema.parse(saleInput);
      expect(parsed.type).toBe('SALE');
      expect(parsed.price).toBe(350);
    });

    it('rejects a SALE listing with missing or zero price', () => {
      const missingPrice = {
        ...baseInput,
        type: 'SALE' as const,
      };
      expect(() => CreateListingInputSchema.parse(missingPrice)).toThrow(
        /Asking price/i
      );

      const zeroPrice = {
        ...baseInput,
        type: 'SALE' as const,
        price: 0,
      };
      expect(() => CreateListingInputSchema.parse(zeroPrice)).toThrow(
        /Asking price/i
      );
    });

    it('rejects a SALE listing with negative price', () => {
      const negativePrice = {
        ...baseInput,
        type: 'SALE' as const,
        price: -50,
      };
      expect(() => CreateListingInputSchema.parse(negativePrice)).toThrow();
    });

    it('rejects a SALE listing exceeding the ₹5,000 student affordability limit', () => {
      const exorbitantPrice = {
        ...baseInput,
        type: 'SALE' as const,
        price: 7500,
      };
      expect(() => CreateListingInputSchema.parse(exorbitantPrice)).toThrow(
        /5,000/i
      );
    });

    it('validates a complete Listing entity with type SALE and price in INR', () => {
      const saleEntity = {
        id: validUUID,
        donorId: validUUID,
        donorName: 'Rahul Verma',
        campusId: validCampusUUID,
        title: 'Organic Chemistry',
        author: 'Paula Bruice',
        subject: 'Chemistry',
        condition: 'LIKE_NEW' as const,
        pickupLocation: 'Science Block Lobby',
        photos: ['https://example.com/chem.jpg'],
        status: 'AVAILABLE' as const,
        type: 'SALE' as const,
        price: 450,
        createdAt: '2026-11-20T10:00:00.000Z',
        updatedAt: '2026-11-20T10:00:00.000Z',
      };
      const parsed = ListingSchema.parse(saleEntity);
      expect(parsed.type).toBe('SALE');
      expect(parsed.price).toBe(450);
    });

    it('accepts SOLD as a valid listing status (CS-012)', () => {
      expect(ListingStatusEnum.parse('SOLD')).toBe('SOLD');
      const soldEntity = {
        id: validUUID,
        donorId: validUUID,
        donorName: 'Rahul Verma',
        campusId: validCampusUUID,
        title: 'Organic Chemistry',
        author: 'Paula Bruice',
        subject: 'Chemistry',
        condition: 'LIKE_NEW' as const,
        pickupLocation: 'Science Block Lobby',
        photos: ['https://example.com/chem.jpg'],
        status: 'SOLD' as const,
        type: 'SALE' as const,
        price: 450,
        createdAt: '2026-11-20T10:00:00.000Z',
        updatedAt: '2026-11-20T10:00:00.000Z',
      };
      const parsed = ListingSchema.parse(soldEntity);
      expect(parsed.status).toBe('SOLD');
    });
  });
});

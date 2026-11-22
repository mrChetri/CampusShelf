import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { listingService } from './listing.service';

describe('Listing Module Seam (CS-004)', () => {
  let app: any;
  let request: any;

  const memberUserId = '11111111-1111-4111-a111-111111111111';
  const memberToken = `test-token:${memberUserId}:student@darrang.edu:Asha%20Sharma`;

  const registeredUserId = '22222222-2222-4222-a222-222222222222';
  const registeredToken = `test-token:${registeredUserId}:newbie@darrang.edu:Rahul%20Das`;

  const otherMemberUserId = '33333333-3333-4333-a333-333333333333';
  const otherMemberToken = `test-token:${otherMemberUserId}:other@darrang.edu:Priya%20Borah`;

  let pilotCampusId: string;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);
    campusService.resetForTesting();
    listingService.resetForTesting();

    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;

    // Provision Asha as a verified Campus Member
    userService.getOrCreateProfile({
      id: memberUserId,
      email: 'student@darrang.edu',
      fullName: 'Asha Sharma',
    });
    userService.updateProfile(memberUserId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    // Provision Rahul as an unverified Registered User
    userService.getOrCreateProfile({
      id: registeredUserId,
      email: 'newbie@darrang.edu',
      fullName: 'Rahul Das',
    });

    // Provision Priya as another Campus Member
    userService.getOrCreateProfile({
      id: otherMemberUserId,
      email: 'other@darrang.edu',
      fullName: 'Priya Borah',
    });
    userService.updateProfile(otherMemberUserId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });
  });

  describe('POST /api/listings', () => {
    const validListingPayload = {
      title: 'University Physics with Modern Physics',
      author: 'Young and Freedman',
      isbn: '978-0133969290',
      edition: '14th Edition',
      course: 'B.Sc Physics',
      subject: 'Physics',
      semester: 'Semester 1',
      condition: 'GOOD',
      pickupLocation: 'Central Library Ground Floor',
      photos: [
        'https://supabase.co/storage/v1/object/public/listings/cover.jpg',
        'https://supabase.co/storage/v1/object/public/listings/pages.jpg',
      ],
      description: 'Clean textbook with pencil annotations in chapter 2.',
    };

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request.post('/api/listings').send(validListingPayload);
      expect(res.status).toBe(401);
    });

    it('rejects unverified Registered Users with 403 (must be Campus Member)', async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send(validListingPayload);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/campus member/i);
    });

    it('creates a listing successfully for an authenticated Campus Member with status 201', async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(validListingPayload);

      expect(res.status).toBe(201);
      expect(res.body.listing).toBeDefined();
      expect(res.body.listing.title).toBe('University Physics with Modern Physics');
      expect(res.body.listing.author).toBe('Young and Freedman');
      expect(res.body.listing.donorId).toBe(memberUserId);
      expect(res.body.listing.donorName).toBe('Asha Sharma');
      expect(res.body.listing.campusId).toBe(pilotCampusId);
      expect(res.body.listing.status).toBe('AVAILABLE');
      expect(res.body.listing.type).toBe('DONATION');
      expect(res.body.listing.photos).toHaveLength(2);
    });

    it('rejects invalid payload with 400 when photos are missing or exceed 5', async () => {
      const resNoPhotos = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          ...validListingPayload,
          photos: [],
        });
      expect(resNoPhotos.status).toBe(400);

      const resSixPhotos = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          ...validListingPayload,
          photos: [
            'https://supabase.co/storage/1.jpg',
            'https://supabase.co/storage/2.jpg',
            'https://supabase.co/storage/3.jpg',
            'https://supabase.co/storage/4.jpg',
            'https://supabase.co/storage/5.jpg',
            'https://supabase.co/storage/6.jpg',
          ],
        });
      expect(resSixPhotos.status).toBe(400);
    });
  });

  describe('GET /api/listings/mine', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request.get('/api/listings/mine');
      expect(res.status).toBe(401);
    });

    it('returns empty list when donor has no listings', async () => {
      const res = await request
        .get('/api/listings/mine')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.listings).toEqual([]);
    });

    it('returns only listings created by the authenticated donor', async () => {
      // Asha creates 1 listing
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Asha Book',
          author: 'Author A',
          subject: 'Physics',
          condition: 'GOOD',
          pickupLocation: 'Library',
          photos: ['https://example.com/p1.jpg'],
        });

      // Priya creates 1 listing
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${otherMemberToken}`)
        .send({
          title: 'Priya Book',
          author: 'Author B',
          subject: 'Chemistry',
          condition: 'LIKE_NEW',
          pickupLocation: 'Canteen',
          photos: ['https://example.com/p2.jpg'],
        });

      // Asha checks my listings
      const res = await request
        .get('/api/listings/mine')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(1);
      expect(res.body.listings[0].title).toBe('Asha Book');
      expect(res.body.listings[0].donorId).toBe(memberUserId);
    });
  });

  describe('PATCH /api/listings/:id/withdraw', () => {
    let createdListingId: string;

    beforeEach(async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Book to withdraw',
          author: 'Author X',
          subject: 'Mathematics',
          condition: 'FAIR',
          pickupLocation: 'Gate 2',
          photos: ['https://example.com/photo.jpg'],
        });
      createdListingId = res.body.listing.id;
    });

    it('rejects unauthenticated withdraw with 401', async () => {
      const res = await request.patch(`/api/listings/${createdListingId}/withdraw`);
      expect(res.status).toBe(401);
    });

    it('forbids another user from withdrawing a listing they do not own with 403', async () => {
      const res = await request
        .patch(`/api/listings/${createdListingId}/withdraw`)
        .set('Authorization', `Bearer ${otherMemberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized|not own/i);
    });

    it('allows donor to withdraw their own available listing with 200', async () => {
      const res = await request
        .patch(`/api/listings/${createdListingId}/withdraw`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.listing.status).toBe('WITHDRAWN');

      // Verify it reflects in my listings as WITHDRAWN
      const mineRes = await request
        .get('/api/listings/mine')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(mineRes.body.listings[0].status).toBe('WITHDRAWN');
    });

    it('returns 404 for non-existent listing ID', async () => {
      const res = await request
        .patch('/api/listings/99999999-9999-4999-a999-999999999999/withdraw')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/listings (Public Browse Feed - CS-005)', () => {
    beforeEach(async () => {
      // Create test dataset:
      // 1. Asha creates Physics book (Donation, Good, Darrang College)
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'University Physics with Modern Physics',
          author: 'Young and Freedman',
          isbn: '978-0133969290',
          course: 'B.Sc Physics',
          subject: 'Physics',
          semester: 'Semester 1',
          condition: 'GOOD',
          pickupLocation: 'Central Library Entrance',
          photos: ['https://example.com/p1.jpg'],
        });

      // 2. Priya creates Organic Chemistry book (Donation, Like New, Darrang College)
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${otherMemberToken}`)
        .send({
          title: 'Organic Chemistry',
          author: 'Morrison and Boyd',
          isbn: '978-0136436690',
          course: 'B.Sc Chemistry',
          subject: 'Chemistry',
          semester: 'Semester 2',
          condition: 'LIKE_NEW',
          pickupLocation: 'College Canteen',
          photos: ['https://example.com/p2.jpg'],
        });
    });

    it('allows guest visitors to browse listings without authentication', async () => {
      const res = await request.get('/api/listings');

      expect(res.status).toBe(200);
      expect(res.body.listings).toBeDefined();
      expect(res.body.listings).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
    });

    it('filters listings by text search on title, author, or ISBN', async () => {
      // Search by author "Young"
      const resAuthor = await request.get('/api/listings?search=Young');
      expect(resAuthor.status).toBe(200);
      expect(resAuthor.body.listings).toHaveLength(1);
      expect(resAuthor.body.listings[0].title).toBe('University Physics with Modern Physics');

      // Search by ISBN fragment
      const resIsbn = await request.get('/api/listings?search=6436690');
      expect(resIsbn.status).toBe(200);
      expect(resIsbn.body.listings).toHaveLength(1);
      expect(resIsbn.body.listings[0].title).toBe('Organic Chemistry');
    });

    it('filters listings by campus scope and condition', async () => {
      const resCampus = await request.get(`/api/listings?campusId=${pilotCampusId}`);
      expect(resCampus.status).toBe(200);
      expect(resCampus.body.listings).toHaveLength(2);

      const resCondition = await request.get('/api/listings?condition=LIKE_NEW');
      expect(resCondition.status).toBe(200);
      expect(resCondition.body.listings).toHaveLength(1);
      expect(resCondition.body.listings[0].condition).toBe('LIKE_NEW');
    });

    it('hides private donor contact info (email/phone/address) from public view', async () => {
      const res = await request.get('/api/listings');
      expect(res.status).toBe(200);

      const listing = res.body.listings[0];
      expect(listing.donorName).toBeDefined();
      expect(listing.email).toBeUndefined();
      expect(listing.phone).toBeUndefined();
      expect(listing.phoneNumber).toBeUndefined();
      expect(listing.fullAddress).toBeUndefined();
    });
  });

  describe('GET /api/listings/:id (Book Detail View - CS-005)', () => {
    let sampleListingId: string;

    beforeEach(async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Concepts of Physics Vol 1',
          author: 'H.C. Verma',
          isbn: '978-8177091878',
          subject: 'Physics',
          condition: 'LIKE_NEW',
          pickupLocation: 'Library Front Gate',
          photos: ['https://example.com/hc1.jpg', 'https://example.com/hc2.jpg'],
          description: 'Includes solutions supplement.',
        });
      sampleListingId = res.body.listing.id;
    });

    it('returns 200 with full book details and photos for a valid ID', async () => {
      const res = await request.get(`/api/listings/${sampleListingId}`);

      expect(res.status).toBe(200);
      expect(res.body.listing).toBeDefined();
      expect(res.body.listing.title).toBe('Concepts of Physics Vol 1');
      expect(res.body.listing.photos).toHaveLength(2);
      expect(res.body.listing.pickupLocation).toBe('Library Front Gate');
      expect(res.body.listing.description).toBe('Includes solutions supplement.');
    });

    it('returns 404 for a non-existent listing ID', async () => {
      const res = await request.get('/api/listings/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('Secondary Sale Listings & Filtering (CS-011)', () => {
    beforeEach(async () => {
      listingService.resetForTesting();

      // Create 1 Donation listing
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Free Calculus Textbook',
          author: 'James Stewart',
          subject: 'Mathematics',
          condition: 'GOOD',
          pickupLocation: 'Library Entrance',
          photos: ['https://example.com/calc.jpg'],
          type: 'DONATION',
        });

      // Create 1 Sale listing
      await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Affordable Physics Textbook',
          author: 'Halliday and Resnick',
          subject: 'Physics',
          condition: 'LIKE_NEW',
          pickupLocation: 'Physics Dept Lobby',
          photos: ['https://example.com/phys.jpg'],
          type: 'SALE',
          price: 320,
        });
    });

    it('creates a secondary sale listing with validated INR asking price', async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Microeconomics Principles',
          author: 'Mankiw',
          subject: 'Economics',
          condition: 'GOOD',
          pickupLocation: 'Canteen Gate',
          photos: ['https://example.com/econ.jpg'],
          type: 'SALE',
          price: 250,
        });

      expect(res.status).toBe(201);
      expect(res.body.listing.type).toBe('SALE');
      expect(res.body.listing.price).toBe(250);
    });

    it('rejects a secondary sale listing without an asking price', async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Incomplete Sale Book',
          author: 'Unknown',
          subject: 'General',
          condition: 'FAIR',
          pickupLocation: 'Main Foyer',
          photos: ['https://example.com/book.jpg'],
          type: 'SALE',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects a secondary sale listing exceeding ₹5,000 affordability cap', async () => {
      const res = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Expensive Book',
          author: 'Unknown',
          subject: 'General',
          condition: 'NEW',
          pickupLocation: 'Main Foyer',
          photos: ['https://example.com/book.jpg'],
          type: 'SALE',
          price: 6500,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('filters feed specifically for SALE listings', async () => {
      const res = await request.get('/api/listings?type=SALE');
      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(1);
      expect(res.body.listings[0].type).toBe('SALE');
      expect(res.body.listings[0].price).toBe(320);
    });

    it('filters feed specifically for DONATION listings', async () => {
      const res = await request.get('/api/listings?type=DONATION');
      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(1);
      expect(res.body.listings[0].type).toBe('DONATION');
    });

    it('ranks free donation listings ahead of for-sale listings in the default feed', async () => {
      const res = await request.get('/api/listings');
      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(2);
      expect(res.body.listings[0].type).toBe('DONATION');
      expect(res.body.listings[1].type).toBe('SALE');
    });
  });
});

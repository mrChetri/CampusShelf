import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { requestService } from './request.service';

describe('Book Request Module Seam (CS-006)', () => {
  let app: any;
  let request: any;

  // Donor student (Campus Member)
  const donorId = '11111111-1111-4111-a111-111111111111';
  const donorToken = `test-token:${donorId}:donor@darrang.edu:Rahul%20Kalita`;

  // Requester student (Campus Member)
  const requesterId = '22222222-2222-4222-a222-222222222222';
  const requesterToken = `test-token:${requesterId}:requester@darrang.edu:Aarav%20Sharma`;

  // Registered User (not yet a Campus Member)
  const registeredUserId = '33333333-3333-4333-a333-333333333333';
  const registeredUserToken = `test-token:${registeredUserId}:newbie@darrang.edu:Priya%20Das`;

  // Another student
  const otherStudentId = '44444444-4444-4444-a444-444444444444';
  const otherStudentToken = `test-token:${otherStudentId}:other@darrang.edu:Bikash%20Nath`;

  let pilotCampusId: string;
  let donorListingId: string;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    requestService.resetForTesting();

    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;

    // Bootstrap donor as Campus Member
    userService.getOrCreateProfile({
      id: donorId,
      email: 'donor@darrang.edu',
      fullName: 'Rahul Kalita',
      avatarUrl: null,
    });
    userService.updateProfile(donorId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    // Bootstrap requester as Campus Member
    userService.getOrCreateProfile({
      id: requesterId,
      email: 'requester@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
    });
    userService.updateProfile(requesterId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    // Bootstrap registered user (no campus)
    userService.getOrCreateProfile({
      id: registeredUserId,
      email: 'newbie@darrang.edu',
      fullName: 'Priya Das',
      avatarUrl: null,
    });

    // Create available book listing by donor
    const donorProfile = userService.getProfileById(donorId)!;
    const listing = listingService.createListing(donorProfile, {
      title: 'University Physics with Modern Physics',
      author: 'Young and Freedman',
      subject: 'Physics',
      condition: 'GOOD',
      pickupLocation: 'Central Library Entrance',
      photos: ['https://example.com/physics.jpg'],
      description: 'Used in 1st semester.',
    });
    donorListingId = listing.id;
  });

  describe('POST /api/listings/:id/requests', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .send({ message: 'Can I have this book?' });

      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when user is only a Registered User without campus membership', async () => {
      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${registeredUserToken}`)
        .send({ message: 'I need this book.' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Campus Member/i);
    });

    it('returns 400 Bad Request when donor attempts to request their own listing', async () => {
      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ message: 'Requesting my own book' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot request your own/i);
    });

    it('returns 404 Not Found if the listing does not exist', async () => {
      const res = await request
        .post('/api/listings/00000000-0000-0000-0000-000000000000/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Hello' });

      expect(res.status).toBe(404);
    });

    it('returns 400 Bad Request when requesting a listing that is not AVAILABLE', async () => {
      listingService.withdrawListing(donorId, donorListingId);

      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'I still want this book.' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not available/i);
    });

    it('creates a PENDING request successfully for a Campus Member with an optional note', async () => {
      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Taking Physics this semester, would appreciate the book!' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('request');
      expect(res.body.request.status).toBe('PENDING');
      expect(res.body.request.listingId).toBe(donorListingId);
      expect(res.body.request.requesterId).toBe(requesterId);
      expect(res.body.request.requesterName).toBe('Aarav Sharma');
      expect(res.body.request.message).toBe('Taking Physics this semester, would appreciate the book!');
    });

    it('prevents duplicate active requests from the same user for the same listing with 409 Conflict', async () => {
      // First request
      await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'First request' });

      // Second attempt while first is pending
      const duplicateRes = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Second request attempt' });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.error).toMatch(/already have an active request/i);
    });
  });

  describe('GET /api/requests/mine', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.get('/api/requests/mine');
      expect(res.status).toBe(401);
    });

    it('returns empty requests array for a user with no requests', async () => {
      const res = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${otherStudentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requests');
      expect(res.body.requests).toEqual([]);
    });

    it('returns requests created by the authenticated student with book details, newest first', async () => {
      // Submit request
      await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Need it for study.' });

      const res = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.requests).toHaveLength(1);
      expect(res.body.requests[0].listingTitle).toBe('University Physics with Modern Physics');
      expect(res.body.requests[0].status).toBe('PENDING');
    });
  });

  describe('PATCH /api/requests/:id/cancel', () => {
    let createdRequestId: string;

    beforeEach(async () => {
      const createRes = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Will pick up.' });

      createdRequestId = createRes.body.request?.id;
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.patch(`/api/requests/${createdRequestId}/cancel`);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when a different user tries to cancel someone else request', async () => {
      const res = await request
        .patch(`/api/requests/${createdRequestId}/cancel`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/cannot cancel a request you did not make/i);
    });

    it('cancels own pending request successfully and transitions status to CANCELLED', async () => {
      const res = await request
        .patch(`/api/requests/${createdRequestId}/cancel`)
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.status).toBe('CANCELLED');

      // Verify in My Requests
      const listRes = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(listRes.body.requests[0].status).toBe('CANCELLED');
    });
  });

  describe('GET /api/listings/:id/requests (CS-007 Donor Request Inbox)', () => {
    let reqId1: string;
    let reqId2: string;

    beforeEach(async () => {
      // Bootstrap second requester as Campus Member
      userService.getOrCreateProfile({
        id: otherStudentId,
        email: 'other@darrang.edu',
        fullName: 'Bikash Nath',
        avatarUrl: null,
      });
      userService.updateProfile(otherStudentId, {
        role: 'CAMPUS_MEMBER',
        campusId: pilotCampusId,
      });

      const res1 = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'First request' });
      reqId1 = res1.body.request.id;

      const res2 = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({ message: 'Second request' });
      reqId2 = res2.body.request.id;
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.get(`/api/listings/${donorListingId}/requests`);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when another student tries to view requests for a listing they do not own', async () => {
      const res = await request
        .get(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/do not own this listing/i);
    });

    it('returns 404 when listing does not exist', async () => {
      const res = await request
        .get('/api/listings/99999999-9999-4999-a999-999999999999/requests')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(404);
    });

    it('allows listing owner (donor) to view all incoming requests', async () => {
      const res = await request
        .get(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.requests).toHaveLength(2);
      expect(res.body.requests.map((r: any) => r.id)).toContain(reqId1);
      expect(res.body.requests.map((r: any) => r.id)).toContain(reqId2);
    });
  });

  describe('POST /api/requests/:id/accept (CS-007 Accept Request & 72h Reservation)', () => {
    let reqId1: string;
    let reqId2: string;

    beforeEach(async () => {
      // Bootstrap second requester as Campus Member
      userService.getOrCreateProfile({
        id: otherStudentId,
        email: 'other@darrang.edu',
        fullName: 'Bikash Nath',
        avatarUrl: null,
      });
      userService.updateProfile(otherStudentId, {
        role: 'CAMPUS_MEMBER',
        campusId: pilotCampusId,
      });

      const res1 = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'I need it for physics' });
      reqId1 = res1.body.request.id;

      const res2 = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({ message: 'I also need this book' });
      reqId2 = res2.body.request.id;
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.post(`/api/requests/${reqId1}/accept`);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when non-owner attempts to accept a request', async () => {
      const res = await request
        .post(`/api/requests/${reqId1}/accept`)
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/do not own this listing/i);
    });

    it('returns 404 when request does not exist', async () => {
      const res = await request
        .post('/api/requests/99999999-9999-4999-a999-999999999999/accept')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(404);
    });

    it('locks listing as RESERVED, marks request ACCEPTED, auto-declines competing requests, and establishes 72h window', async () => {
      const res = await request
        .post(`/api/requests/${reqId1}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.id).toBe(reqId1);
      expect(res.body.request.status).toBe('ACCEPTED');
      expect(res.body.request.reservedUntil).toBeDefined();

      // Verify 72-hour handover window (within a tolerance of 1 minute)
      const reservedUntilTime = new Date(res.body.request.reservedUntil).getTime();
      const expectedTime = Date.now() + 72 * 60 * 60 * 1000;
      expect(Math.abs(reservedUntilTime - expectedTime)).toBeLessThan(60000);

      // Verify listing state
      expect(res.body.listing.status).toBe('RESERVED');
      expect(res.body.listing.reservedUntil).toBe(res.body.request.reservedUntil);

      // Verify competing request auto-declined
      const requestsRes = await request
        .get(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${donorToken}`);

      const competing = requestsRes.body.requests.find((r: any) => r.id === reqId2);
      expect(competing.status).toBe('DECLINED');
      expect(competing.declineReason).toMatch(/Another request was accepted/i);
    });

    it('prevents double-booking concurrency: second accept on reserved listing returns 409 Conflict', async () => {
      // First accept succeeds
      const res1 = await request
        .post(`/api/requests/${reqId1}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);
      expect(res1.status).toBe(200);

      // Attempting to accept a second request on the same reserved listing must fail
      const res2 = await request
        .post(`/api/requests/${reqId2}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res2.status).toBe(409);
      expect(res2.body.error).toMatch(/already reserved or unavailable/i);
    });
  });

  describe('POST /api/requests/:id/decline (CS-007 Decline Request)', () => {
    let reqId: string;

    beforeEach(async () => {
      const res = await request
        .post(`/api/listings/${donorListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Requesting book' });
      reqId = res.body.request.id;
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.post(`/api/requests/${reqId}/decline`);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when non-owner attempts to decline a request', async () => {
      const res = await request
        .post(`/api/requests/${reqId}/decline`)
        .set('Authorization', `Bearer ${requesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/do not own this listing/i);
    });

    it('declines individual request with optional note while keeping listing AVAILABLE', async () => {
      const res = await request
        .post(`/api/requests/${reqId}/decline`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ reason: 'Already promised to a lab partner' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.request.status).toBe('DECLINED');
      expect(res.body.request.declineReason).toBe('Already promised to a lab partner');

      // Verify listing remains AVAILABLE
      const listingRes = await request.get(`/api/listings/${donorListingId}`);
      expect(listingRes.body.listing.status).toBe('AVAILABLE');
    });

    it('returns 400 Bad Request when attempting to decline an already cancelled or declined request', async () => {
      // First decline
      await request
        .post(`/api/requests/${reqId}/decline`)
        .set('Authorization', `Bearer ${donorToken}`);

      // Second decline
      const res2 = await request
        .post(`/api/requests/${reqId}/decline`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res2.status).toBe(400);
      expect(res2.body.error).toMatch(/only pending requests can be declined/i);
    });

    it('returns 400 Bad Request when decline reason exceeds character limit (validation check)', async () => {
      const res = await request
        .post(`/api/requests/${reqId}/decline`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ reason: 'A'.repeat(301) });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/validation failed/i);
    });
  });

  describe('CS-012 Buyer Purchase Enquiry on Sale Listings', () => {
    let saleListingId: string;

    beforeEach(() => {
      const donorProfile = userService.getProfileById(donorId)!;
      const saleListing = listingService.createListing(donorProfile, {
        title: 'Concepts of Physics Vol 1',
        author: 'H.C. Verma',
        subject: 'Physics',
        condition: 'GOOD',
        pickupLocation: 'Main Campus Canteen',
        photos: ['https://example.com/hcverma.jpg'],
        type: 'SALE',
        price: 320,
      });
      saleListingId = saleListing.id;
    });

    it('allows a Campus Member to send a purchase enquiry with price and listing type preserved', async () => {
      const res = await request
        .post(`/api/listings/${saleListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'I will buy this. Can pay ₹320 via UPI when we meet.' });

      expect(res.status).toBe(201);
      expect(res.body.request.listingType).toBe('SALE');
      expect(res.body.request.listingPrice).toBe(320);
      expect(res.body.request.status).toBe('PENDING');

      // Verify seller received purchase enquiry notification
      const notifsRes = await request
        .get('/api/notifications')
        .set('Authorization', `Bearer ${donorToken}`);
      const enquiryNotif = notifsRes.body.notifications.find(
        (n: any) => n.title.includes('purchase enquiry') || n.body.includes('₹320')
      );
      expect(enquiryNotif).toBeDefined();
      expect(enquiryNotif.body).toMatch(/cash|upi|campus/i);
    });

    it('notifies buyer with direct cash/UPI payment reminder when seller accepts enquiry', async () => {
      const reqRes = await request
        .post(`/api/listings/${saleListingId}/requests`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ message: 'Available tomorrow at 2 PM.' });
      const reqId = reqRes.body.request.id;

      const acceptRes = await request
        .post(`/api/requests/${reqId}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.listing.status).toBe('RESERVED');

      // Verify buyer received acceptance notification with cash/UPI reminder
      const notifsRes = await request
        .get('/api/notifications')
        .set('Authorization', `Bearer ${requesterToken}`);
      const acceptNotif = notifsRes.body.notifications.find(
        (n: any) => n.title.includes('Purchase enquiry accepted') || n.body.includes('₹320')
      );
      expect(acceptNotif).toBeDefined();
      expect(acceptNotif.body).toMatch(/cash|upi/i);
    });
  });
});

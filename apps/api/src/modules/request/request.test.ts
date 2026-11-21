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
});

import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { handoverService } from './handover.service';

describe('Handover Module Seam (CS-008)', () => {
  let app: any;
  let request: any;

  // Donor (Campus Member)
  const donorId = '11111111-1111-4111-a111-111111111111';
  const donorToken = `test-token:${donorId}:donor@darrang.edu:Rahul%20Kalita`;

  // Recipient (Campus Member)
  const recipientId = '22222222-2222-4222-a222-222222222222';
  const recipientToken = `test-token:${recipientId}:recipient@darrang.edu:Aarav%20Sharma`;

  // Third-party student (Campus Member)
  const thirdPartyId = '33333333-3333-4333-a333-333333333333';
  const thirdPartyToken = `test-token:${thirdPartyId}:other@darrang.edu:Bikash%20Nath`;

  let pilotCampusId: string;
  let listingId: string;
  let requestId: string;
  let handoverId: string;

  beforeEach(async () => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    requestService.resetForTesting();
    handoverService.resetForTesting();

    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;

    // Bootstrap donor
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

    // Bootstrap recipient
    userService.getOrCreateProfile({
      id: recipientId,
      email: 'recipient@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
    });
    userService.updateProfile(recipientId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    // Bootstrap third party student
    userService.getOrCreateProfile({
      id: thirdPartyId,
      email: 'other@darrang.edu',
      fullName: 'Bikash Nath',
      avatarUrl: null,
    });
    userService.updateProfile(thirdPartyId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    // Donor creates listing
    const donorProfile = userService.getProfileById(donorId)!;
    const listing = listingService.createListing(donorProfile, {
      title: 'University Physics with Modern Physics',
      author: 'Young and Freedman',
      subject: 'Physics',
      condition: 'GOOD',
      pickupLocation: 'Central Library Entrance',
      photos: ['https://example.com/physics.jpg'],
    });
    listingId = listing.id;

    // Recipient requests book
    const reqRes = await request
      .post(`/api/listings/${listingId}/requests`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ message: 'Will meet after 3 PM physics lecture.' });
    requestId = reqRes.body.request.id;

    // Donor accepts request (creates handover record)
    const acceptRes = await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);

    // Fetch handover id for the tests
    const handover = handoverService.getHandoverByRequestId(requestId, donorId);
    handoverId = handover?.id || acceptRes.body.handover?.id;
  });

  describe('Handover Creation upon Request Acceptance (ADR-0001)', () => {
    it('creates a scheduled handover with agreed pickup area, 72h window, and schedule notes', async () => {
      const res = await request
        .get(`/api/handovers/${handoverId}`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.handover.id).toBe(handoverId);
      expect(res.body.handover.status).toBe('SCHEDULED');
      expect(res.body.handover.pickupLocation).toBe('Central Library Entrance');
      expect(res.body.handover.scheduleNotes).toBe('Will meet after 3 PM physics lecture.');
      expect(res.body.handover.donorId).toBe(donorId);
      expect(res.body.handover.recipientId).toBe(recipientId);
    });

    it('allows accepted recipient to view handover details and meeting location', async () => {
      const res = await request
        .get(`/api/handovers/${handoverId}`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.handover.recipientName).toBe('Aarav Sharma');
      expect(res.body.handover.pickupLocation).toBe('Central Library Entrance');
    });

    it('returns 403 Forbidden when an unrelated student attempts to view handover', async () => {
      const res = await request
        .get(`/api/handovers/${handoverId}`)
        .set('Authorization', `Bearer ${thirdPartyToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/not authorized to view this handover/i);
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.get(`/api/handovers/${handoverId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/handovers/:id/complete (Single-Sided Donor Confirmation ADR-0001)', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request.post(`/api/handovers/${handoverId}/complete`);
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when recipient attempts to complete (only donor can confirm)', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/complete`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/only the donor can mark a handover as completed/i);
    });

    it('allows donor to click Mark as Donated, transitioning handover, listing, and request to COMPLETED', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.handover.status).toBe('COMPLETED');
      expect(res.body.handover.completedAt).toBeDefined();

      // Verify listing updated to DONATED
      const listingRes = await request.get(`/api/listings/${listingId}`);
      expect(listingRes.body.listing.status).toBe('DONATED');

      // Verify request updated to COMPLETED
      const requestsRes = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${recipientToken}`);
      expect(requestsRes.body.requests[0].status).toBe('COMPLETED');
    });

    it('returns 400 Bad Request if handover is already completed', async () => {
      // First completion
      await request
        .post(`/api/handovers/${handoverId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`);

      // Second completion attempt
      const res2 = await request
        .post(`/api/handovers/${handoverId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res2.status).toBe(400);
      expect(res2.body.error).toMatch(/only scheduled handovers can be marked as completed/i);
    });
  });

  describe('POST /api/handovers/:id/dispute (Recipient Report a Problem ADR-0001)', () => {
    it('returns 401 Unauthorized when unauthenticated', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/dispute`)
        .send({ reason: 'Donor did not show up' });
      expect(res.status).toBe(401);
    });

    it('returns 403 Forbidden when donor or third party attempts to file recipient dispute', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/dispute`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ reason: 'Donor filing dispute' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/only the recipient can report a problem/i);
    });

    it('validates dispute reason input (minimum 3 characters, max 200)', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/dispute`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ reason: 'no' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/validation failed/i);
    });

    it('allows recipient to report problem and transitions handover to DISPUTED', async () => {
      const res = await request
        .post(`/api/handovers/${handoverId}/dispute`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({
          reason: 'Donor did not show up at Central Library',
          details: 'Waited for 45 minutes after the agreed 3 PM time.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.handover.status).toBe('DISPUTED');
      expect(res.body.handover.disputeReason).toBe('Donor did not show up at Central Library');
      expect(res.body.handover.disputedAt).toBeDefined();

      // Verify associated request status transitioned to DISPUTED
      const reqRes = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${recipientToken}`);
      expect(reqRes.body.requests[0].status).toBe('DISPUTED');
    });
  });

  describe('72-Hour Auto-Expiration Reversion', () => {
    it('reverts overdue scheduled handovers back to AVAILABLE and cancels pending request', async () => {
      // Simulate overdue reservation by manually setting reservedUntil in past
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const handover = handoverService.getHandoverById(handoverId, donorId);
      (handover as any).reservedUntil = pastDate;

      // Run expiration check
      const result = handoverService.revertExpiredReservations();
      expect(result.revertedCount).toBeGreaterThanOrEqual(1);

      // Verify listing reverted to AVAILABLE
      const listingRes = await request.get(`/api/listings/${listingId}`);
      expect(listingRes.body.listing.status).toBe('AVAILABLE');
      expect(listingRes.body.listing.reservedUntil).toBeNull();

      // Verify handover marked EXPIRED
      const handoverRes = await request
        .get(`/api/handovers/${handoverId}`)
        .set('Authorization', `Bearer ${donorToken}`);
      expect(handoverRes.body.handover.status).toBe('EXPIRED');

      // Verify request marked CANCELLED
      const reqRes = await request
        .get('/api/requests/mine')
        .set('Authorization', `Bearer ${recipientToken}`);
      expect(reqRes.body.requests[0].status).toBe('CANCELLED');
    });
  });

  describe('CS-012 Offline Sale Handover & Marking as SOLD', () => {
    it('creates handover with SALE listingType and asking price, then completes marking listing as SOLD', async () => {
      const donorProfile = userService.getProfileById(donorId)!;
      const saleListing = listingService.createListing(donorProfile, {
        title: 'Digital Signal Processing',
        author: 'Proakis and Manolakis',
        subject: 'Electronics',
        condition: 'LIKE_NEW',
        pickupLocation: 'ECE Department Foyer',
        photos: ['https://example.com/dsp.jpg'],
        type: 'SALE',
        price: 450,
      });

      // Recipient sends purchase enquiry
      const reqRes = await request
        .post(`/api/listings/${saleListing.id}/requests`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ message: 'I will buy this tomorrow at lunch.' });
      const saleReqId = reqRes.body.request.id;

      // Seller accepts enquiry
      const acceptRes = await request
        .post(`/api/requests/${saleReqId}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);
      expect(acceptRes.status).toBe(200);

      const saleHandover = handoverService.getHandoverByRequestId(saleReqId, donorId)!;
      expect(saleHandover.listingType).toBe('SALE');
      expect(saleHandover.price).toBe(450);

      // Seller marks handover complete (confirming in-person physical exchange)
      const completeRes = await request
        .post(`/api/handovers/${saleHandover.id}/complete`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.success).toBe(true);
      expect(completeRes.body.message).toMatch(/sale recorded/i);
      expect(completeRes.body.handover.status).toBe('COMPLETED');

      // Listing must transition to SOLD (not DONATED)
      const listingRes = await request.get(`/api/listings/${saleListing.id}`);
      expect(listingRes.body.listing.status).toBe('SOLD');

      // Recipient gets purchase completed notification
      const notifsRes = await request
        .get('/api/notifications')
        .set('Authorization', `Bearer ${recipientToken}`);
      const purchaseNotif = notifsRes.body.notifications.find(
        (n: any) => n.title.includes('Purchase completed') || n.body.includes('confirmed by the seller')
      );
      expect(purchaseNotif).toBeDefined();
    });
  });
});

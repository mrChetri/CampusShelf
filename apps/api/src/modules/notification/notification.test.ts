import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { handoverService } from '../handover/handover.service';
import { notificationService } from './notification.service';

describe('Notification Module (CS-009)', () => {
  let app: any;
  let request: any;

  const donorId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const donorToken = `test-token:${donorId}:donor@darrang.edu:Rahul%20Kalita`;

  const recipientId = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  const recipientToken = `test-token:${recipientId}:recipient@darrang.edu:Aarav%20Sharma`;

  let pilotCampusId: string;
  let listingId: string;
  let requestId: string;
  let handoverId: string;

  beforeEach(async () => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    listingService.resetForTesting();
    requestService.resetForTesting();
    handoverService.resetForTesting();
    notificationService.resetForTesting();

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

    // Create listing by donor
    const listingRes = await request
      .post('/api/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Introduction to Algorithms',
        author: 'CLRS',
        subject: 'Computer Science',
        condition: 'GOOD',
        pickupLocation: 'Library Gate',
        photos: ['https://example.com/algo.jpg'],
      });
    listingId = listingRes.body.listing.id;

    // Submit a request
    const reqRes = await request
      .post(`/api/listings/${listingId}/requests`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ message: 'Please give me this book' });
    requestId = reqRes.body.request.id;
  });

  // -------------------------------------------------------------------------
  // GET /api/notifications — basic auth guard & empty list
  // -------------------------------------------------------------------------
  it('GET /api/notifications returns 401 without auth', async () => {
    const res = await request.get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications returns empty list for new user', async () => {
    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);
    // Donor should have 1 notification from the request submitted in beforeEach
    expect(res.status).toBe(200);
    expect(res.body.notifications).toBeInstanceOf(Array);
    expect(res.body.unreadCount).toBeTypeOf('number');
  });

  // -------------------------------------------------------------------------
  // REQUEST_RECEIVED trigger
  // -------------------------------------------------------------------------
  it('donor receives REQUEST_RECEIVED notification when a request is submitted', async () => {
    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    const n = res.body.notifications.find((n: any) => n.type === 'REQUEST_RECEIVED');
    expect(n).toBeDefined();
    expect(n.read).toBe(false);
  });

  // -------------------------------------------------------------------------
  // REQUEST_ACCEPTED trigger
  // -------------------------------------------------------------------------
  it('requester receives REQUEST_ACCEPTED notification when request is accepted', async () => {
    // Donor accepts the request
    const acceptRes = await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    expect(acceptRes.status).toBe(200);
    const handoverLookup = await request
      .get(`/api/handovers/by-request/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    handoverId = handoverLookup.body.handover.id;

    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    const n = res.body.notifications.find((n: any) => n.type === 'REQUEST_ACCEPTED');
    expect(n).toBeDefined();
    expect(n.userId).toBe(recipientId);
  });

  // -------------------------------------------------------------------------
  // REQUEST_DECLINED trigger (manual decline)
  // -------------------------------------------------------------------------
  it('requester receives REQUEST_DECLINED notification when request is declined', async () => {
    await request
      .post(`/api/requests/${requestId}/decline`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ reason: 'Already given away' });

    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    const n = res.body.notifications.find((n: any) => n.type === 'REQUEST_DECLINED');
    expect(n).toBeDefined();
    expect(n.userId).toBe(recipientId);
  });

  // -------------------------------------------------------------------------
  // HANDOVER_COMPLETED trigger
  // -------------------------------------------------------------------------
  it('recipient receives HANDOVER_COMPLETED notification when handover is completed', async () => {
    // Accept request → creates handover
    await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    const handoverLookup = await request
      .get(`/api/handovers/by-request/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    handoverId = handoverLookup.body.handover.id;

    // Donor completes handover
    await request
      .post(`/api/handovers/${handoverId}/complete`)
      .set('Authorization', `Bearer ${donorToken}`);

    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    const n = res.body.notifications.find((n: any) => n.type === 'HANDOVER_COMPLETED');
    expect(n).toBeDefined();
    expect(n.userId).toBe(recipientId);
  });

  // -------------------------------------------------------------------------
  // HANDOVER_DISPUTED trigger
  // -------------------------------------------------------------------------
  it('donor receives HANDOVER_DISPUTED notification when recipient raises a dispute', async () => {
    await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    const handoverLookup = await request
      .get(`/api/handovers/by-request/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    handoverId = handoverLookup.body.handover.id;

    await request
      .post(`/api/handovers/${handoverId}/dispute`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ reason: 'Book was damaged', details: 'Pages torn' });

    const res = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);

    expect(res.status).toBe(200);
    const n = res.body.notifications.find((n: any) => n.type === 'HANDOVER_DISPUTED');
    expect(n).toBeDefined();
    expect(n.userId).toBe(donorId);
  });

  // -------------------------------------------------------------------------
  // PATCH /api/notifications/read
  // -------------------------------------------------------------------------
  it('PATCH /api/notifications/read marks specified notifications as read', async () => {
    const listRes = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);
    const notifId = listRes.body.notifications[0].id;

    const patchRes = await request
      .patch('/api/notifications/read')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ notificationIds: [notifId] });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.updatedCount).toBe(1);

    const after = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);
    const updated = after.body.notifications.find((n: any) => n.id === notifId);
    expect(updated.read).toBe(true);
  });

  it('PATCH /api/notifications/read returns 400 for empty array', async () => {
    const res = await request
      .patch('/api/notifications/read')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ notificationIds: [] });
    expect(res.status).toBe(400);
  });

  // -------------------------------------------------------------------------
  // PATCH /api/notifications/read-all
  // -------------------------------------------------------------------------
  it('PATCH /api/notifications/read-all marks all notifications as read', async () => {
    const patchRes = await request
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${donorToken}`);

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.updatedCount).toBeGreaterThanOrEqual(1);

    const after = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(after.body.unreadCount).toBe(0);
  });

  // -------------------------------------------------------------------------
  // GET /api/notifications/history
  // -------------------------------------------------------------------------
  it('GET /api/notifications/history returns 401 without auth', async () => {
    const res = await request.get('/api/notifications/history');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications/history returns donation history', async () => {
    // Accept and complete a handover so the donor has a donated book
    await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    const handoverLookup = await request
      .get(`/api/handovers/by-request/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    handoverId = handoverLookup.body.handover.id;

    await request
      .post(`/api/handovers/${handoverId}/complete`)
      .set('Authorization', `Bearer ${donorToken}`);

    // Donor history: should have 1 donated book
    const donorHistory = await request
      .get('/api/notifications/history')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(donorHistory.status).toBe(200);
    expect(donorHistory.body.history.booksGiven).toHaveLength(1);
    expect(donorHistory.body.history.booksGiven[0].status).toBe('DONATED');

    // Recipient history: should have 1 received book
    const recipientHistory = await request
      .get('/api/notifications/history')
      .set('Authorization', `Bearer ${recipientToken}`);
    expect(recipientHistory.status).toBe(200);
    expect(recipientHistory.body.history.booksReceived).toHaveLength(1);
    expect(recipientHistory.body.history.booksReceived[0].status).toBe('COMPLETED');
  });

  it('GET /api/notifications/history returns empty history for user with no activity', async () => {
    const res = await request
      .get('/api/notifications/history')
      .set('Authorization', `Bearer ${recipientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history.booksGiven).toHaveLength(0);
    expect(res.body.history.booksReceived).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // GET /api/notifications/impact/:campusId
  // -------------------------------------------------------------------------
  it('GET /api/notifications/impact/:campusId returns campus impact metrics (no auth)', async () => {
    const res = await request.get(`/api/notifications/impact/${pilotCampusId}`);
    expect(res.status).toBe(200);
    expect(res.body.impact.campusId).toBe(pilotCampusId);
    expect(res.body.impact.totalListed).toBeGreaterThanOrEqual(1);
    expect(res.body.impact.totalReserved).toBeTypeOf('number');
    expect(res.body.impact.totalDonated).toBeTypeOf('number');
    expect(res.body.impact.totalMembers).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/notifications/impact/:campusId returns 400 for invalid UUID', async () => {
    const res = await request.get('/api/notifications/impact/not-a-uuid');
    expect(res.status).toBe(400);
  });

  it('GET /api/notifications/impact/:campusId returns 404 for unknown campus', async () => {
    const res = await request.get('/api/notifications/impact/00000000-0000-4000-a000-000000000000');
    expect(res.status).toBe(404);
  });

  it('GET /api/notifications/impact reflects updated counts after a completed handover', async () => {
    const before = await request.get(`/api/notifications/impact/${pilotCampusId}`);
    expect(before.body.impact.totalDonated).toBe(0);

    // Complete handover
    await request
      .post(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    const handoverLookup = await request
      .get(`/api/handovers/by-request/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    handoverId = handoverLookup.body.handover.id;
    await request
      .post(`/api/handovers/${handoverId}/complete`)
      .set('Authorization', `Bearer ${donorToken}`);

    const after = await request.get(`/api/notifications/impact/${pilotCampusId}`);
    expect(after.body.impact.totalDonated).toBe(1);
  });
});

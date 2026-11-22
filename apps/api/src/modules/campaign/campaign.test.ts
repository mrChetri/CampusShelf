import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { partnerService } from '../partner/partner.service';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { handoverService } from '../handover/handover.service';
import { campaignService } from './campaign.service';

describe('Campaign Module Seam (CS-014 NGO Book Needs)', () => {
  let app: any;
  let request: any;

  // Regular Campus Member (Student Donor)
  const donorId = '11111111-1111-4111-a111-111111111111';
  const donorToken = `test-token:${donorId}:donor@darrang.edu:Aarav%20Sharma`;

  // Second Campus Member (Recipient / Partner Volunteer)
  const recipientId = '22222222-2222-4222-a222-222222222222';
  const recipientToken = `test-token:${recipientId}:recipient@darrang.edu:Priya%20Das`;

  // Staff / Admin
  const adminId = '33333333-3333-4333-a333-333333333333';
  const adminToken = `test-token:${adminId}:admin@darrang.edu:Campus%20Admin`;

  const partnerId = '770e8400-e29b-41d4-a716-446655440002'; // Tezpur Community Book Bank
  let pilotCampusId: string;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    partnerService.resetForTesting();
    listingService.resetForTesting();
    requestService.resetForTesting();
    handoverService.resetForTesting();
    campaignService.resetForTesting();

    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;

    // Bootstrap donor
    userService.getOrCreateProfile({
      id: donorId,
      email: 'donor@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
    });
    userService.updateProfile(donorId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });

    // Bootstrap recipient
    userService.getOrCreateProfile({
      id: recipientId,
      email: 'recipient@darrang.edu',
      fullName: 'Priya Das',
      avatarUrl: null,
    });
    userService.updateProfile(recipientId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });

    // Bootstrap admin
    userService.getOrCreateProfile({
      id: adminId,
      email: 'admin@darrang.edu',
      fullName: 'Campus Admin',
      avatarUrl: null,
    });
    userService.updateProfile(adminId, {
      role: 'ADMIN',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });
  });

  describe('Public Campaign Book Needs (GET /api/campaigns/needs)', () => {
    it('returns seeded active campaign book needs', async () => {
      const res = await request.get('/api/campaigns/needs');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.needs)).toBe(true);
      expect(res.body.needs.length).toBeGreaterThanOrEqual(1);

      const first = res.body.needs[0];
      expect(first.status).toBe('ACTIVE');
      expect(first.targetQuantity).toBeGreaterThan(0);
      expect(first.partnerName).toBeTruthy();
    });

    it('filters needs by partnerId and category', async () => {
      const res = await request.get(`/api/campaigns/needs?partnerId=${partnerId}&category=SCIENCE`);

      expect(res.status).toBe(200);
      for (const need of res.body.needs) {
        expect(need.partnerId).toBe(partnerId);
        expect(need.category).toBe('SCIENCE');
      }
    });

    it('retrieves single campaign need by ID', async () => {
      const listRes = await request.get('/api/campaigns/needs');
      const sample = listRes.body.needs[0];

      const res = await request.get(`/api/campaigns/needs/${sample.id}`);
      expect(res.status).toBe(200);
      expect(res.body.need.id).toBe(sample.id);
      expect(res.body.need.title).toBe(sample.title);
    });

    it('returns 404 for unknown campaign need ID', async () => {
      const res = await request.get('/api/campaigns/needs/00000000-0000-4000-a000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });
  });

  describe('Campaign Need Management (POST & PATCH /api/campaigns/needs)', () => {
    it('rejects need creation by unauthenticated or non-admin user with 401/403', async () => {
      const payload = {
        partnerId,
        title: 'Class 10 Mathematics Revision Guides',
        category: 'MATHEMATICS',
        targetQuantity: 10,
      };

      const unauthRes = await request.post('/api/campaigns/needs').send(payload);
      expect(unauthRes.status).toBe(401);

      const memberRes = await request
        .post('/api/campaigns/needs')
        .set('Authorization', `Bearer ${donorToken}`)
        .send(payload);
      expect(memberRes.status).toBe(403);
    });

    it('allows admin / partner manager to publish a new campaign book need', async () => {
      const payload = {
        partnerId,
        title: 'Class 10 SEBA Board General Science Guides',
        category: 'SCIENCE',
        course: 'Class 10 High School',
        description: 'Textbooks and sample question papers for rural high school students.',
        targetQuantity: 12,
        urgent: true,
      };

      const res = await request
        .post('/api/campaigns/needs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.need.title).toBe(payload.title);
      expect(res.body.need.targetQuantity).toBe(12);
      expect(res.body.need.fulfilledQuantity).toBe(0);
      expect(res.body.need.status).toBe('ACTIVE');
      expect(res.body.need.urgent).toBe(true);
      expect(res.body.need.partnerName).toBe('Tezpur Community Book Bank');
    });

    it('allows admin to update need target quantity and status', async () => {
      const createRes = await request
        .post('/api/campaigns/needs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          partnerId,
          title: 'Introductory Economics Textbooks',
          category: 'COMMERCE',
          targetQuantity: 5,
        });

      const needId = createRes.body.need.id;

      const updateRes = await request
        .patch(`/api/campaigns/needs/${needId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targetQuantity: 8,
          urgent: true,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.need.targetQuantity).toBe(8);
      expect(updateRes.body.need.urgent).toBe(true);
    });
  });

  describe('Campaign Donation & Handover Fulfillment Flow (CS-014)', () => {
    it('links student donation listing to campaign and marks fulfillment upon confirmed handover', async () => {
      // 1. Create a campaign need with target quantity = 1
      const needRes = await request
        .post('/api/campaigns/needs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          partnerId,
          title: 'Single Copy Test Campaign Guide',
          category: 'SCIENCE',
          targetQuantity: 1,
        });

      const needId = needRes.body.need.id;
      expect(needRes.body.need.fulfilledQuantity).toBe(0);
      expect(needRes.body.need.status).toBe('ACTIVE');

      // 2. Student donates a book directly linked to this campaign need
      const listingRes = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Class 10 Physics NCERT',
          author: 'NCERT Team',
          subject: 'Science',
          condition: 'GOOD',
          pickupLocation: 'Central Library Entrance',
          photos: ['https://example.com/physics.jpg'],
          type: 'DONATION',
          campaignNeedId: needId,
        });

      expect(listingRes.status).toBe(201);
      expect(listingRes.body.listing.campaignNeedId).toBe(needId);
      expect(listingRes.body.listing.partnerName).toBe('Tezpur Community Book Bank');

      const listingId = listingRes.body.listing.id;

      // 3. Recipient requests the book
      const requestRes = await request
        .post(`/api/listings/${listingId}/requests`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ message: 'Collecting on behalf of community book drive.' });

      expect(requestRes.status).toBe(201);
      const requestId = requestRes.body.request.id;

      // 4. Donor accepts request -> Handover scheduled
      const acceptRes = await request
        .post(`/api/requests/${requestId}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(acceptRes.status).toBe(200);
      const handover = handoverService.getHandoverByRequestId(requestId, donorId);
      expect(handover).toBeDefined();
      const handoverId = handover!.id;

      // Verify campaign need is not yet fulfilled before handover
      let currentNeed = campaignService.getNeedById(needId);
      expect(currentNeed?.fulfilledQuantity).toBe(0);

      // 5. Donor completes the handover
      const completeRes = await request
        .post(`/api/handovers/${handoverId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(completeRes.status).toBe(200);

      // 6. Campaign fulfillment verified: fulfilledQuantity incremented and status changed to FULFILLED!
      const updatedNeedRes = await request.get(`/api/campaigns/needs/${needId}`);
      expect(updatedNeedRes.status).toBe(200);
      expect(updatedNeedRes.body.need.fulfilledQuantity).toBe(1);
      expect(updatedNeedRes.body.need.status).toBe('FULFILLED');
    });
  });
});

import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { partnerService } from './partner.service';

describe('Partner Module Seam (CS-013 Verified Partner Directory)', () => {
  let app: any;
  let request: any;

  // Regular Campus Member
  const memberId = '11111111-1111-4111-a111-111111111111';
  const memberToken = `test-token:${memberId}:member@darrang.edu:Aarav%20Sharma`;

  // Campus Moderator / Admin
  const adminId = '33333333-3333-4333-a333-333333333333';
  const adminToken = `test-token:${adminId}:admin@darrang.edu:Campus%20Admin`;

  let pilotCampusId: string;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    partnerService.resetForTesting();

    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;

    // Bootstrap regular member
    userService.getOrCreateProfile({
      id: memberId,
      email: 'member@darrang.edu',
      fullName: 'Aarav Sharma',
      avatarUrl: null,
    });
    userService.updateProfile(memberId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });

    // Bootstrap admin / moderator
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

  describe('Public Partner Directory (GET /api/partners)', () => {
    it('returns seeded verified partners without requiring authentication', async () => {
      const res = await request.get('/api/partners');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.partners)).toBe(true);
      expect(res.body.partners.length).toBeGreaterThanOrEqual(1);

      // Verify all returned partners have verificationStatus === 'VERIFIED'
      for (const partner of res.body.partners) {
        expect(partner.verificationStatus).toBe('VERIFIED');
        expect(partner.verifiedAt).toBeTruthy();
      }
    });

    it('filters verified partners by partner type (e.g. NGO)', async () => {
      const res = await request.get('/api/partners?type=NGO');

      expect(res.status).toBe(200);
      for (const partner of res.body.partners) {
        expect(partner.type).toBe('NGO');
        expect(partner.verificationStatus).toBe('VERIFIED');
      }
    });

    it('filters verified partners by campus scope', async () => {
      const res = await request.get(`/api/partners?campusId=${pilotCampusId}`);

      expect(res.status).toBe(200);
      for (const partner of res.body.partners) {
        expect(partner.campusId).toBe(pilotCampusId);
        expect(partner.verificationStatus).toBe('VERIFIED');
      }
    });

    it('retrieves single verified partner details by ID', async () => {
      const listRes = await request.get('/api/partners');
      const firstPartner = listRes.body.partners[0];

      const res = await request.get(`/api/partners/${firstPartner.id}`);
      expect(res.status).toBe(200);
      expect(res.body.partner.id).toBe(firstPartner.id);
      expect(res.body.partner.name).toBe(firstPartner.name);
    });

    it('returns 404 for non-existent partner ID', async () => {
      const res = await request.get('/api/partners/00000000-0000-4000-a000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Partner organization not found');
    });
  });

  describe('Admin Partner Management & Review Seams', () => {
    it('rejects partner onboarding by unauthenticated or non-admin users with 401/403', async () => {
      // Unauthenticated
      const unauthRes = await request
        .post('/api/admin/partners')
        .send({
          name: 'Unauthorized NGO',
          type: 'NGO',
          description: 'Grassroots learning initiative for local students.',
          contactEmail: 'contact@unauth.org',
        });
      expect(unauthRes.status).toBe(401);

      // Regular campus member (forbidden)
      const memberRes = await request
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Unauthorized NGO',
          type: 'NGO',
          description: 'Grassroots learning initiative for local students.',
          contactEmail: 'contact@unauth.org',
        });
      expect(memberRes.status).toBe(403);
      expect(memberRes.body.error).toContain('privileges required');
    });

    it('allows admin to onboard a new partner organization in PENDING review state', async () => {
      const newPartner = {
        name: 'Assam Valley Youth Reading Initiative',
        type: 'NGO',
        campusId: pilotCampusId,
        description: 'Providing reference materials and competitive exam textbooks to rural students.',
        website: 'https://assamreading.org',
        contactEmail: 'contact@assamreading.org',
        contactPhone: '+91 94350 12345',
        address: 'Bhairabi Temple Road, Tezpur, Assam',
      };

      const res = await request
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPartner);

      expect(res.status).toBe(201);
      expect(res.body.partner.name).toBe(newPartner.name);
      expect(res.body.partner.verificationStatus).toBe('PENDING');
      expect(res.body.partner.campusName).toBe('Darrang College');

      // Crucial verification: PENDING partner must NOT appear in public directory yet
      const publicRes = await request.get('/api/partners');
      const foundInPublic = publicRes.body.partners.find((p: any) => p.id === res.body.partner.id);
      expect(foundInPublic).toBeUndefined();

      // But must appear in admin list
      const adminListRes = await request
        .get('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminListRes.status).toBe(200);
      const foundInAdmin = adminListRes.body.partners.find((p: any) => p.id === res.body.partner.id);
      expect(foundInAdmin).toBeDefined();
    });

    it('allows admin to review and verify a partner profile, rendering verified badge', async () => {
      // 1. Onboard partner
      const createRes = await request
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Darrang District Student Union Book Cell',
          type: 'STUDENT_UNION',
          campusId: pilotCampusId,
          description: 'Student-run book lending repository assisting freshers with syllabus books.',
          contactEmail: 'cell@darrangunion.org',
        });

      const partnerId = createRes.body.partner.id;
      expect(createRes.body.partner.verificationStatus).toBe('PENDING');

      // 2. Admin reviews and approves the partner
      const reviewRes = await request
        .patch(`/api/admin/partners/${partnerId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          verificationStatus: 'VERIFIED',
          adminReviewNotes: 'Verified registration with campus union registrar. Approved for public directory.',
        });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.partner.verificationStatus).toBe('VERIFIED');
      expect(reviewRes.body.partner.verifiedAt).toBeTruthy();
      expect(reviewRes.body.partner.adminReviewNotes).toContain('Approved for public directory');

      // 3. Now verified partner MUST appear in public directory
      const publicRes = await request.get('/api/partners');
      const verifiedPublic = publicRes.body.partners.find((p: any) => p.id === partnerId);
      expect(verifiedPublic).toBeDefined();
      expect(verifiedPublic.verificationStatus).toBe('VERIFIED');
    });

    it('allows admin to reject a partner with review notes', async () => {
      const createRes = await request
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Questionable Commercial Entity',
          type: 'NGO',
          description: 'Claims to be a non-profit but operates as a commercial coaching store.',
          contactEmail: 'store@coaching.com',
        });

      const partnerId = createRes.body.partner.id;

      const rejectRes = await request
        .patch(`/api/admin/partners/${partnerId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          verificationStatus: 'REJECTED',
          adminReviewNotes: 'Rejected: commercial enterprise selling private study packs; not an NGO partner.',
        });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.partner.verificationStatus).toBe('REJECTED');
      expect(rejectRes.body.partner.verifiedAt).toBeNull();

      // Rejected partner must NOT appear in public directory
      const publicRes = await request.get('/api/partners');
      const rejectedInPublic = publicRes.body.partners.find((p: any) => p.id === partnerId);
      expect(rejectedInPublic).toBeUndefined();
    });

    it('allows admin to update partner details', async () => {
      const createRes = await request
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tezpur Learning Circle',
          type: 'COMMUNITY_LIBRARY',
          description: 'Community space for book exchanges and quiet reading sessions.',
          contactEmail: 'circle@tezpur.org',
        });

      const partnerId = createRes.body.partner.id;

      const updateRes = await request
        .patch(`/api/admin/partners/${partnerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          website: 'https://tezpurcircle.org',
          contactPhone: '+91 98765 00000',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.partner.website).toBe('https://tezpurcircle.org');
      expect(updateRes.body.partner.contactPhone).toBe('+91 98765 00000');
    });
  });
});

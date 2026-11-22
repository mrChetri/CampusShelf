import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { userService } from '../user/user.service';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { moderationService } from './moderation.service';

describe('Moderation Module Seam (CS-010)', () => {
  let app: any;
  let request: any;

  // Regular Campus Member (Reporter)
  const memberId = '11111111-1111-4111-a111-111111111111';
  const memberToken = `test-token:${memberId}:member@darrang.edu:Aarav%20Sharma`;

  // Second Campus Member (Target User / Donor)
  const targetUserId = '22222222-2222-4222-a222-222222222222';
  const targetUserToken = `test-token:${targetUserId}:target@darrang.edu:Suspicious%20Seller`;

  // Moderator
  const moderatorId = '33333333-3333-4333-a333-333333333333';
  const moderatorToken = `test-token:${moderatorId}:mod@darrang.edu:Campus%20Moderator`;

  let pilotCampusId: string;
  let listingId: string;

  beforeEach(async () => {
    app = createApp();
    request = supertest(app);

    campusService.resetForTesting();
    listingService.resetForTesting();
    requestService.resetForTesting();
    moderationService.resetForTesting();

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

    // Bootstrap target user
    userService.getOrCreateProfile({
      id: targetUserId,
      email: 'target@darrang.edu',
      fullName: 'Suspicious Seller',
      avatarUrl: null,
    });
    userService.updateProfile(targetUserId, {
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });

    // Bootstrap moderator
    userService.getOrCreateProfile({
      id: moderatorId,
      email: 'mod@darrang.edu',
      fullName: 'Campus Moderator',
      avatarUrl: null,
    });
    userService.updateProfile(moderatorId, {
      role: 'MODERATOR',
      campusId: pilotCampusId,
      status: 'ACTIVE',
    });

    // Create a listing by target user
    const listingRes = await request
      .post('/api/listings')
      .set('Authorization', `Bearer ${targetUserToken}`)
      .send({
        title: 'Commercial Chemistry Question Bank',
        author: 'Publisher XYZ',
        subject: 'Chemistry',
        condition: 'NEW',
        pickupLocation: 'Gate 2',
        photos: ['https://example.com/chem.jpg'],
      });
    listingId = listingRes.body.listing.id;
  });

  // ---------------------------------------------------------------------------
  // 1. Community Reporting (POST /api/reports)
  // ---------------------------------------------------------------------------
  describe('POST /api/reports', () => {
    it('rejects unauthenticated reports with 401', async () => {
      const res = await request.post('/api/reports').send({
        targetType: 'LISTING',
        targetId: listingId,
        reason: 'SPAM',
      });
      expect(res.status).toBe(401);
    });

    it('allows an authenticated member to report a listing', async () => {
      const res = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'LISTING',
          targetId: listingId,
          reason: 'COMMERCIAL_SALE',
          details: 'Selling bulk printed sets for profit.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.report.id).toBeDefined();
      expect(res.body.report.targetType).toBe('LISTING');
      expect(res.body.report.targetId).toBe(listingId);
      expect(res.body.report.reporterId).toBe(memberId);
      expect(res.body.report.status).toBe('PENDING');
    });

    it('allows an authenticated member to report another user', async () => {
      const res = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'USER',
          targetId: targetUserId,
          reason: 'HARASSMENT',
          details: 'Sent threatening messages.',
        });

      expect(res.status).toBe(201);
      expect(res.body.report.targetType).toBe('USER');
      expect(res.body.report.targetId).toBe(targetUserId);
    });

    it('rejects self-reporting with 400', async () => {
      const res = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'USER',
          targetId: memberId,
          reason: 'SPAM',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Cannot report your own account/i);
    });

    it('returns 404 when reporting a non-existent listing', async () => {
      const res = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'LISTING',
          targetId: '00000000-0000-4000-a000-000000000000',
          reason: 'SPAM',
        });

      expect(res.status).toBe(404);
    });

    it('returns 400 on invalid input payload', async () => {
      const res = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'INVALID',
          targetId: 'bad-uuid',
        });

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Moderator Queue (GET /api/admin/reports)
  // ---------------------------------------------------------------------------
  describe('GET /api/admin/reports', () => {
    beforeEach(async () => {
      // Seed a report
      await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'LISTING',
          targetId: listingId,
          reason: 'COMMERCIAL_SALE',
          details: 'Commercial seller.',
        });
    });

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request.get('/api/admin/reports');
      expect(res.status).toBe(401);
    });

    it('rejects non-moderator requests with 403 Forbidden', async () => {
      const res = await request
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it('returns list of reports for a moderator', async () => {
      const res = await request
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.reports).toHaveLength(1);
      expect(res.body.reports[0].targetId).toBe(listingId);
    });

    it('allows filtering reports by status', async () => {
      const res = await request
        .get('/api/admin/reports?status=PENDING')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.reports).toHaveLength(1);

      const resolvedRes = await request
        .get('/api/admin/reports?status=RESOLVED')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(resolvedRes.body.reports).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Moderator Actions & Enforcement (POST /api/admin/moderate)
  // ---------------------------------------------------------------------------
  describe('POST /api/admin/moderate', () => {
    let reportId: string;

    beforeEach(async () => {
      const rep = await request
        .post('/api/reports')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          targetType: 'LISTING',
          targetId: listingId,
          reason: 'COMMERCIAL_SALE',
          details: 'Selling commercial books.',
        });
      reportId = rep.body.report.id;
    });

    it('rejects non-moderators with 403', async () => {
      const res = await request
        .post('/api/admin/moderate')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          action: 'HIDE_LISTING',
          targetType: 'LISTING',
          targetId: listingId,
          reason: 'Policy violation',
        });
      expect(res.status).toBe(403);
    });

    it('moderator can HIDE a listing and resolve the report with immutable audit log', async () => {
      // 1. Verify listing is visible initially in feed
      const feedBefore = await request.get('/api/listings');
      expect(feedBefore.body.listings.some((l: any) => l.id === listingId)).toBe(true);

      // 2. Execute HIDE_LISTING
      const res = await request
        .post('/api/admin/moderate')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          action: 'HIDE_LISTING',
          targetType: 'LISTING',
          targetId: listingId,
          reportId,
          reason: 'Confirmed commercial bulk seller',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.auditEvent.action).toBe('HIDE_LISTING');
      expect(res.body.auditEvent.actorId).toBe(moderatorId);
      expect(res.body.report.status).toBe('RESOLVED');

      // 3. Verify listing is NOW EXCLUDED from public search and browse feed
      const feedAfter = await request.get('/api/listings');
      expect(feedAfter.body.listings.some((l: any) => l.id === listingId)).toBe(false);

      // 4. Verify report in queue is marked as RESOLVED
      const reportsRes = await request
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${moderatorToken}`);
      const updatedReport = reportsRes.body.reports.find((r: any) => r.id === reportId);
      expect(updatedReport.status).toBe('RESOLVED');
    });

    it('moderator can SUSPEND a user, barring them from creating listings and requests', async () => {
      // 1. Execute SUSPEND_USER
      const res = await request
        .post('/api/admin/moderate')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          action: 'SUSPEND_USER',
          targetType: 'USER',
          targetId: targetUserId,
          reason: 'Severe abuse of platform terms',
        });

      expect(res.status).toBe(200);
      expect(res.body.auditEvent.action).toBe('SUSPEND_USER');

      // 2. Verify target user cannot create new listings
      const createListingRes = await request
        .post('/api/listings')
        .set('Authorization', `Bearer ${targetUserToken}`)
        .send({
          title: 'Another Listing',
          author: 'Author',
          subject: 'Physics',
          condition: 'GOOD',
          pickupLocation: 'Library',
          photos: ['https://example.com/p.jpg'],
        });
      expect(createListingRes.status).toBe(403);
      expect(createListingRes.body.error).toMatch(/Account is suspended/i);

      // 3. Verify target user cannot request books
      const requestRes = await request
        .post(`/api/listings/${listingId}/requests`)
        .set('Authorization', `Bearer ${targetUserToken}`)
        .send({ message: 'I want this' });
      expect(requestRes.status).toBe(403);
      expect(requestRes.body.error).toMatch(/Account is suspended/i);
    });

    it('moderator can DISMISS a report', async () => {
      const res = await request
        .post('/api/admin/moderate')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          action: 'DISMISS_REPORT',
          targetType: 'LISTING',
          targetId: listingId,
          reportId,
          reason: 'False report; student confirmed genuine copy',
        });

      expect(res.status).toBe(200);
      expect(res.body.report.status).toBe('DISMISSED');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Immutable Audit Logs (GET /api/admin/audit-logs)
  // ---------------------------------------------------------------------------
  describe('GET /api/admin/audit-logs', () => {
    it('returns 403 for non-moderators', async () => {
      const res = await request
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it('returns audit log entries after moderation actions', async () => {
      await request
        .post('/api/admin/moderate')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          action: 'HIDE_LISTING',
          targetType: 'LISTING',
          targetId: listingId,
          reason: 'Inappropriate content',
        });

      const res = await request
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.auditLogs).toHaveLength(1);
      expect(res.body.auditLogs[0].action).toBe('HIDE_LISTING');
      expect(res.body.auditLogs[0].actorId).toBe(moderatorId);
    });
  });
});

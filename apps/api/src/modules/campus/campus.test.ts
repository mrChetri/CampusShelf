import { describe, expect, it, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../app';
import { campusService } from './campus.service';

describe('Campus Module Seam (CS-003)', () => {
  let app: any;
  let request: any;
  const registeredToken = 'test-token:11111111-1111-4111-a111-111111111111:student@darrang.edu:Asha%20Sharma';
  let pilotCampusId: string;

  beforeEach(() => {
    app = createApp();
    request = supertest(app);
    campusService.resetForTesting();
    const campuses = campusService.listCampuses();
    pilotCampusId = campuses[0].id;
  });

  describe('GET /api/campuses', () => {
    it('returns 200 and lists active campuses including Darrang College', async () => {
      const res = await request.get('/api/campuses');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.campuses)).toBe(true);
      expect(res.body.campuses.length).toBeGreaterThanOrEqual(1);

      const darrang = res.body.campuses.find((c: any) => c.slug === 'darrang-college');
      expect(darrang).toBeDefined();
      expect(darrang?.name).toBe('Darrang College');
      expect(darrang?.city).toBe('Tezpur');
      expect(darrang?.state).toBe('Assam');
      expect(darrang?.active).toBe(true);
    });
  });

  describe('POST /api/campuses/redeem-invite', () => {
    it('rejects unauthenticated redemption with 401', async () => {
      const res = await request
        .post('/api/campuses/redeem-invite')
        .send({
          campusId: pilotCampusId,
          code: 'DARRANG-PILOT-2026',
        });

      expect(res.status).toBe(401);
    });

    it('rejects redemption with an invalid or non-existent code with 400', async () => {
      const res = await request
        .post('/api/campuses/redeem-invite')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'WRONG-CODE-9999',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid.*invite code/i);
    });

    it('rejects redemption if the invite code has expired', async () => {
      campusService.createInviteCodeForTesting({
        campusId: pilotCampusId,
        code: 'EXPIRED-CODE-1234',
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
        maxUses: 10,
      });

      const res = await request
        .post('/api/campuses/redeem-invite')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'EXPIRED-CODE-1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/expired/i);
    });

    it('rejects redemption if the invite code is revoked', async () => {
      campusService.createInviteCodeForTesting({
        campusId: pilotCampusId,
        code: 'REVOKED-CODE-1234',
        revoked: true,
      });

      const res = await request
        .post('/api/campuses/redeem-invite')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'REVOKED-CODE-1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/revoked/i);
    });

    it('rejects redemption if the invite code usage limit is exhausted', async () => {
      campusService.createInviteCodeForTesting({
        campusId: pilotCampusId,
        code: 'EXHAUSTED-CODE-1234',
        maxUses: 1,
        usedCount: 1,
      });

      const res = await request
        .post('/api/campuses/redeem-invite')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'EXHAUSTED-CODE-1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/maximum usage limit/i);
    });

    it('successfully redeems valid invite code and elevates user to Campus Member', async () => {
      const res = await request
        .post('/api/campuses/redeem-invite')
        .set('Authorization', `Bearer ${registeredToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'darrang-pilot-2026', // Case-insensitive matching
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toBe('CAMPUS_MEMBER');
      expect(res.body.user.campusId).toBe(pilotCampusId);
      expect(res.body.user.campusName).toBe('Darrang College');

      // Subsequent /api/me check confirms persistent membership
      const meRes = await request
        .get('/api/me')
        .set('Authorization', `Bearer ${registeredToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.role).toBe('CAMPUS_MEMBER');
      expect(meRes.body.campusId).toBe(pilotCampusId);
    });
  });

  describe('Admin Invite Endpoints', () => {
    const adminToken = 'test-token:99999999-9999-4999-a999-999999999999:admin@campusshelf.org:System%20Admin';

    it('allows generating a new invite code for a campus', async () => {
      const res = await request
        .post('/api/campuses/admin/invites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          campusId: pilotCampusId,
          code: 'NEW-SEMESTER-2026',
          maxUses: 50,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.invite.maxUses).toBe(50);
    });

    it('allows revoking an existing invite code', async () => {
      const invite = campusService.createInviteCodeForTesting({
        campusId: pilotCampusId,
        code: 'TO-BE-REVOKED-2026',
      });

      const res = await request
        .post('/api/campuses/admin/invites/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          inviteId: invite.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

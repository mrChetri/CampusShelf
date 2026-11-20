import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { UserProfileSchema } from '@campusshelf/contracts';

describe('GET /api/me (Backend Auth Seam)', () => {
  it('returns 401 Unauthorized when Authorization header is missing', async () => {
    const app = createApp();
    const response = await request(app).get('/api/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/authorization/i);
  });

  it('returns 401 Unauthorized when Bearer token is malformed', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer invalid-token-string');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('returns 200 OK and bootstraps user profile with REGISTERED role when token is valid', async () => {
    const app = createApp();
    // Test token format encoding user payload: test-token:<uuid>:<email>:<name>
    const testUserId = '11111111-2222-3333-4444-555555555555';
    const testToken = `test-token:${testUserId}:student.test@darrang.edu:Aarav Sharma`;

    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);

    const parseResult = UserProfileSchema.safeParse(response.body);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.id).toBe(testUserId);
      expect(parseResult.data.email).toBe('student.test@darrang.edu');
      expect(parseResult.data.fullName).toBe('Aarav Sharma');
      expect(parseResult.data.role).toBe('REGISTERED');
    }
  });

  it('is accessible via /me alias as well', async () => {
    const app = createApp();
    const testUserId = '22222222-3333-4444-5555-666666666666';
    const testToken = `test-token:${testUserId}:priya.patel@darrang.edu:Priya Patel`;

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('priya.patel@darrang.edu');
  });
});

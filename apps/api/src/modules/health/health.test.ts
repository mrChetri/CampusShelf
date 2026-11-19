import { describe, it, expect } from 'vitest';
import { createTestClient } from '../../test-utils/test-client';
import { createApp } from '../../app';
import { HealthResponseSchema } from '@campusshelf/contracts';

describe('GET /health (HTTP Seam)', () => {
  it('should return 200 OK and valid health payload adhering to contracts', async () => {
    const app = createApp();
    const response = await createTestClient(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);

    const parseResult = HealthResponseSchema.safeParse(response.body);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.status).toBe('ok');
      expect(typeof parseResult.data.uptime).toBe('number');
      expect(typeof parseResult.data.timestamp).toBe('string');
      expect(typeof parseResult.data.environment).toBe('string');
    }
  });

  it('should return 200 OK on /api/health as well', async () => {
    const app = createApp();
    const response = await createTestClient(app).get('/api/health');

    expect(response.status).toBe(200);
    const parseResult = HealthResponseSchema.safeParse(response.body);
    expect(parseResult.success).toBe(true);
  });
});

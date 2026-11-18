import { describe, it, expect } from 'vitest';
import { HealthResponseSchema } from './health.contract';

describe('HealthResponseSchema', () => {
  it('should validate a correct health response payload', () => {
    const validPayload = {
      status: 'ok',
      timestamp: '2026-11-17T18:00:00.000Z',
      uptime: 12.34,
      environment: 'test',
    };

    const result = HealthResponseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ok');
      expect(result.data.environment).toBe('test');
    }
  });

  it('should reject a payload with missing required fields', () => {
    const invalidPayload = {
      status: 'ok',
    };

    const result = HealthResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should reject a status other than "ok"', () => {
    const invalidPayload = {
      status: 'down',
      timestamp: '2026-11-17T18:00:00.000Z',
      uptime: 12.34,
      environment: 'test',
    };

    const result = HealthResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

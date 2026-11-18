import { HealthResponse } from './health.schema';
import { env } from '../../config/env';

export class HealthService {
  public getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime() * 100) / 100,
      environment: env.NODE_ENV,
    };
  }
}

export const healthService = new HealthService();

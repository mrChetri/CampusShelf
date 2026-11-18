import { Request, Response } from 'express';
import { healthService } from './health.service';

export class HealthController {
  public getHealth = (_req: Request, res: Response): void => {
    const health = healthService.getHealth();
    res.status(200).json(health);
  };
}

export const healthController = new HealthController();

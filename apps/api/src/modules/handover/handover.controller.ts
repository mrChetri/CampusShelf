import { Request, Response } from 'express';
import { handoverService } from './handover.service';
import { DisputeHandoverInputSchema } from './handover.schema';

export class HandoverController {
  public async getHandover(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id } = req.params;

    try {
      const handover = handoverService.getHandoverById(id, authUser.id);
      res.status(200).json({ handover });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to fetch handover' });
    }
  }

  public async getHandoverByListing(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { listingId } = req.params;

    try {
      const handover = handoverService.getHandoverByListingId(listingId, authUser.id);
      if (!handover) {
        res.status(404).json({ error: 'Handover not found for this listing' });
        return;
      }
      res.status(200).json({ handover });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to fetch handover' });
    }
  }

  public async getHandoverByRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { requestId } = req.params;

    try {
      const handover = handoverService.getHandoverByRequestId(requestId, authUser.id);
      if (!handover) {
        res.status(404).json({ error: 'Handover not found for this request' });
        return;
      }
      res.status(200).json({ handover });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to fetch handover' });
    }
  }

  public async completeHandover(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id } = req.params;

    try {
      const result = handoverService.completeHandover(id, authUser.id);
      res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to complete handover' });
    }
  }

  public async disputeHandover(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id } = req.params;

    const parseResult = DisputeHandoverInputSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const result = handoverService.disputeHandover(id, authUser.id, parseResult.data);
      res.status(200).json(result);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to dispute handover' });
    }
  }

  public async expireReservations(_req: Request, res: Response): Promise<void> {
    try {
      const result = handoverService.revertExpiredReservations();
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to expire reservations' });
    }
  }
}

export const handoverController = new HandoverController();

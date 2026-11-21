import { Request, Response } from 'express';
import { requestService } from './request.service';
import { userService } from '../user/user.service';
import { CreateBookRequestInputSchema } from './request.schema';

export class RequestController {
  public async createListingRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: listingId } = req.params;
    const profile = userService.getProfileById(authUser.id) ?? userService.getOrCreateProfile(authUser);

    const parseResult = CreateBookRequestInputSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const bookRequest = requestService.createRequest(listingId, profile, parseResult.data);
      res.status(201).json({ request: bookRequest });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to submit book request' });
    }
  }

  public async getMyRequests(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    try {
      const requests = requestService.getMyRequests(authUser.id);
      res.status(200).json({ requests });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch your requests' });
    }
  }

  public async cancelRequest(req: Request, res: Response): Promise<void> {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: 'Unauthorized: missing authentication session' });
      return;
    }

    const { id: requestId } = req.params;

    try {
      const cancelledRequest = requestService.cancelRequest(requestId, authUser.id);
      res.status(200).json({
        success: true,
        message: 'Request cancelled successfully',
        request: cancelledRequest,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Failed to cancel request' });
    }
  }
}

export const requestController = new RequestController();

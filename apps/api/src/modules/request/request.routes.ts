import { Router } from 'express';
import { requestController } from './request.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router: Router = Router();

// GET /api/requests/mine - View logged-in student's requests
router.get('/mine', authMiddleware, (req, res) => {
  requestController.getMyRequests(req, res);
});

// PATCH /api/requests/:id/cancel - Cancel own pending request
router.patch('/:id/cancel', authMiddleware, (req, res) => {
  requestController.cancelRequest(req, res);
});

export const requestRoutes = router;

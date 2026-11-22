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

// POST /api/requests/:id/accept - Accept request and establish 72h reservation (CS-007)
router.post('/:id/accept', authMiddleware, (req, res) => {
  requestController.acceptRequest(req, res);
});

// POST /api/requests/:id/decline - Decline request (CS-007)
router.post('/:id/decline', authMiddleware, (req, res) => {
  requestController.declineRequest(req, res);
});

export const requestRoutes = router;

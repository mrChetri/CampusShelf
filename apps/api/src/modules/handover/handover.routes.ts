import { Router } from 'express';
import { handoverController } from './handover.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router: Router = Router();

// GET /api/handovers/by-listing/:listingId - Find handover by listing ID
router.get('/by-listing/:listingId', authMiddleware, (req, res) => {
  handoverController.getHandoverByListing(req, res);
});

// GET /api/handovers/by-request/:requestId - Find handover by request ID
router.get('/by-request/:requestId', authMiddleware, (req, res) => {
  handoverController.getHandoverByRequest(req, res);
});

// POST /api/handovers/expire-check & /expire-reservations - Check & revert expired reservations (cron/maintenance)
router.post('/expire-check', authMiddleware, (req, res) => {
  handoverController.expireReservations(req, res);
});
router.post('/expire-reservations', authMiddleware, (req, res) => {
  handoverController.expireReservations(req, res);
});

// GET /api/handovers/:id - View handover details (donor or recipient only)
router.get('/:id', authMiddleware, (req, res) => {
  handoverController.getHandover(req, res);
});

// POST /api/handovers/:id/complete - Single-sided donor completion (ADR-0001)
router.post('/:id/complete', authMiddleware, (req, res) => {
  handoverController.completeHandover(req, res);
});

// POST /api/handovers/:id/dispute - Recipient dispute report (ADR-0001)
router.post('/:id/dispute', authMiddleware, (req, res) => {
  handoverController.disputeHandover(req, res);
});

export const handoverRoutes = router;

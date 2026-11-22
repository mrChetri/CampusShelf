import { Request, Response } from 'express';
import {
  CreateExchangeProposalInputSchema,
} from './exchange.schema';
import { exchangeService } from './exchange.service';

export function createProposalHandler(req: Request, res: Response): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const parseResult = CreateExchangeProposalInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid exchange proposal input' });
    return;
  }

  try {
    const proposal = exchangeService.createProposal(user.id, parseResult.data);
    res.status(201).json({ proposal });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to create exchange proposal' });
  }
}

export function getMyProposalsHandler(req: Request, res: Response): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { incoming, outgoing } = exchangeService.getProposalsForUser(user.id);
    res.json({ incoming, outgoing });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch exchange proposals' });
  }
}

export function acceptProposalHandler(req: Request, res: Response): void {
  const user = req.user;
  const { id } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const proposal = exchangeService.acceptProposal(user.id, id);
    res.json({ proposal });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to accept exchange proposal' });
  }
}

export function declineProposalHandler(req: Request, res: Response): void {
  const user = req.user;
  const { id } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const proposal = exchangeService.declineProposal(user.id, id);
    res.json({ proposal });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to decline exchange proposal' });
  }
}

export function completeExchangeHandler(req: Request, res: Response): void {
  const user = req.user;
  const { id } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const proposal = exchangeService.completeExchange(user.id, id);
    res.json({ proposal });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to complete exchange' });
  }
}

export function cancelProposalHandler(req: Request, res: Response): void {
  const user = req.user;
  const { id } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const proposal = exchangeService.cancelProposal(user.id, id);
    res.json({ proposal });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Failed to cancel exchange proposal' });
  }
}

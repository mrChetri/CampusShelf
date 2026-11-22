import { randomUUID } from 'node:crypto';
import type {
  ExchangeProposal,
  CreateExchangeProposalInput,
} from './exchange.schema';
import { listingService } from '../listing/listing.service';
import { userService } from '../user/user.service';

export class ExchangeService {
  private proposals: Map<string, ExchangeProposal> = new Map();

  public resetForTesting(): void {
    this.proposals.clear();
  }

  public createProposal(userId: string, input: CreateExchangeProposalInput): ExchangeProposal {
    const user = userService.getProfileById(userId);
    if (!user || user.role === 'REGISTERED') {
      const err: any = new Error('You must join a campus before proposing a textbook exchange.');
      err.statusCode = 403;
      throw err;
    }

    if (user.status === 'SUSPENDED') {
      const err: any = new Error('Your account is currently suspended from creating exchange proposals.');
      err.statusCode = 403;
      throw err;
    }

    // Verify offered listing
    const offeredListing = listingService.getListingById(input.offeredListingId);
    if (!offeredListing) {
      const err: any = new Error('Offered listing not found.');
      err.statusCode = 404;
      throw err;
    }

    if (offeredListing.donorId !== userId) {
      const err: any = new Error('You can only offer a textbook that you have listed.');
      err.statusCode = 403;
      throw err;
    }

    if (offeredListing.status !== 'AVAILABLE') {
      const err: any = new Error('Your offered book is no longer available for exchange.');
      err.statusCode = 409;
      throw err;
    }

    // Verify target listing
    const targetListing = listingService.getListingById(input.targetListingId);
    if (!targetListing) {
      const err: any = new Error('Target listing not found.');
      err.statusCode = 404;
      throw err;
    }

    if (targetListing.donorId === userId) {
      const err: any = new Error('You cannot propose an exchange with your own book.');
      err.statusCode = 400;
      throw err;
    }

    if (targetListing.status !== 'AVAILABLE') {
      const err: any = new Error('Target book is currently unavailable or reserved.');
      err.statusCode = 409;
      throw err;
    }

    // Campus scope check (same institution)
    if (offeredListing.campusId !== targetListing.campusId) {
      const err: any = new Error('Both textbooks must be within the same campus community for safe in-person exchange.');
      err.statusCode = 400;
      throw err;
    }

    const targetOwner = userService.getProfileById(targetListing.donorId);
    const targetOwnerName = targetOwner ? targetOwner.fullName : targetListing.donorName;

    const now = new Date().toISOString();
    const proposal: ExchangeProposal = {
      id: randomUUID(),
      proposerId: userId,
      proposerName: user.fullName,
      targetOwnerId: targetListing.donorId,
      targetOwnerName,
      targetListingId: targetListing.id,
      targetListingTitle: targetListing.title,
      targetListingPhoto: targetListing.photos?.[0] || null,
      offeredListingId: offeredListing.id,
      offeredListingTitle: offeredListing.title,
      offeredListingPhoto: offeredListing.photos?.[0] || null,
      pickupLocation: targetListing.pickupLocation,
      message: input.message?.trim() || null,
      status: 'PENDING',
      reservedUntil: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  public getProposalsForUser(userId: string): {
    incoming: ExchangeProposal[];
    outgoing: ExchangeProposal[];
  } {
    const all = Array.from(this.proposals.values());
    const incoming = all
      .filter((p) => p.targetOwnerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const outgoing = all
      .filter((p) => p.proposerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { incoming, outgoing };
  }

  public getProposalById(id: string): ExchangeProposal | null {
    return this.proposals.get(id) || null;
  }

  public acceptProposal(userId: string, proposalId: string): ExchangeProposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      const err: any = new Error('Exchange proposal not found.');
      err.statusCode = 404;
      throw err;
    }

    if (proposal.targetOwnerId !== userId) {
      const err: any = new Error('Only the owner of the requested book can accept an exchange proposal.');
      err.statusCode = 403;
      throw err;
    }

    if (proposal.status !== 'PENDING') {
      const err: any = new Error(`Cannot accept proposal with status: ${proposal.status}`);
      err.statusCode = 409;
      throw err;
    }

    const reservedUntil = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    // Reserve both listings
    listingService.reserveListing(proposal.targetListingId, reservedUntil);
    listingService.reserveListing(proposal.offeredListingId, reservedUntil);

    proposal.status = 'ACCEPTED';
    proposal.reservedUntil = reservedUntil;
    proposal.updatedAt = new Date().toISOString();

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  public declineProposal(userId: string, proposalId: string): ExchangeProposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      const err: any = new Error('Exchange proposal not found.');
      err.statusCode = 404;
      throw err;
    }

    if (proposal.targetOwnerId !== userId) {
      const err: any = new Error('Only the target book owner can decline this proposal.');
      err.statusCode = 403;
      throw err;
    }

    if (proposal.status !== 'PENDING') {
      const err: any = new Error(`Cannot decline proposal with status: ${proposal.status}`);
      err.statusCode = 409;
      throw err;
    }

    proposal.status = 'DECLINED';
    proposal.updatedAt = new Date().toISOString();

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  public completeExchange(userId: string, proposalId: string): ExchangeProposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      const err: any = new Error('Exchange proposal not found.');
      err.statusCode = 404;
      throw err;
    }

    if (proposal.targetOwnerId !== userId && proposal.proposerId !== userId) {
      const err: any = new Error('Only participating exchange students can confirm the two-way handover.');
      err.statusCode = 403;
      throw err;
    }

    if (proposal.status !== 'ACCEPTED') {
      const err: any = new Error('Cannot complete exchange before proposal is accepted.');
      err.statusCode = 409;
      throw err;
    }

    const now = new Date().toISOString();

    // Mark both listings completed as EXCHANGED
    listingService.completeListingAsExchanged(proposal.targetListingId);
    listingService.completeListingAsExchanged(proposal.offeredListingId);

    proposal.status = 'COMPLETED';
    proposal.completedAt = now;
    proposal.updatedAt = now;

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  public cancelProposal(userId: string, proposalId: string): ExchangeProposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      const err: any = new Error('Exchange proposal not found.');
      err.statusCode = 404;
      throw err;
    }

    if (proposal.proposerId !== userId) {
      const err: any = new Error('Only the proposer can cancel this exchange proposal.');
      err.statusCode = 403;
      throw err;
    }

    if (proposal.status !== 'PENDING') {
      const err: any = new Error(`Cannot cancel proposal with status: ${proposal.status}`);
      err.statusCode = 409;
      throw err;
    }

    proposal.status = 'CANCELLED';
    proposal.updatedAt = new Date().toISOString();

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }
}

export const exchangeService = new ExchangeService();

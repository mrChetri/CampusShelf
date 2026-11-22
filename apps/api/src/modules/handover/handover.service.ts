import { randomUUID } from 'node:crypto';
import type { Handover, DisputeHandoverInput } from './handover.schema';
import { listingService } from '../listing/listing.service';
import { requestService } from '../request/request.service';
import { notificationService } from '../notification/notification.service';

export interface CreateHandoverParams {
  listingId: string;
  listingTitle: string;
  listingAuthor: string;
  requestId: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  pickupLocation: string;
  scheduleNotes?: string | null;
  reservedUntil: string;
}

export class HandoverService {
  private handovers: Handover[] = [];

  public createHandover(params: CreateHandoverParams): Handover {
    const now = new Date().toISOString();
    const handover: Handover = {
      id: randomUUID(),
      listingId: params.listingId,
      listingTitle: params.listingTitle,
      listingAuthor: params.listingAuthor,
      requestId: params.requestId,
      donorId: params.donorId,
      donorName: params.donorName,
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      pickupLocation: params.pickupLocation,
      scheduleNotes: params.scheduleNotes || null,
      status: 'SCHEDULED',
      reservedUntil: params.reservedUntil,
      completedAt: null,
      disputedAt: null,
      disputeReason: null,
      disputeDetails: null,
      createdAt: now,
      updatedAt: now,
    };

    this.handovers.unshift(handover);
    return handover;
  }

  public getHandoverById(handoverId: string, userId: string): Handover {
    const handover = this.handovers.find((h) => h.id === handoverId);
    if (!handover) {
      const err = new Error('Handover not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (handover.donorId !== userId && handover.recipientId !== userId) {
      const err = new Error('Forbidden: you are not authorized to view this handover');
      (err as any).statusCode = 403;
      throw err;
    }

    return handover;
  }

  public getHandoverByRequestId(requestId: string, userId: string): Handover | null {
    const handover = this.handovers.find((h) => h.requestId === requestId);
    if (!handover) return null;

    if (handover.donorId !== userId && handover.recipientId !== userId) {
      const err = new Error('Forbidden: you are not authorized to view this handover');
      (err as any).statusCode = 403;
      throw err;
    }

    return handover;
  }

  public getHandoverByListingId(listingId: string, userId: string): Handover | null {
    const handover = this.handovers.find(
      (h) => h.listingId === listingId && (h.status === 'SCHEDULED' || h.status === 'COMPLETED' || h.status === 'DISPUTED')
    );
    if (!handover) return null;

    if (handover.donorId !== userId && handover.recipientId !== userId) {
      const err = new Error('Forbidden: you are not authorized to view this handover');
      (err as any).statusCode = 403;
      throw err;
    }

    return handover;
  }

  public completeHandover(
    handoverId: string,
    donorId: string
  ): { success: boolean; message: string; handover: Handover } {
    const handover = this.handovers.find((h) => h.id === handoverId);
    if (!handover) {
      const err = new Error('Handover not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (handover.donorId !== donorId) {
      const err = new Error('Forbidden: only the donor can mark a handover as completed');
      (err as any).statusCode = 403;
      throw err;
    }

    if (handover.status !== 'SCHEDULED') {
      const err = new Error('Only scheduled handovers can be marked as completed');
      (err as any).statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    handover.status = 'COMPLETED';
    handover.completedAt = now;
    handover.updatedAt = now;

    // Atomically transition listing and request to COMPLETED/DONATED
    listingService.completeListing(handover.listingId);
    requestService.completeRequest(handover.requestId);

    // Notify recipient that the handover is confirmed
    notificationService.createNotification({
      userId: handover.recipientId,
      type: 'HANDOVER_COMPLETED',
      title: 'Handover completed! 📚',
      body: `Your handover for "${handover.listingTitle}" has been confirmed by the donor. Enjoy the book!`,
      entityId: handover.id,
    });

    return {
      success: true,
      message: 'Handover marked as completed. Thank you for donating!',
      handover,
    };
  }

  public disputeHandover(
    handoverId: string,
    recipientId: string,
    input: DisputeHandoverInput
  ): { success: boolean; message: string; handover: Handover } {
    const handover = this.handovers.find((h) => h.id === handoverId);
    if (!handover) {
      const err = new Error('Handover not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (handover.recipientId !== recipientId) {
      const err = new Error('Forbidden: only the recipient can report a problem on this handover');
      (err as any).statusCode = 403;
      throw err;
    }

    if (handover.status !== 'SCHEDULED' && handover.status !== 'COMPLETED') {
      const err = new Error('Handover cannot be disputed in its current status');
      (err as any).statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    handover.status = 'DISPUTED';
    handover.disputeReason = input.reason.trim();
    handover.disputeDetails = input.details ? input.details.trim() : null;
    handover.disputedAt = now;
    handover.updatedAt = now;

    // Atomically transition associated request to DISPUTED
    requestService.disputeRequest(handover.requestId);

    // Notify donor that a dispute was raised
    notificationService.createNotification({
      userId: handover.donorId,
      type: 'HANDOVER_DISPUTED',
      title: 'A problem was reported on your handover',
      body: `${handover.recipientName} has reported a problem with the handover of "${handover.listingTitle}". Reason: ${input.reason.trim()}`,
      entityId: handover.id,
    });

    return {
      success: true,
      message: 'Problem reported. Our campus moderation team has been notified.',
      handover,
    };
  }

  public revertExpiredReservations(): { revertedCount: number } {
    const now = new Date();
    let revertedCount = 0;

    for (const handover of this.handovers) {
      if (handover.status === 'SCHEDULED' && new Date(handover.reservedUntil) < now) {
        handover.status = 'EXPIRED';
        handover.updatedAt = now.toISOString();

        // Revert listing to AVAILABLE
        listingService.revertListingToAvailable(handover.listingId);

        // Revert request to CANCELLED
        requestService.expireRequest(handover.requestId);

        // Notify requester that their reservation expired
        notificationService.createNotification({
          userId: handover.recipientId,
          type: 'RESERVATION_EXPIRED',
          title: 'Your reservation has expired',
          body: `Your reservation for "${handover.listingTitle}" has expired. The book is now available for others to request.`,
          entityId: handover.id,
        });

        revertedCount++;
      }
    }

    return { revertedCount };
  }

  public resetForTesting(): void {
    this.handovers = [];
  }
}

export const handoverService = new HandoverService();

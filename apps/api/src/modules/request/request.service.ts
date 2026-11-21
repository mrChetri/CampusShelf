import { randomUUID } from 'node:crypto';
import type { BookRequest, CreateBookRequestInput } from './request.schema';
import { listingService } from '../listing/listing.service';
import { campusService } from '../campus/campus.service';

export class RequestService {
  private requests: BookRequest[] = [];

  public createRequest(
    listingId: string,
    requester: { id: string; fullName: string; role: string; campusId?: string | null },
    input: CreateBookRequestInput
  ): BookRequest {
    if (requester.role !== 'CAMPUS_MEMBER') {
      const err = new Error('Forbidden: only Campus Members can request books. Please join your campus first.');
      (err as any).statusCode = 403;
      throw err;
    }

    const listing = listingService.getListingById(listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (listing.donorId === requester.id) {
      const err = new Error('Cannot request your own listing');
      (err as any).statusCode = 400;
      throw err;
    }

    if (listing.status !== 'AVAILABLE') {
      const err = new Error('Listing is not available for request');
      (err as any).statusCode = 400;
      throw err;
    }

    const existingPending = this.requests.find(
      (r) => r.listingId === listingId && r.requesterId === requester.id && r.status === 'PENDING'
    );

    if (existingPending) {
      const err = new Error('You already have an active request for this book');
      (err as any).statusCode = 409;
      throw err;
    }

    const campus = campusService.getCampusById(listing.campusId);
    const campusName = campus?.name || listing.campusName || 'Campus';

    const now = new Date().toISOString();
    const newRequest: BookRequest = {
      id: randomUUID(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingAuthor: listing.author,
      listingPhoto: listing.photos && listing.photos.length > 0 ? listing.photos[0] : null,
      pickupLocation: listing.pickupLocation,
      campusName,
      donorId: listing.donorId,
      donorName: listing.donorName,
      requesterId: requester.id,
      requesterName: requester.fullName,
      status: 'PENDING',
      message: input.message ? input.message.trim() : null,
      createdAt: now,
      updatedAt: now,
    };

    this.requests.unshift(newRequest);
    return newRequest;
  }

  public getMyRequests(requesterId: string): BookRequest[] {
    return this.requests
      .filter((r) => r.requesterId === requesterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public cancelRequest(requestId: string, requesterId: string): BookRequest {
    const request = this.requests.find((r) => r.id === requestId);
    if (!request) {
      const err = new Error('Request not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (request.requesterId !== requesterId) {
      const err = new Error('Forbidden: you cannot cancel a request you did not make');
      (err as any).statusCode = 403;
      throw err;
    }

    if (request.status !== 'PENDING') {
      const err = new Error('Only pending requests can be cancelled');
      (err as any).statusCode = 400;
      throw err;
    }

    request.status = 'CANCELLED';
    request.updatedAt = new Date().toISOString();
    return request;
  }

  public resetForTesting(): void {
    this.requests = [];
  }
}

export const requestService = new RequestService();

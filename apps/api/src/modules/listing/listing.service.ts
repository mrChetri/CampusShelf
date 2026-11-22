import crypto from 'node:crypto';
import { CreateListingInput, Listing, ListingsQuery, ListingsFeedResponse } from './listing.schema';
import { UserProfile } from '../user/user.schema';
import { campusService } from '../campus/campus.service';

export class ListingService {
  private listings: Map<string, Listing> = new Map();

  public resetForTesting(): void {
    this.listings.clear();
  }

  public createListing(donor: UserProfile, input: CreateListingInput): Listing {
    if (!donor.campusId) {
      throw new Error('Campus affiliation required to publish listings');
    }

    const campus = campusService.getCampusById(donor.campusId);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const newListing: Listing = {
      id,
      donorId: donor.id,
      donorName: donor.fullName,
      campusId: donor.campusId,
      campusName: campus?.name ?? 'Pilot Campus',
      title: input.title,
      author: input.author,
      isbn: input.isbn ?? null,
      edition: input.edition ?? null,
      course: input.course ?? null,
      subject: input.subject,
      semester: input.semester ?? null,
      condition: input.condition,
      pickupLocation: input.pickupLocation,
      photos: input.photos,
      description: input.description ?? null,
      status: 'AVAILABLE',
      type: 'DONATION',
      createdAt: now,
      updatedAt: now,
    };

    this.listings.set(id, newListing);
    return newListing;
  }

  public getListingsFeed(query: ListingsQuery): ListingsFeedResponse {
    let items = Array.from(this.listings.values());

    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          (item.isbn && item.isbn.toLowerCase().includes(q)) ||
          item.subject.toLowerCase().includes(q)
      );
    }

    if (query.campusId) {
      items = items.filter((item) => item.campusId === query.campusId);
    }

    if (query.condition) {
      items = items.filter((item) => item.condition === query.condition);
    }

    if (query.course) {
      const c = query.course.toLowerCase();
      items = items.filter((item) => item.course && item.course.toLowerCase().includes(c));
    }

    if (query.semester) {
      const s = query.semester.toLowerCase();
      items = items.filter((item) => item.semester && item.semester.toLowerCase().includes(s));
    }

    if (query.type) {
      items = items.filter((item) => item.type === query.type);
    }

    // CS-005 ranking:
    // 1. Available first
    // 2. Free donations prioritized over sales
    // 3. Newest first
    items.sort((a, b) => {
      const aAvailable = a.status === 'AVAILABLE' ? 1 : 0;
      const bAvailable = b.status === 'AVAILABLE' ? 1 : 0;
      if (aAvailable !== bAvailable) return bAvailable - aAvailable;

      const aDonation = a.type === 'DONATION' ? 1 : 0;
      const bDonation = b.type === 'DONATION' ? 1 : 0;
      if (aDonation !== bDonation) return bDonation - aDonation;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = items.length;
    const page = query.page || 1;
    const limit = query.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginated = items.slice(startIndex, startIndex + limit);
    const hasMore = total > page * limit;

    return {
      listings: paginated,
      total,
      page,
      limit,
      hasMore,
    };
  }

  public getMyListings(donorId: string): Listing[] {
    return Array.from(this.listings.values()).filter(
      (listing) => listing.donorId === donorId
    );
  }

  public getListingById(id: string): Listing | null {
    return this.listings.get(id) ?? null;
  }

  public withdrawListing(userId: string, listingId: string): Listing {
    const listing = this.listings.get(listingId);
    if (!listing) {
      const err: any = new Error('Listing not found');
      err.statusCode = 404;
      throw err;
    }

    if (listing.donorId !== userId) {
      const err: any = new Error('You do not own this listing');
      err.statusCode = 403;
      throw err;
    }

    const updated: Listing = {
      ...listing,
      status: 'WITHDRAWN',
      updatedAt: new Date().toISOString(),
    };

    this.listings.set(listingId, updated);
    return updated;
  }

  public reserveListing(listingId: string, reservedUntil: string): Listing {
    const listing = this.listings.get(listingId);
    if (!listing) {
      const err: any = new Error('Listing not found');
      err.statusCode = 404;
      throw err;
    }

    if (listing.status !== 'AVAILABLE') {
      const err: any = new Error('Listing is already reserved or unavailable');
      err.statusCode = 409;
      throw err;
    }

    const updated: Listing = {
      ...listing,
      status: 'RESERVED',
      reservedUntil,
      updatedAt: new Date().toISOString(),
    };

    this.listings.set(listingId, updated);
    return updated;
  }

  public completeListing(listingId: string): Listing {
    const listing = this.listings.get(listingId);
    if (!listing) {
      const err: any = new Error('Listing not found');
      err.statusCode = 404;
      throw err;
    }

    const updated: Listing = {
      ...listing,
      status: 'DONATED',
      updatedAt: new Date().toISOString(),
    };

    this.listings.set(listingId, updated);
    return updated;
  }

  public revertListingToAvailable(listingId: string): Listing {
    const listing = this.listings.get(listingId);
    if (!listing) {
      const err: any = new Error('Listing not found');
      err.statusCode = 404;
      throw err;
    }

    const updated: Listing = {
      ...listing,
      status: 'AVAILABLE',
      reservedUntil: null,
      updatedAt: new Date().toISOString(),
    };

    this.listings.set(listingId, updated);
    return updated;
  }
}

export const listingService = new ListingService();

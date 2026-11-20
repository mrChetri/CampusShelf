import crypto from 'node:crypto';
import { CreateListingInput, Listing } from './listing.schema';
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
}

export const listingService = new ListingService();

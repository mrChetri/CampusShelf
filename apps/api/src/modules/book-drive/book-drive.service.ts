import type { BookDriveSummary } from './book-drive.schema';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { userService } from '../user/user.service';

export class BookDriveService {
  public getDriveByCampusSlug(slug: string, host = 'https://campusshelf.org'): BookDriveSummary | null {
    const campus = campusService.getCampusBySlug(slug) || campusService.getCampusById(slug);
    if (!campus) {
      return null;
    }

    // Retrieve listings feed for this campus
    const feed = listingService.getListingsFeed({ campusId: campus.id, limit: 10000 });
    const campusListings = feed.listings;

    const totalBooksDonated = campusListings.filter((l) => l.status === 'DONATED').length;
    const totalBooksListed = campusListings.length;

    // Distinct contributors (donors + recipients from completed handovers)
    const contributorIds = new Set<string>();
    for (const listing of campusListings) {
      if (listing.donorId) {
        contributorIds.add(listing.donorId);
      }
    }

    // Also include verified campus members
    const allProfiles = userService.getAllProfiles();
    for (const profile of allProfiles) {
      if (profile.campusId === campus.id && profile.role === 'CAMPUS_MEMBER') {
        contributorIds.add(profile.id);
      }
    }

    const activeContributorsCount = Math.max(contributorIds.size, totalBooksDonated > 0 ? 1 : 0);

    // Compute top academic categories / subjects
    const categoryCounts: Record<string, number> = {};
    for (const listing of campusListings) {
      const subject = listing.subject?.trim();
      if (subject) {
        categoryCounts[subject] = (categoryCounts[subject] || 0) + 1;
      }
    }

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const shareUrl = `${host.replace(/\/$/, '')}/drives/${campus.slug}`;
    const shareText = `📚 Join the ${campus.name} Semester Book Drive on CampusShelf! Over ${totalBooksDonated} textbooks donated & circulated between verified students. Explore or donate: ${shareUrl}`;

    return {
      campusId: campus.id,
      campusName: campus.name,
      campusSlug: campus.slug,
      driveTitle: `${campus.name} Semester Book Drive`,
      academicYear: '2025-2026',
      totalBooksDonated,
      totalBooksListed,
      activeContributorsCount,
      topCategories,
      shareUrl,
      shareText,
    };
  }
}

export const bookDriveService = new BookDriveService();

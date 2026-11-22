import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';

const app = createApp();

describe('Book Drive API (CS-015 Semester Book Drive + Share Links)', () => {
  beforeEach(() => {
    campusService.resetForTesting();
    listingService.resetForTesting();
  });

  it('GET /api/drives/darrang-college returns public book drive aggregation without authentication', async () => {
    const res = await request(app).get('/api/drives/darrang-college');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('drive');

    const drive = res.body.drive;
    expect(drive.campusSlug).toBe('darrang-college');
    expect(drive.campusName).toBe('Darrang College');
    expect(drive.driveTitle).toContain('Darrang College Semester Book Drive');
    expect(drive.totalBooksDonated).toBeTypeOf('number');
    expect(drive.totalBooksListed).toBeTypeOf('number');
    expect(drive.activeContributorsCount).toBeTypeOf('number');
    expect(Array.isArray(drive.topCategories)).toBe(true);
    expect(drive.shareUrl).toContain('/drives/darrang-college');
    expect(drive.shareText).toContain('Darrang College');
  });

  it('aggregates books donated, books listed, active contributors, and top categories accurately', async () => {
    const pilotCampus = campusService.getCampusBySlug('darrang-college');
    expect(pilotCampus).not.toBeNull();

    // Create listings
    listingService.createListing({
      donorId: '550e8400-e29b-41d4-a716-446655440091',
      donorName: 'Student One',
      campusId: pilotCampus!.id,
      title: 'University Physics Volume 1',
      author: 'Young and Freedman',
      subject: 'Physics',
      condition: 'GOOD',
      pickupLocation: 'Central Library',
      photos: ['https://example.com/phys.jpg'],
      type: 'DONATION',
    });

    const listing2 = listingService.createListing({
      donorId: '550e8400-e29b-41d4-a716-446655440092',
      donorName: 'Student Two',
      campusId: pilotCampus!.id,
      title: 'Organic Chemistry Basics',
      author: 'Bruice',
      subject: 'Chemistry',
      condition: 'LIKE_NEW',
      pickupLocation: 'Chemistry Wing',
      photos: ['https://example.com/chem.jpg'],
      type: 'DONATION',
    });

    // Mark listing2 as donated
    listingService.completeListing(listing2.id);

    const res = await request(app).get('/api/drives/darrang-college');

    expect(res.status).toBe(200);
    const drive = res.body.drive;
    expect(drive.totalBooksListed).toBe(2);
    expect(drive.totalBooksDonated).toBe(1);
    expect(drive.activeContributorsCount).toBeGreaterThanOrEqual(2);

    const categoryNames = drive.topCategories.map((c: any) => c.category);
    expect(categoryNames).toContain('Physics');
    expect(categoryNames).toContain('Chemistry');
  });

  it('enforces privacy guardrail: zero student names, emails, phone numbers, or user IDs exposed in public drive', async () => {
    const pilotCampus = campusService.getCampusBySlug('darrang-college');

    listingService.createListing({
      donorId: '550e8400-e29b-41d4-a716-446655440099',
      donorName: 'Secret Student Name',
      campusId: pilotCampus!.id,
      title: 'Confidential Notebooks',
      author: 'Author',
      subject: 'History',
      condition: 'GOOD',
      pickupLocation: 'Library',
      photos: ['https://example.com/hist.jpg'],
      type: 'DONATION',
    });

    const res = await request(app).get('/api/drives/darrang-college');
    expect(res.status).toBe(200);

    const responseString = JSON.stringify(res.body);
    expect(responseString).not.toContain('Secret Student Name');
    expect(responseString).not.toContain('550e8400-e29b-41d4-a716-446655440099');
    expect(responseString).not.toContain('@');
    expect(responseString).not.toContain('+91');
  });

  it('returns 404 for unknown campus slug', async () => {
    const res = await request(app).get('/api/drives/non-existent-campus-slug-1234');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Campus book drive not found');
  });
});

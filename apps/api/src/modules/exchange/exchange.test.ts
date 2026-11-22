import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { campusService } from '../campus/campus.service';
import { listingService } from '../listing/listing.service';
import { userService } from '../user/user.service';
import { exchangeService } from './exchange.service';

const app = createApp();

const pilotCampusId = '550e8400-e29b-41d4-a716-446655440000';
const secondCampusId = '660e8400-e29b-41d4-a716-446655440000';

const userProposerId = '550e8400-e29b-41d4-a716-446655440001';
const userTargetOwnerId = '550e8400-e29b-41d4-a716-446655440002';
const userDifferentCampusId = '550e8400-e29b-41d4-a716-446655440003';

const proposerToken = `test-token:${userProposerId}:proposer@darrang.edu:Aarav Sharma`;
const targetOwnerToken = `test-token:${userTargetOwnerId}:target@darrang.edu:Priya Das`;
const differentCampusToken = `test-token:${userDifferentCampusId}:diff@tezu.edu:Ananya Roy`;

describe('Exchange API (CS-016 Book Exchange Offers)', () => {
  let targetListingId: string;
  let offeredListingId: string;
  let differentCampusListingId: string;

  beforeEach(() => {
    campusService.resetForTesting();
    listingService.resetForTesting();
    userService.resetForTesting();
    exchangeService.resetForTesting();

    // Setup campus members
    userService.createProfile({
      id: userProposerId,
      email: 'proposer@darrang.edu',
      fullName: 'Aarav Sharma',
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    userService.createProfile({
      id: userTargetOwnerId,
      email: 'target@darrang.edu',
      fullName: 'Priya Das',
      role: 'CAMPUS_MEMBER',
      campusId: pilotCampusId,
    });

    userService.createProfile({
      id: userDifferentCampusId,
      email: 'diff@tezu.edu',
      fullName: 'Ananya Roy',
      role: 'CAMPUS_MEMBER',
      campusId: secondCampusId,
    });

    // Create target listing by Priya
    const targetListing = listingService.createListing({
      donorId: userTargetOwnerId,
      donorName: 'Priya Das',
      campusId: pilotCampusId,
      title: 'University Physics',
      author: 'Young and Freedman',
      subject: 'Physics',
      condition: 'GOOD',
      pickupLocation: 'Central Library Entrance',
      photos: ['https://example.com/phys.jpg'],
      type: 'EXCHANGE',
      exchangePreferences: 'Looking for Organic Chemistry',
    });
    targetListingId = targetListing.id;

    // Create offered listing by Aarav
    const offeredListing = listingService.createListing({
      donorId: userProposerId,
      donorName: 'Aarav Sharma',
      campusId: pilotCampusId,
      title: 'Organic Chemistry',
      author: 'Paula Bruice',
      subject: 'Chemistry',
      condition: 'LIKE_NEW',
      pickupLocation: 'Central Library Entrance',
      photos: ['https://example.com/chem.jpg'],
      type: 'DONATION',
    });
    offeredListingId = offeredListing.id;

    // Create listing on different campus by Ananya
    const diffListing = listingService.createListing({
      donorId: userDifferentCampusId,
      donorName: 'Ananya Roy',
      campusId: secondCampusId,
      title: 'Algorithms',
      author: 'Cormen',
      subject: 'CS',
      condition: 'GOOD',
      pickupLocation: 'Tezpur Univ Foyer',
      photos: ['https://example.com/algo.jpg'],
      type: 'DONATION',
    });
    differentCampusListingId = diffListing.id;
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .send({
        targetListingId,
        offeredListingId,
      });

    expect(res.status).toBe(401);
  });

  it('rejects proposing exchange with book user does not own', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({
        targetListingId,
        offeredListingId: targetListingId, // trying to offer someone else's book
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('You can only offer a textbook that you have listed');
  });

  it('rejects exchange between listings on different campuses', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({
        targetListingId: differentCampusListingId,
        offeredListingId,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('same campus community');
  });

  it('successfully creates an exchange proposal with status PENDING', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({
        targetListingId,
        offeredListingId,
        message: 'Can meet at Central Library entrance after 2 PM tomorrow.',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('proposal');
    const proposal = res.body.proposal;
    expect(proposal.proposerId).toBe(userProposerId);
    expect(proposal.targetOwnerId).toBe(userTargetOwnerId);
    expect(proposal.targetListingTitle).toBe('University Physics');
    expect(proposal.offeredListingTitle).toBe('Organic Chemistry');
    expect(proposal.status).toBe('PENDING');
  });

  it('lists incoming and outgoing exchange proposals on GET /api/exchanges/mine', async () => {
    // Proposer creates proposal
    const createRes = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({ targetListingId, offeredListingId });

    expect(createRes.status).toBe(201);

    // Target owner checks incoming
    const targetRes = await request(app)
      .get('/api/exchanges/mine')
      .set('Authorization', `Bearer ${targetOwnerToken}`);

    expect(targetRes.status).toBe(200);
    expect(targetRes.body.incoming.length).toBe(1);
    expect(targetRes.body.outgoing.length).toBe(0);

    // Proposer checks outgoing
    const proposerRes = await request(app)
      .get('/api/exchanges/mine')
      .set('Authorization', `Bearer ${proposerToken}`);

    expect(proposerRes.status).toBe(200);
    expect(proposerRes.body.incoming.length).toBe(0);
    expect(proposerRes.body.outgoing.length).toBe(1);
  });

  it('accepts proposal and reserves both listings for 72 hours', async () => {
    const createRes = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({ targetListingId, offeredListingId });

    const proposalId = createRes.body.proposal.id;

    // Non-target owner cannot accept (403)
    const unauthorizedAccept = await request(app)
      .post(`/api/exchanges/${proposalId}/accept`)
      .set('Authorization', `Bearer ${proposerToken}`);
    expect(unauthorizedAccept.status).toBe(403);

    // Target owner accepts
    const acceptRes = await request(app)
      .post(`/api/exchanges/${proposalId}/accept`)
      .set('Authorization', `Bearer ${targetOwnerToken}`);

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.proposal.status).toBe('ACCEPTED');
    expect(acceptRes.body.proposal.reservedUntil).toBeDefined();

    // Verify both listings are now RESERVED
    const targetListing = listingService.getListingById(targetListingId);
    const offeredListing = listingService.getListingById(offeredListingId);
    expect(targetListing?.status).toBe('RESERVED');
    expect(offeredListing?.status).toBe('RESERVED');
  });

  it('completes two-way handover, marking both listings EXCHANGED and proposal COMPLETED', async () => {
    const createRes = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({ targetListingId, offeredListingId });

    const proposalId = createRes.body.proposal.id;

    // Target owner accepts
    await request(app)
      .post(`/api/exchanges/${proposalId}/accept`)
      .set('Authorization', `Bearer ${targetOwnerToken}`);

    // Proposer confirms completed handover
    const completeRes = await request(app)
      .post(`/api/exchanges/${proposalId}/complete`)
      .set('Authorization', `Bearer ${proposerToken}`);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.proposal.status).toBe('COMPLETED');
    expect(completeRes.body.proposal.completedAt).toBeDefined();

    // Verify both listings are marked EXCHANGED
    const targetListing = listingService.getListingById(targetListingId);
    const offeredListing = listingService.getListingById(offeredListingId);
    expect(targetListing?.status).toBe('EXCHANGED');
    expect(offeredListing?.status).toBe('EXCHANGED');
  });

  it('allows target owner to decline proposal', async () => {
    const createRes = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({ targetListingId, offeredListingId });

    const proposalId = createRes.body.proposal.id;

    const declineRes = await request(app)
      .post(`/api/exchanges/${proposalId}/decline`)
      .set('Authorization', `Bearer ${targetOwnerToken}`);

    expect(declineRes.status).toBe(200);
    expect(declineRes.body.proposal.status).toBe('DECLINED');

    // Both listings remain AVAILABLE
    const targetListing = listingService.getListingById(targetListingId);
    const offeredListing = listingService.getListingById(offeredListingId);
    expect(targetListing?.status).toBe('AVAILABLE');
    expect(offeredListing?.status).toBe('AVAILABLE');
  });

  it('allows proposer to cancel their pending exchange proposal', async () => {
    const createRes = await request(app)
      .post('/api/exchanges')
      .set('Authorization', `Bearer ${proposerToken}`)
      .send({ targetListingId, offeredListingId });

    const proposalId = createRes.body.proposal.id;

    const cancelRes = await request(app)
      .post(`/api/exchanges/${proposalId}/cancel`)
      .set('Authorization', `Bearer ${proposerToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.proposal.status).toBe('CANCELLED');
  });
});

import { describe, it, expect } from 'vitest';
import {
  RequestStatusEnum,
  CreateBookRequestInputSchema,
  BookRequestSchema,
  BookRequestResponseSchema,
  MyRequestsResponseSchema,
  CancelBookRequestResponseSchema,
} from './request.contract';

describe('Book Request Contracts (Seam 1)', () => {
  describe('RequestStatusEnum', () => {
    it('accepts valid request states: PENDING, ACCEPTED, DECLINED, CANCELLED, COMPLETED', () => {
      expect(RequestStatusEnum.parse('PENDING')).toBe('PENDING');
      expect(RequestStatusEnum.parse('ACCEPTED')).toBe('ACCEPTED');
      expect(RequestStatusEnum.parse('DECLINED')).toBe('DECLINED');
      expect(RequestStatusEnum.parse('CANCELLED')).toBe('CANCELLED');
      expect(RequestStatusEnum.parse('COMPLETED')).toBe('COMPLETED');
    });

    it('rejects invalid request states', () => {
      expect(() => RequestStatusEnum.parse('UNKNOWN')).toThrow();
      expect(() => RequestStatusEnum.parse('RESERVED')).toThrow();
    });
  });

  describe('CreateBookRequestInputSchema', () => {
    it('accepts an empty payload (message note is optional)', () => {
      const parsed = CreateBookRequestInputSchema.parse({});
      expect(parsed.message).toBeUndefined();
    });

    it('accepts a valid private message up to 500 characters', () => {
      const note = 'Hi! I am taking Thermodynamics this semester and would love to read this textbook.';
      const parsed = CreateBookRequestInputSchema.parse({ message: note });
      expect(parsed.message).toBe(note);
    });

    it('trims whitespace on message note', () => {
      const parsed = CreateBookRequestInputSchema.parse({ message: '  Please consider my request.  ' });
      expect(parsed.message).toBe('Please consider my request.');
    });

    it('rejects messages exceeding 500 characters', () => {
      const longMessage = 'A'.repeat(501);
      expect(() => CreateBookRequestInputSchema.parse({ message: longMessage })).toThrow();
    });
  });

  describe('BookRequestSchema', () => {
    const validRequest = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      listingId: '550e8400-e29b-41d4-a716-446655440002',
      listingTitle: 'University Physics with Modern Physics',
      listingAuthor: 'Young and Freedman',
      listingPhoto: 'https://example.com/photo.jpg',
      pickupLocation: 'Central Library Entrance',
      campusName: 'Darrang College',
      donorId: '550e8400-e29b-41d4-a716-446655440003',
      donorName: 'Rahul Kalita',
      requesterId: '550e8400-e29b-41d4-a716-446655440004',
      requesterName: 'Aarav Sharma',
      status: 'PENDING',
      message: 'Need this for my semester exams.',
      createdAt: '2026-11-20T10:00:00.000Z',
      updatedAt: '2026-11-20T10:00:00.000Z',
    };

    it('validates a complete BookRequest payload adhering to domain standards', () => {
      const parsed = BookRequestSchema.parse(validRequest);
      expect(parsed.id).toBe(validRequest.id);
      expect(parsed.status).toBe('PENDING');
      expect(parsed.listingTitle).toBe('University Physics with Modern Physics');
    });

    it('strictly requires valid UUIDs for request, listing, donor, and requester', () => {
      expect(() => BookRequestSchema.parse({ ...validRequest, listingId: 'invalid-id' })).toThrow();
      expect(() => BookRequestSchema.parse({ ...validRequest, requesterId: 'invalid-id' })).toThrow();
    });

    it('validates wrapped BookRequestResponseSchema', () => {
      const parsed = BookRequestResponseSchema.parse({ request: validRequest });
      expect(parsed.request.id).toBe(validRequest.id);
    });

    it('validates MyRequestsResponseSchema with an array of requests', () => {
      const parsed = MyRequestsResponseSchema.parse({ requests: [validRequest] });
      expect(parsed.requests).toHaveLength(1);
      expect(parsed.requests[0].id).toBe(validRequest.id);
    });

    it('validates CancelBookRequestResponseSchema', () => {
      const parsed = CancelBookRequestResponseSchema.parse({
        success: true,
        message: 'Request cancelled successfully',
        request: { ...validRequest, status: 'CANCELLED' },
      });
      expect(parsed.success).toBe(true);
      expect(parsed.request.status).toBe('CANCELLED');
    });
  });
});

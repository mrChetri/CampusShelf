import { describe, expect, it } from 'vitest';
import {
  CampusSchema,
  CampusesResponseSchema,
  RedeemInviteInputSchema,
  RedeemInviteResponseSchema,
  AdminCreateInviteInputSchema,
} from './campus.contract';

describe('Campus Contracts', () => {
  it('validates a valid Campus entity', () => {
    const validCampus = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Darrang College',
      slug: 'darrang-college',
      city: 'Tezpur',
      state: 'Assam',
      active: true,
    };

    const parsed = CampusSchema.parse(validCampus);
    expect(parsed.name).toBe('Darrang College');
    expect(parsed.slug).toBe('darrang-college');
  });

  it('rejects an invalid Campus entity with invalid UUID', () => {
    const invalidCampus = {
      id: 'invalid-id',
      name: 'Darrang College',
      slug: 'darrang-college',
      city: 'Tezpur',
      state: 'Assam',
      active: true,
    };

    expect(() => CampusSchema.parse(invalidCampus)).toThrow();
  });

  it('validates CampusesResponseSchema with multiple campuses', () => {
    const payload = {
      campuses: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Darrang College',
          slug: 'darrang-college',
          city: 'Tezpur',
          state: 'Assam',
          active: true,
        },
      ],
    };

    const parsed = CampusesResponseSchema.parse(payload);
    expect(parsed.campuses).toHaveLength(1);
  });

  it('validates RedeemInviteInputSchema and trims invite code', () => {
    const input = {
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      code: '  DARRANG-2026  ',
    };

    const parsed = RedeemInviteInputSchema.parse(input);
    expect(parsed.code).toBe('DARRANG-2026');
  });

  it('rejects short invite codes', () => {
    const input = {
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      code: 'abc',
    };

    expect(() => RedeemInviteInputSchema.parse(input)).toThrow();
  });

  it('validates RedeemInviteResponseSchema', () => {
    const response = {
      success: true,
      message: 'Successfully joined Darrang College as a Campus Member.',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'student@darrang.edu',
        fullName: 'Asha Sharma',
        avatarUrl: null,
        role: 'CAMPUS_MEMBER',
        campusId: '550e8400-e29b-41d4-a716-446655440000',
        campusName: 'Darrang College',
        createdAt: new Date().toISOString(),
      },
    };

    const parsed = RedeemInviteResponseSchema.parse(response);
    expect(parsed.user.role).toBe('CAMPUS_MEMBER');
    expect(parsed.user.campusName).toBe('Darrang College');
  });

  it('validates AdminCreateInviteInputSchema with defaults', () => {
    const input = {
      campusId: '550e8400-e29b-41d4-a716-446655440000',
      code: 'DARRANG-PILOT-2026',
    };

    const parsed = AdminCreateInviteInputSchema.parse(input);
    expect(parsed.maxUses).toBe(100);
  });
});

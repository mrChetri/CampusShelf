import { describe, it, expect } from 'vitest';
import { UserProfileSchema, UserRoleSchema } from './user.contract';

describe('UserProfileSchema (Contracts Seam)', () => {
  it('validates a valid user profile payload', () => {
    const validProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'student@example.edu',
      fullName: 'Jane Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: 'REGISTERED',
      createdAt: '2026-11-18T12:00:00.000Z',
    };

    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('REGISTERED');
      expect(result.data.email).toBe('student@example.edu');
    }
  });

  it('allows optional avatarUrl to be null or omitted', () => {
    const minimalProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'student@example.edu',
      fullName: 'Jane Doe',
      role: 'CAMPUS_MEMBER',
      createdAt: '2026-11-18T12:00:00.000Z',
    };

    const result = UserProfileSchema.safeParse(minimalProfile);
    expect(result.success).toBe(true);
  });

  it('rejects invalid roles outside the domain taxonomy', () => {
    const invalidProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'student@example.edu',
      fullName: 'Jane Doe',
      role: 'SUPERUSER',
      createdAt: '2026-11-18T12:00:00.000Z',
    };

    const result = UserProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});

describe('UserRoleSchema', () => {
  it('accepts REGISTERED, CAMPUS_MEMBER, MODERATOR, ADMIN', () => {
    expect(UserRoleSchema.safeParse('REGISTERED').success).toBe(true);
    expect(UserRoleSchema.safeParse('CAMPUS_MEMBER').success).toBe(true);
    expect(UserRoleSchema.safeParse('MODERATOR').success).toBe(true);
    expect(UserRoleSchema.safeParse('ADMIN').success).toBe(true);
    expect(UserRoleSchema.safeParse('GUEST').success).toBe(false);
  });
});

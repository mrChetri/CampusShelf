import { UserProfile } from './user.schema';
import { AuthenticatedUser } from '../../middleware/auth.middleware';

export class UserService {
  // In-memory persistent user profiles map keyed by user ID (matching Prisma User model)
  private profiles: Map<string, UserProfile> = new Map();

  public getOrCreateProfile(authUser: AuthenticatedUser): UserProfile {
    const existing = this.profiles.get(authUser.id);
    if (existing) {
      return existing;
    }

    const newProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email,
      fullName: authUser.fullName,
      avatarUrl: authUser.avatarUrl ?? null,
      role: 'REGISTERED',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.profiles.set(authUser.id, newProfile);
    return newProfile;
  }

  public getProfileById(userId: string): UserProfile | null {
    return this.profiles.get(userId) ?? null;
  }

  public getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  public updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const existing = this.profiles.get(userId);
    if (!existing) {
      return null;
    }

    const updated: UserProfile = {
      ...existing,
      ...updates,
    };

    this.profiles.set(userId, updated);
    return updated;
  }

  public suspendUser(userId: string): UserProfile {
    const existing = this.profiles.get(userId);
    if (!existing) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const updated: UserProfile = {
      ...existing,
      status: 'SUSPENDED',
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  public unsuspendUser(userId: string): UserProfile {
    const existing = this.profiles.get(userId);
    if (!existing) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const updated: UserProfile = {
      ...existing,
      status: 'ACTIVE',
    };
    this.profiles.set(userId, updated);
    return updated;
  }

  public createProfile(profile: Partial<UserProfile> & { id: string }): UserProfile {
    const fullProfile: UserProfile = {
      id: profile.id,
      email: profile.email ?? `${profile.id}@example.com`,
      fullName: profile.fullName ?? 'Test User',
      avatarUrl: profile.avatarUrl ?? null,
      role: profile.role ?? 'CAMPUS_MEMBER',
      status: profile.status ?? 'ACTIVE',
      campusId: profile.campusId ?? '550e8400-e29b-41d4-a716-446655440000',
      campusName: profile.campusName ?? 'Darrang College',
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(profile.id, fullProfile);
    return fullProfile;
  }

  public resetForTesting(): void {
    this.profiles.clear();
  }
}

export const userService = new UserService();

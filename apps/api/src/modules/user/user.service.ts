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
      createdAt: new Date().toISOString(),
    };

    this.profiles.set(authUser.id, newProfile);
    return newProfile;
  }

  public getProfileById(userId: string): UserProfile | null {
    return this.profiles.get(userId) ?? null;
  }
}

export const userService = new UserService();

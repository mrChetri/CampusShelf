import crypto from 'node:crypto';
import {
  Campus,
  RedeemInviteInput,
  RedeemInviteResponse,
  AdminCreateInviteInput,
} from './campus.schema';
import { userService } from '../user/user.service';

export interface CampusInviteCodeRecord {
  id: string;
  campusId: string;
  codeHash: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  revoked: boolean;
  createdAt: string;
}

export class CampusService {
  private campuses: Map<string, Campus> = new Map();
  private inviteCodes: Map<string, CampusInviteCodeRecord> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private hashInviteCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code.trim().toUpperCase())
      .digest('hex');
  }

  public seedDefaults(): void {
    const darrangCollege: Campus = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Darrang College',
      slug: 'darrang-college',
      city: 'Tezpur',
      state: 'Assam',
      active: true,
    };
    this.campuses.set(darrangCollege.id, darrangCollege);

    // Seed default pilot invite code: DARRANG-PILOT-2026
    const defaultCode = 'DARRANG-PILOT-2026';
    const pilotInvite: CampusInviteCodeRecord = {
      id: '770e8400-e29b-41d4-a716-446655440000',
      campusId: darrangCollege.id,
      codeHash: this.hashInviteCode(defaultCode),
      maxUses: 500,
      usedCount: 0,
      expiresAt: null,
      revoked: false,
      createdAt: new Date().toISOString(),
    };
    this.inviteCodes.set(pilotInvite.id, pilotInvite);
  }

  public resetForTesting(): void {
    this.campuses.clear();
    this.inviteCodes.clear();
    this.seedDefaults();
  }

  public listCampuses(): Campus[] {
    return Array.from(this.campuses.values()).filter((c) => c.active);
  }

  public getCampusById(id: string): Campus | null {
    const campus = this.campuses.get(id);
    return campus && campus.active ? campus : null;
  }

  public getCampusBySlug(slug: string): Campus | null {
    const campus = Array.from(this.campuses.values()).find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() && c.active
    );
    return campus || null;
  }

  public redeemInviteCode(userId: string, input: RedeemInviteInput): RedeemInviteResponse {
    const campus = this.getCampusById(input.campusId);
    if (!campus) {
      throw new Error('Campus not found or inactive.');
    }

    const hashed = this.hashInviteCode(input.code);

    const matchingInvite = Array.from(this.inviteCodes.values()).find(
      (invite) => invite.campusId === campus.id && invite.codeHash === hashed
    );

    if (!matchingInvite) {
      throw new Error('Invalid campus invite code.');
    }

    if (matchingInvite.revoked) {
      throw new Error('This invite code has been revoked.');
    }

    if (matchingInvite.expiresAt && new Date(matchingInvite.expiresAt).getTime() <= Date.now()) {
      throw new Error('This invite code has expired.');
    }

    if (matchingInvite.usedCount >= matchingInvite.maxUses) {
      throw new Error('This invite code has reached its maximum usage limit.');
    }

    // Atomically increment usage
    matchingInvite.usedCount += 1;
    this.inviteCodes.set(matchingInvite.id, matchingInvite);

    // Promote user in profile store
    let user = userService.getProfileById(userId);
    if (!user) {
      // Bootstrap if not already fetched
      user = userService.getOrCreateProfile({
        id: userId,
        email: 'user@campusshelf.org',
        fullName: 'Campus Student',
      });
    }

    const updatedUser = userService.updateProfile(userId, {
      role: 'CAMPUS_MEMBER',
      campusId: campus.id,
      campusName: campus.name,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user profile with campus membership.');
    }

    return {
      success: true,
      message: `Successfully joined ${campus.name} as a Campus Member.`,
      user: updatedUser,
    };
  }

  public createInviteCode(input: AdminCreateInviteInput): CampusInviteCodeRecord {
    const campus = this.getCampusById(input.campusId);
    if (!campus) {
      throw new Error('Campus not found.');
    }

    const newInvite: CampusInviteCodeRecord = {
      id: crypto.randomUUID(),
      campusId: input.campusId,
      codeHash: this.hashInviteCode(input.code),
      maxUses: input.maxUses ?? 100,
      usedCount: 0,
      expiresAt: input.expiresAt ?? null,
      revoked: false,
      createdAt: new Date().toISOString(),
    };

    this.inviteCodes.set(newInvite.id, newInvite);
    return newInvite;
  }

  public revokeInviteCode(inviteId: string): void {
    const invite = this.inviteCodes.get(inviteId);
    if (!invite) {
      throw new Error('Invite code not found.');
    }

    invite.revoked = true;
    this.inviteCodes.set(inviteId, invite);
  }

  public createInviteCodeForTesting(params: {
    campusId: string;
    code: string;
    maxUses?: number;
    usedCount?: number;
    expiresAt?: string | null;
    revoked?: boolean;
  }): CampusInviteCodeRecord {
    const invite: CampusInviteCodeRecord = {
      id: crypto.randomUUID(),
      campusId: params.campusId,
      codeHash: this.hashInviteCode(params.code),
      maxUses: params.maxUses ?? 100,
      usedCount: params.usedCount ?? 0,
      expiresAt: params.expiresAt ?? null,
      revoked: params.revoked ?? false,
      createdAt: new Date().toISOString(),
    };

    this.inviteCodes.set(invite.id, invite);
    return invite;
  }
}

export const campusService = new CampusService();

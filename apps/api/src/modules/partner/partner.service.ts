import { randomUUID } from 'node:crypto';
import type {
  PartnerOrganization,
  CreatePartnerInput,
  UpdatePartnerInput,
  ReviewPartnerInput,
  PartnerType,
  PartnerVerificationStatus,
} from './partner.schema';
import { campusService } from '../campus/campus.service';

export class PartnerService {
  private partners: Map<string, PartnerOrganization> = new Map();

  constructor() {
    this.seedDefaults();
  }

  public resetForTesting(): void {
    this.partners.clear();
    this.seedDefaults();
  }

  private resolveCampusName(campusId?: string | null): string | null {
    if (!campusId) return null;
    const campus = campusService.getCampusById(campusId);
    return campus ? campus.name : null;
  }

  public seedDefaults(): void {
    const darrangLibraryId = '770e8400-e29b-41d4-a716-446655440001';
    const tezpurBankId = '770e8400-e29b-41d4-a716-446655440002';
    const pilotCampusId = '550e8400-e29b-41d4-a716-446655440000';

    const now = new Date('2026-11-20T00:00:00.000Z').toISOString();

    const darrangLibrary: PartnerOrganization = {
      id: darrangLibraryId,
      name: 'Darrang College Central Library',
      type: 'CAMPUS_LIBRARY',
      campusId: pilotCampusId,
      campusName: 'Darrang College',
      description: 'Official academic central library providing curriculum textbooks, reference journals, and quiet reading areas for Darrang College students.',
      website: 'https://darrangcollege.edu.in/library',
      contactEmail: 'library@darrangcollege.edu.in',
      contactPhone: '+91 3712 220014',
      address: 'Central Campus, Mahabhairab, Tezpur, Assam 784001',
      verificationStatus: 'VERIFIED',
      verifiedAt: now,
      adminReviewNotes: 'Verified official institutional campus library profile.',
      createdAt: now,
      updatedAt: now,
    };

    const tezpurBookBank: PartnerOrganization = {
      id: tezpurBankId,
      name: 'Tezpur Community Book Bank',
      type: 'NGO',
      campusId: null,
      campusName: null,
      description: 'Community non-profit initiative collecting donated school and college textbooks to distribute to deserving students across Sonitpur district.',
      website: 'https://tezpurbookbank.org',
      contactEmail: 'connect@tezpurbookbank.org',
      contactPhone: '+91 94350 99887',
      address: 'Mission Chariali, Tezpur, Assam 784001',
      verificationStatus: 'VERIFIED',
      verifiedAt: now,
      adminReviewNotes: 'Verified registration credentials and NGO documentation with district authorities.',
      createdAt: now,
      updatedAt: now,
    };

    this.partners.set(darrangLibrary.id, darrangLibrary);
    this.partners.set(tezpurBookBank.id, tezpurBookBank);
  }

  public listPublicPartners(filters?: {
    campusId?: string;
    type?: PartnerType;
    search?: string;
  }): {
    partners: PartnerOrganization[];
    total: number;
  } {
    let list = Array.from(this.partners.values()).filter(
      (p) => p.verificationStatus === 'VERIFIED'
    );

    if (filters?.campusId) {
      list = list.filter((p) => p.campusId === filters.campusId);
    }

    if (filters?.type) {
      list = list.filter((p) => p.type === filters.type);
    }

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.campusName && p.campusName.toLowerCase().includes(q))
      );
    }

    // Sort: campus libraries first, then alphabetically by name
    list.sort((a, b) => {
      if (a.type === 'CAMPUS_LIBRARY' && b.type !== 'CAMPUS_LIBRARY') return -1;
      if (a.type !== 'CAMPUS_LIBRARY' && b.type === 'CAMPUS_LIBRARY') return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      partners: list,
      total: list.length,
    };
  }

  public getPartnerById(id: string): PartnerOrganization | null {
    return this.partners.get(id) || null;
  }

  public listAllPartners(filters?: {
    verificationStatus?: PartnerVerificationStatus;
    type?: PartnerType;
    campusId?: string;
  }): { partners: PartnerOrganization[]; total: number } {
    let list = Array.from(this.partners.values());

    if (filters?.verificationStatus) {
      list = list.filter((p) => p.verificationStatus === filters.verificationStatus);
    }

    if (filters?.type) {
      list = list.filter((p) => p.type === filters.type);
    }

    if (filters?.campusId) {
      list = list.filter((p) => p.campusId === filters.campusId);
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      partners: list,
      total: list.length,
    };
  }

  public createPartner(
    input: CreatePartnerInput,
    status: PartnerVerificationStatus = 'PENDING'
  ): PartnerOrganization {
    const campusName = this.resolveCampusName(input.campusId);
    const now = new Date().toISOString();

    const newPartner: PartnerOrganization = {
      id: randomUUID(),
      name: input.name,
      type: input.type,
      campusId: input.campusId ?? null,
      campusName,
      description: input.description,
      website: input.website && input.website.length > 0 ? input.website : null,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone ?? null,
      address: input.address ?? null,
      verificationStatus: status,
      verifiedAt: status === 'VERIFIED' ? now : null,
      adminReviewNotes: null,
      createdAt: now,
      updatedAt: now,
    };

    this.partners.set(newPartner.id, newPartner);
    return newPartner;
  }

  public updatePartner(id: string, input: UpdatePartnerInput): PartnerOrganization {
    const partner = this.partners.get(id);
    if (!partner) {
      throw new Error('Partner organization not found');
    }

    let campusName = partner.campusName;
    if (input.campusId !== undefined) {
      campusName = this.resolveCampusName(input.campusId);
    }

    const now = new Date().toISOString();
    const updated: PartnerOrganization = {
      ...partner,
      name: input.name ?? partner.name,
      type: input.type ?? partner.type,
      campusId: input.campusId !== undefined ? input.campusId : partner.campusId,
      campusName,
      description: input.description ?? partner.description,
      website:
        input.website !== undefined
          ? input.website && input.website.length > 0
            ? input.website
            : null
          : partner.website,
      contactEmail: input.contactEmail ?? partner.contactEmail,
      contactPhone: input.contactPhone !== undefined ? input.contactPhone : partner.contactPhone,
      address: input.address !== undefined ? input.address : partner.address,
      adminReviewNotes:
        input.adminReviewNotes !== undefined ? input.adminReviewNotes : partner.adminReviewNotes,
      updatedAt: now,
    };

    this.partners.set(id, updated);
    return updated;
  }

  public reviewPartner(id: string, review: ReviewPartnerInput): PartnerOrganization {
    const partner = this.partners.get(id);
    if (!partner) {
      throw new Error('Partner organization not found');
    }

    const now = new Date().toISOString();
    const updated: PartnerOrganization = {
      ...partner,
      verificationStatus: review.verificationStatus,
      adminReviewNotes: review.adminReviewNotes ?? partner.adminReviewNotes,
      verifiedAt: review.verificationStatus === 'VERIFIED' ? now : null,
      updatedAt: now,
    };

    this.partners.set(id, updated);
    return updated;
  }
}

export const partnerService = new PartnerService();

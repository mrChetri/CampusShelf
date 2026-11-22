import { randomUUID } from 'node:crypto';
import type {
  CampaignNeed,
  CreateCampaignNeedInput,
  UpdateCampaignNeedInput,
  CampaignNeedStatus,
} from './campaign.schema';
import { partnerService } from '../partner/partner.service';

export class CampaignService {
  private needs: Map<string, CampaignNeed> = new Map();

  constructor() {
    this.seedDefaults();
  }

  public resetForTesting(): void {
    this.needs.clear();
    this.seedDefaults();
  }

  public seedDefaults(): void {
    const defaultNeed1: CampaignNeed = {
      id: '990e8400-e29b-41d4-a716-446655440001',
      partnerId: '770e8400-e29b-41d4-a716-446655440002', // Tezpur Community Book Bank
      partnerName: 'Tezpur Community Book Bank',
      title: 'Class 11 & 12 NCERT Chemistry and Physics Textbooks',
      category: 'SCIENCE',
      course: 'Higher Secondary Science',
      description: 'Urgent requirement for high school science textbooks for rural student learning camps.',
      targetQuantity: 20,
      fulfilledQuantity: 4,
      status: 'ACTIVE',
      urgent: true,
      createdAt: new Date('2026-11-20T00:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-11-20T00:00:00.000Z').toISOString(),
    };

    const defaultNeed2: CampaignNeed = {
      id: '990e8400-e29b-41d4-a716-446655440002',
      partnerId: '770e8400-e29b-41d4-a716-446655440001', // Darrang College Central Library
      partnerName: 'Darrang College Central Library',
      title: 'B.Sc Mathematics Reference Guides (Calculus & Analysis)',
      category: 'MATHEMATICS',
      course: 'B.Sc Mathematics',
      description: 'Reference textbooks and analytical guides for college book bank reserve.',
      targetQuantity: 15,
      fulfilledQuantity: 3,
      status: 'ACTIVE',
      urgent: false,
      createdAt: new Date('2026-11-21T00:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-11-21T00:00:00.000Z').toISOString(),
    };

    this.needs.set(defaultNeed1.id, defaultNeed1);
    this.needs.set(defaultNeed2.id, defaultNeed2);
  }

  public listNeeds(filters?: {
    partnerId?: string;
    category?: string;
    status?: CampaignNeedStatus;
  }): { needs: CampaignNeed[]; total: number } {
    let list = Array.from(this.needs.values());

    if (filters?.partnerId) {
      list = list.filter((n) => n.partnerId === filters.partnerId);
    }

    if (filters?.category) {
      list = list.filter(
        (n) => n.category.toUpperCase() === filters.category!.toUpperCase()
      );
    }

    if (filters?.status) {
      list = list.filter((n) => n.status === filters.status);
    }

    // Sort: urgent first, then newest
    list.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      needs: list,
      total: list.length,
    };
  }

  public getNeedById(id: string): CampaignNeed | null {
    return this.needs.get(id) || null;
  }

  public createNeed(input: CreateCampaignNeedInput): CampaignNeed {
    const partner = partnerService.getPartnerById(input.partnerId);
    if (!partner) {
      throw new Error('Partner organization not found');
    }

    const now = new Date().toISOString();
    const newNeed: CampaignNeed = {
      id: randomUUID(),
      partnerId: input.partnerId,
      partnerName: partner.name,
      title: input.title,
      category: input.category.toUpperCase(),
      course: input.course ?? null,
      description: input.description ?? null,
      targetQuantity: input.targetQuantity,
      fulfilledQuantity: 0,
      status: 'ACTIVE',
      urgent: input.urgent ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.needs.set(newNeed.id, newNeed);
    return newNeed;
  }

  public updateNeed(id: string, input: UpdateCampaignNeedInput): CampaignNeed {
    const need = this.needs.get(id);
    if (!need) {
      throw new Error('Campaign need not found');
    }

    const targetQuantity = input.targetQuantity ?? need.targetQuantity;
    let status = input.status ?? need.status;

    // Auto-fulfill if threshold met
    if (need.fulfilledQuantity >= targetQuantity && status === 'ACTIVE') {
      status = 'FULFILLED';
    }

    const now = new Date().toISOString();
    const updated: CampaignNeed = {
      ...need,
      title: input.title ?? need.title,
      category: input.category ? input.category.toUpperCase() : need.category,
      course: input.course !== undefined ? input.course : need.course,
      description: input.description !== undefined ? input.description : need.description,
      targetQuantity,
      status,
      urgent: input.urgent !== undefined ? input.urgent : need.urgent,
      updatedAt: now,
    };

    this.needs.set(id, updated);
    return updated;
  }

  public recordFulfillment(needId: string, quantity: number = 1): CampaignNeed | null {
    const need = this.needs.get(needId);
    if (!need) return null;

    const newFulfilled = need.fulfilledQuantity + quantity;
    const now = new Date().toISOString();

    const updated: CampaignNeed = {
      ...need,
      fulfilledQuantity: newFulfilled,
      status: newFulfilled >= need.targetQuantity ? 'FULFILLED' : need.status,
      updatedAt: now,
    };

    this.needs.set(needId, updated);
    return updated;
  }
}

export const campaignService = new CampaignService();

import { describe, expect, it } from 'vitest';
import {
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
  ModerationActionEnum,
  CreateReportInputSchema,
  ModerateActionInputSchema,
  ReportSchema,
  ReportsListResponseSchema,
  AuditEventSchema,
  AuditLogsResponseSchema,
} from './moderation.contract';

describe('Moderation Contracts (CS-010)', () => {
  describe('ReportReasonEnum', () => {
    it('accepts valid report reasons', () => {
      const validReasons = [
        'SPAM',
        'INAPPROPRIATE',
        'COMMERCIAL_SALE',
        'FRAUD',
        'HARASSMENT',
        'OTHER',
      ];
      for (const reason of validReasons) {
        expect(ReportReasonEnum.safeParse(reason).success).toBe(true);
      }
    });

    it('rejects invalid report reason', () => {
      expect(ReportReasonEnum.safeParse('INVALID_REASON').success).toBe(false);
    });

    it('validates ReportStatusEnum values', () => {
      expect(ReportStatusEnum.safeParse('PENDING').success).toBe(true);
      expect(ReportStatusEnum.safeParse('RESOLVED').success).toBe(true);
      expect(ReportStatusEnum.safeParse('DISMISSED').success).toBe(true);
      expect(ReportStatusEnum.safeParse('UNKNOWN').success).toBe(false);
    });

    it('validates ReportTargetTypeEnum and ModerationActionEnum', () => {
      expect(ReportTargetTypeEnum.safeParse('LISTING').success).toBe(true);
      expect(ReportTargetTypeEnum.safeParse('USER').success).toBe(true);
      expect(ReportTargetTypeEnum.safeParse('INVALID').success).toBe(false);

      expect(ModerationActionEnum.safeParse('HIDE_LISTING').success).toBe(true);
      expect(ModerationActionEnum.safeParse('SUSPEND_USER').success).toBe(true);
      expect(ModerationActionEnum.safeParse('DISMISS_REPORT').success).toBe(true);
      expect(ModerationActionEnum.safeParse('INVALID_ACTION').success).toBe(false);
    });
  });

  describe('CreateReportInputSchema', () => {
    it('parses valid listing report input', () => {
      const input = {
        targetType: 'LISTING',
        targetId: '550e8400-e29b-41d4-a716-446655440000',
        reason: 'SPAM',
        details: 'Multiple identical copies posted.',
      };
      const result = CreateReportInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('parses valid user report input without optional details', () => {
      const input = {
        targetType: 'USER',
        targetId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'HARASSMENT',
      };
      const result = CreateReportInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects invalid target ID (not a UUID)', () => {
      const input = {
        targetType: 'LISTING',
        targetId: 'invalid-id',
        reason: 'SPAM',
      };
      expect(CreateReportInputSchema.safeParse(input).success).toBe(false);
    });
  });

  describe('ModerateActionInputSchema', () => {
    it('parses valid HIDE_LISTING action', () => {
      const input = {
        action: 'HIDE_LISTING',
        targetType: 'LISTING',
        targetId: '550e8400-e29b-41d4-a716-446655440000',
        reportId: '550e8400-e29b-41d4-a716-446655440002',
        reason: 'Commercial seller masquerading as student donation.',
      };
      const result = ModerateActionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('parses valid SUSPEND_USER action', () => {
      const input = {
        action: 'SUSPEND_USER',
        targetType: 'USER',
        targetId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'Repeated community violations.',
      };
      const result = ModerateActionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty or too short reason', () => {
      const input = {
        action: 'HIDE_LISTING',
        targetType: 'LISTING',
        targetId: '550e8400-e29b-41d4-a716-446655440000',
        reason: 'no',
      };
      expect(ModerateActionInputSchema.safeParse(input).success).toBe(false);
    });
  });

  describe('ReportSchema & AuditEventSchema', () => {
    it('validates a complete Report object', () => {
      const report = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        reporterId: '550e8400-e29b-41d4-a716-446655440011',
        reporterName: 'Student Reporter',
        targetType: 'LISTING',
        targetId: '550e8400-e29b-41d4-a716-446655440012',
        targetTitle: 'Suspicious Book',
        reason: 'COMMERCIAL_SALE',
        details: 'Demanding cash upon meeting.',
        status: 'PENDING',
        resolvedBy: null,
        resolutionNotes: null,
        createdAt: '2026-11-22T10:00:00.000Z',
        updatedAt: '2026-11-22T10:00:00.000Z',
      };
      expect(ReportSchema.safeParse(report).success).toBe(true);
      expect(ReportsListResponseSchema.safeParse({ reports: [report], total: 1 }).success).toBe(true);
    });

    it('validates a complete AuditEvent object', () => {
      const auditEvent = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        actorId: '550e8400-e29b-41d4-a716-446655440021',
        actorName: 'Lead Moderator',
        action: 'HIDE_LISTING',
        targetType: 'LISTING',
        targetId: '550e8400-e29b-41d4-a716-446655440012',
        reason: 'Violated donation-first policy',
        createdAt: '2026-11-22T10:05:00.000Z',
      };
      expect(AuditEventSchema.safeParse(auditEvent).success).toBe(true);
      expect(AuditLogsResponseSchema.safeParse({ auditLogs: [auditEvent] }).success).toBe(true);
    });
  });
});

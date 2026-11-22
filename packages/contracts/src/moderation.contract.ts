import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const ReportTargetTypeEnum = z.enum(['LISTING', 'USER']);
export type ReportTargetType = z.infer<typeof ReportTargetTypeEnum>;

export const ReportReasonEnum = z.enum([
  'SPAM',
  'INAPPROPRIATE',
  'COMMERCIAL_SALE',
  'FRAUD',
  'HARASSMENT',
  'OTHER',
]);
export type ReportReason = z.infer<typeof ReportReasonEnum>;

export const ReportStatusEnum = z.enum(['PENDING', 'RESOLVED', 'DISMISSED']);
export type ReportStatus = z.infer<typeof ReportStatusEnum>;

export const ModerationActionEnum = z.enum([
  'HIDE_LISTING',
  'UNHIDE_LISTING',
  'SUSPEND_USER',
  'UNSUSPEND_USER',
  'RESOLVE_REPORT',
  'DISMISS_REPORT',
]);
export type ModerationAction = z.infer<typeof ModerationActionEnum>;

// ---------------------------------------------------------------------------
// Input Schemas
// ---------------------------------------------------------------------------
export const CreateReportInputSchema = z.object({
  targetType: ReportTargetTypeEnum,
  targetId: z.string().uuid(),
  reason: ReportReasonEnum,
  details: z.string().trim().max(1000).optional(),
});
export type CreateReportInput = z.infer<typeof CreateReportInputSchema>;

export const ModerateActionInputSchema = z.object({
  action: ModerationActionEnum,
  targetType: ReportTargetTypeEnum,
  targetId: z.string().uuid(),
  reportId: z.string().uuid().optional(),
  reason: z.string().trim().min(3).max(500),
});
export type ModerateActionInput = z.infer<typeof ModerateActionInputSchema>;

// ---------------------------------------------------------------------------
// Domain Entities
// ---------------------------------------------------------------------------
export const ReportSchema = z.object({
  id: z.string().uuid(),
  reporterId: z.string().uuid(),
  reporterName: z.string(),
  targetType: ReportTargetTypeEnum,
  targetId: z.string().uuid(),
  targetTitle: z.string().nullable().optional(),
  reason: ReportReasonEnum,
  details: z.string().nullable().optional(),
  status: ReportStatusEnum,
  resolvedBy: z.string().uuid().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Report = z.infer<typeof ReportSchema>;

export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  actorName: z.string(),
  action: ModerationActionEnum,
  targetType: ReportTargetTypeEnum,
  targetId: z.string().uuid(),
  reason: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ---------------------------------------------------------------------------
// Response Schemas
// ---------------------------------------------------------------------------
export const ReportResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  report: ReportSchema,
});
export type ReportResponse = z.infer<typeof ReportResponseSchema>;

export const ReportsListResponseSchema = z.object({
  reports: z.array(ReportSchema),
  total: z.number().int().nonnegative(),
});
export type ReportsListResponse = z.infer<typeof ReportsListResponseSchema>;

export const ModerateActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  auditEvent: AuditEventSchema,
});
export type ModerateActionResponse = z.infer<typeof ModerateActionResponseSchema>;

export const AuditLogsResponseSchema = z.object({
  auditLogs: z.array(AuditEventSchema),
});
export type AuditLogsResponse = z.infer<typeof AuditLogsResponseSchema>;

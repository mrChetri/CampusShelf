export type ReportTargetType = 'LISTING' | 'USER';
export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'COMMERCIAL_SALE'
  | 'FRAUD'
  | 'HARASSMENT'
  | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export type ModerationAction =
  | 'HIDE_LISTING'
  | 'UNHIDE_LISTING'
  | 'SUSPEND_USER'
  | 'UNSUSPEND_USER'
  | 'RESOLVE_REPORT'
  | 'DISMISS_REPORT';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string | null;
  reason: ReportReason;
  details?: string | null;
  status: ReportStatus;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: ModerationAction;
  targetType: ReportTargetType;
  targetId: string;
  reason?: string | null;
  createdAt: string;
}

export interface CreateReportParams {
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string | null;
  reason: ReportReason;
  details?: string | null;
}

export interface ModerateActionParams {
  actorId: string;
  actorName: string;
  action: ModerationAction;
  targetType: ReportTargetType;
  targetId: string;
  reportId?: string;
  reason: string;
}

import { randomUUID } from 'node:crypto';
import type {
  Report,
  AuditEvent,
  CreateReportParams,
  ModerateActionParams,
  ReportStatus,
} from './moderation.schema';
import { listingService } from '../listing/listing.service';
import { userService } from '../user/user.service';

export class ModerationService {
  private reports: Report[] = [];
  private auditEvents: AuditEvent[] = [];

  public createReport(params: CreateReportParams): Report {
    if (params.targetType === 'USER' && params.targetId === params.reporterId) {
      const err = new Error('Cannot report your own account');
      (err as any).statusCode = 400;
      throw err;
    }

    if (params.targetType === 'LISTING') {
      const listing = listingService.getListingById(params.targetId);
      if (!listing) {
        const err = new Error('Listing not found');
        (err as any).statusCode = 404;
        throw err;
      }
      if (!params.targetTitle) {
        params.targetTitle = listing.title;
      }
    } else if (params.targetType === 'USER') {
      const user = userService.getProfileById(params.targetId);
      if (!user) {
        const err = new Error('User not found');
        (err as any).statusCode = 404;
        throw err;
      }
      if (!params.targetTitle) {
        params.targetTitle = user.fullName;
      }
    }

    const now = new Date().toISOString();
    const newReport: Report = {
      id: randomUUID(),
      reporterId: params.reporterId,
      reporterName: params.reporterName,
      targetType: params.targetType,
      targetId: params.targetId,
      targetTitle: params.targetTitle ?? null,
      reason: params.reason,
      details: params.details ?? null,
      status: 'PENDING',
      resolvedBy: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
    };

    this.reports.unshift(newReport);
    return newReport;
  }

  public getReports(status?: ReportStatus): Report[] {
    let list = this.reports;
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getReportById(id: string): Report | null {
    return this.reports.find((r) => r.id === id) ?? null;
  }

  public moderate(params: ModerateActionParams): {
    auditEvent: AuditEvent;
    report?: Report;
  } {
    const now = new Date().toISOString();

    // 1. Enforce domain action
    switch (params.action) {
      case 'HIDE_LISTING':
        listingService.hideListing(params.targetId);
        break;
      case 'UNHIDE_LISTING':
        listingService.unhideListing(params.targetId);
        break;
      case 'SUSPEND_USER':
        userService.suspendUser(params.targetId);
        break;
      case 'UNSUSPEND_USER':
        userService.unsuspendUser(params.targetId);
        break;
      case 'RESOLVE_REPORT':
      case 'DISMISS_REPORT':
        // Only report status transitions
        break;
    }

    // 2. Resolve associated report if specified
    let updatedReport: Report | undefined;
    if (params.reportId) {
      const report = this.reports.find(
        (r) => r.id === params.reportId && (!params.targetId || r.targetId === params.targetId)
      );
      if (report) {
        report.status = params.action === 'DISMISS_REPORT' ? 'DISMISSED' : 'RESOLVED';
        report.resolvedBy = params.actorId;
        report.resolutionNotes = params.reason;
        report.updatedAt = now;
        updatedReport = report;
      }
    }

    // 3. Immutably record audit event
    const auditEvent: AuditEvent = {
      id: randomUUID(),
      actorId: params.actorId,
      actorName: params.actorName,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      createdAt: now,
    };

    this.auditEvents.unshift(auditEvent);

    return { auditEvent, report: updatedReport };
  }

  public getAuditLogs(): AuditEvent[] {
    return [...this.auditEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public resetForTesting(): void {
    this.reports = [];
    this.auditEvents = [];
  }
}

export const moderationService = new ModerationService();

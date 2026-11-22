import type { Request, Response } from 'express';
import { moderationService } from './moderation.service';
import { userService } from '../user/user.service';
import {
  CreateReportInputSchema,
  ModerateActionInputSchema,
  ReportStatusEnum,
  type ReportStatus,
} from '@campusshelf/contracts';

// POST /api/reports - Authenticated members can submit a report
export function createReport(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const parsed = CreateReportInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const report = moderationService.createReport({
      reporterId: user.id,
      reporterName: user.fullName,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our campus moderation team will review it.',
      report,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message || 'Failed to submit report' });
  }
}

// GET /api/admin/reports - Moderator review queue
export function listReports(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const profile = userService.getProfileById(user.id);
  if (!profile || (profile.role !== 'MODERATOR' && profile.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: moderator privileges required' });
    return;
  }

  try {
    const statusQuery = req.query.status as string | undefined;
    let statusFilter: ReportStatus | undefined = undefined;
    if (statusQuery) {
      const parsedStatus = ReportStatusEnum.safeParse(statusQuery);
      if (parsedStatus.success) {
        statusFilter = parsedStatus.data;
      }
    }

    const reports = moderationService.getReports(statusFilter);
    res.json({ reports, total: reports.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list reports' });
  }
}

// GET /api/admin/reports/:id - View single report
export function getReport(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const profile = userService.getProfileById(user.id);
  if (!profile || (profile.role !== 'MODERATOR' && profile.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: moderator privileges required' });
    return;
  }

  try {
    const report = moderationService.getReportById(req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get report' });
  }
}

// POST /api/admin/moderate - Execute enforcement action & record audit log
export function moderateAction(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const profile = userService.getProfileById(user.id);
  if (!profile || (profile.role !== 'MODERATOR' && profile.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: moderator privileges required' });
    return;
  }

  const parsed = ModerateActionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = moderationService.moderate({
      actorId: user.id,
      actorName: user.fullName,
      action: parsed.data.action,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reportId: parsed.data.reportId,
      reason: parsed.data.reason,
    });

    res.json({
      success: true,
      message: `Action ${parsed.data.action} executed successfully.`,
      auditEvent: result.auditEvent,
      report: result.report,
    });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message || 'Failed to execute moderation action' });
  }
}

// GET /api/admin/audit-logs - View immutable audit events
export function listAuditLogs(req: Request, res: Response): void {
  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized: missing authentication session' });
    return;
  }

  const profile = userService.getProfileById(user.id);
  if (!profile || (profile.role !== 'MODERATOR' && profile.role !== 'ADMIN')) {
    res.status(403).json({ error: 'Forbidden: moderator privileges required' });
    return;
  }

  try {
    const auditLogs = moderationService.getAuditLogs();
    res.json({ auditLogs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list audit logs' });
  }
}

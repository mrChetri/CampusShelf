import React, { useState } from 'react';
import type { Report, AuditEvent, ModerationAction, ReportStatus } from '@campusshelf/contracts';

interface ModeratorQueueProps {
  reports: Report[];
  auditLogs: AuditEvent[];
  onModerateAction: (
    action: ModerationAction,
    targetType: 'LISTING' | 'USER',
    targetId: string,
    reason: string,
    reportId?: string
  ) => Promise<void>;
}

export const ModeratorQueue: React.FC<ModeratorQueueProps> = ({
  reports,
  auditLogs,
  onModerateAction,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('PENDING');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredReports = reports.filter((r) =>
    statusFilter === 'ALL' ? true : r.status === statusFilter
  );

  const handleExecuteAction = async (
    action: ModerationAction,
    report: Report,
    customReason?: string
  ) => {
    setIsSubmitting(true);
    try {
      const reasonToUse = customReason || `Moderator action: ${action}`;
      await onModerateAction(action, report.targetType, report.targetId, reasonToUse, report.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="moderator-queue" className="w-full max-w-4xl mx-auto space-y-6 text-left">
      {/* Top Header & Sub-Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🛡️</span>
            <span>Campus Moderation Portal</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enforce trust, review student reports, and record immutable audit logs.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('reports')}
            data-testid="tab-reports-queue"
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Open Reports ({reports.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            data-testid="tab-audit-logs"
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'reports' ? (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center space-x-2">
            {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                data-testid={`filter-${st.toLowerCase()}-btn`}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              No reports found in this status view.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  data-testid="report-item"
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                          {report.targetType}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            report.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : report.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs font-semibold text-rose-700">{report.reason}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {report.targetTitle || report.targetId}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reported by <span className="font-medium text-slate-700">{report.reporterName}</span> •{' '}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {report.status === 'PENDING' && (
                      <div className="flex items-center space-x-2">
                        {report.targetType === 'LISTING' && (
                          <button
                            data-testid="hide-listing-btn"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleExecuteAction(
                                'HIDE_LISTING',
                                report,
                                'Confirmed policy violation: listing hidden'
                              )
                            }
                            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          >
                            Hide Listing
                          </button>
                        )}
                        {report.targetType === 'USER' && (
                          <button
                            data-testid="suspend-user-btn"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleExecuteAction(
                                'SUSPEND_USER',
                                report,
                                'Community terms violation: account suspended'
                              )
                            }
                            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          >
                            Suspend User
                          </button>
                        )}
                        <button
                          data-testid="dismiss-report-btn"
                          disabled={isSubmitting}
                          onClick={() =>
                            handleExecuteAction(
                              'DISMISS_REPORT',
                              report,
                              'Reviewed: no platform violation found'
                            )
                          }
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {report.details && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700">
                      <span className="font-semibold text-slate-500">Details: </span>
                      {report.details}
                    </div>
                  )}

                  {report.resolutionNotes && (
                    <div className="text-[11px] text-slate-500 italic">
                      Resolution: {report.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Audit Trail Section */
        <div data-testid="audit-logs-section" className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Immutable Audit Trail</h3>
          {auditLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.id} data-testid="audit-log-item" className="p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    By <span className="font-medium text-slate-700">{log.actorName}</span> on{' '}
                    <span className="font-mono text-slate-500">{log.targetType}:{log.targetId}</span>
                  </p>
                  {log.reason && <p className="text-slate-500 italic">Reason: {log.reason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

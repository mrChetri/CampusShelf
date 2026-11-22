// ---------------------------------------------------------------------------
// In-memory schema for the Notification module (CS-009)
// Mirrors notification.contract.ts but kept as plain TS types so the
// service layer has no Zod dependency.
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'REQUEST_RECEIVED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_DECLINED'
  | 'HANDOVER_COMPLETED'
  | 'HANDOVER_DISPUTED'
  | 'RESERVATION_EXPIRED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityId?: string | null;
}

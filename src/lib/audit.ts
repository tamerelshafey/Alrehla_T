import { mockAuditLogs } from '@/data/domains/admin';

export async function logAuditAction(params: {
  actorProfileId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  mockAuditLogs.unshift({
    id: `log-${Date.now()}`,
    actorProfileId: params.actorProfileId,
    actorName: params.actorName,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ?? {},
    createdAt: new Date().toISOString(),
  });
}

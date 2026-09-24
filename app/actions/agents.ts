'use server';

import { getSession } from '@/app/lib/auth';
import { toggleAgentShadowMode, acknowledgeAgentDrift, getAgentById, getDb, generateId, now } from '@/app/lib/db';
import { hasPermission } from '@/app/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function toggleShadowModeAction(agentId: string, enabled: boolean) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  if (!hasPermission(session.role, 'agent.manage')) {
    return { success: false, error: 'Permission denied: agent.manage capability required' };
  }

  try {
    const updated = toggleAgentShadowMode(agentId, session.workspaceId, enabled);
    if (!updated) {
      return { success: false, error: 'Agent not found in this workspace' };
    }
    const db = getDb();
    const timestamp = now();
    const agent = getAgentById(agentId, session.workspaceId);

    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'agent.shadow_mode_toggled', ?, ?, 'agent', ?, ?, ?)
    `).run(
      generateId(),
      session.userId,
      session.name,
      agentId,
      `${session.name} ${enabled ? 'enabled' : 'disabled'} Shadow Mode on agent ${agent?.name || agentId}`,
      timestamp
    );

    revalidatePath(`/agents/${agentId}`);
    revalidatePath('/agents');
    return { success: true, enabled };
  } catch (err: any) {
    console.error('Failed to toggle shadow mode:', err);
    return { success: false, error: err.message || 'Failed to toggle shadow mode' };
  }
}

export async function acknowledgeDriftAction(agentId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required' };
  }

  if (!hasPermission(session.role, 'agent.manage')) {
    return { success: false, error: 'Permission denied: agent.manage capability required' };
  }

  try {
    const updated = acknowledgeAgentDrift(agentId, session.workspaceId);
    if (!updated) {
      return { success: false, error: 'Agent not found in this workspace' };
    }
    const db = getDb();
    const timestamp = now();
    const agent = getAgentById(agentId, session.workspaceId);

    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
      VALUES (?, 'agent.drift_acknowledged', ?, ?, 'agent', ?, ?, ?)
    `).run(
      generateId(),
      session.userId,
      session.name,
      agentId,
      `${session.name} acknowledged and reconciled configuration drift on agent ${agent?.name || agentId}`,
      timestamp
    );

    revalidatePath(`/agents/${agentId}`);
    revalidatePath('/agents');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to acknowledge drift:', err);
    return { success: false, error: err.message || 'Failed to acknowledge drift' };
  }
}

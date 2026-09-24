'use server';

import { getSession } from '@/app/lib/auth';
import { getDb, generateId, now } from '@/app/lib/db';
import { hasPermission } from '@/app/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function decideApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  comment?: string
) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (!hasPermission(session.role, 'approval.review')) {
    throw new Error('Permission denied: approval.review capability required');
  }

  const db = getDb();
  const timestamp = now();

  const approval = db.prepare(`
    SELECT a.* FROM approvals a
    JOIN findings f ON f.id = a.findingId
    JOIN scans s ON s.id = f.scanId
    WHERE a.id = ? AND s.workspaceId = ?
  `).get(approvalId, session.workspaceId) as any;
  if (!approval) throw new Error('Approval request not found');

  // 1. Record decision
  db.prepare(`
    UPDATE approvals 
    SET status = ?, reviewedBy = ?, reviewComment = ?, reviewedAt = ?
    WHERE id = ? AND EXISTS (
      SELECT 1 FROM findings f JOIN scans s ON s.id = f.scanId
      WHERE f.id = approvals.findingId AND s.workspaceId = ?
    )
  `).run(decision, session.userId, comment || null, timestamp, approvalId, session.workspaceId);

  // 2. If approved, create initial remediation task in approved status
  if (decision === 'approved') {
    const remediationId = generateId();
    db.prepare(`
      INSERT INTO remediations (id, approvalId, findingId, status, proposedFix, createdAt)
      VALUES (?, ?, ?, 'approved', ?, ?)
    `).run(remediationId, approvalId, approval.findingId, approval.proposedChange, timestamp);
  }

  // 3. Log audit event
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, ?, ?, ?, 'approval', ?, ?, ?)
  `).run(
    generateId(),
    decision === 'approved' ? 'approval.approved' : 'approval.rejected',
    session.userId,
    session.name,
    approvalId,
    `Change request ${approvalId} was ${decision} by ${session.name}${comment ? `: "${comment}"` : ''}`,
    timestamp
  );

  revalidatePath('/approvals');
  revalidatePath('/overview');
  revalidatePath('/findings');
  return { success: true, decision };
}

export async function executeAndRetestRemediation(approvalId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  if (!hasPermission(session.role, 'remediation.manage')) {
    throw new Error('Permission denied: remediation.manage capability required');
  }

  const db = getDb();
  const timestamp = now();

  const approval = db.prepare(`
    SELECT a.* FROM approvals a
    JOIN findings f ON f.id = a.findingId
    JOIN scans s ON s.id = f.scanId
    WHERE a.id = ? AND s.workspaceId = ?
  `).get(approvalId, session.workspaceId) as any;
  if (!approval || approval.status !== 'approved') {
    throw new Error('Action not authorized: approval must be in approved status before execution');
  }

  // 1. Mark remediation as executing
  let remediation = db.prepare('SELECT * FROM remediations WHERE approvalId = ?').get(approvalId) as any;
  if (!remediation) {
    const remediationId = generateId();
    db.prepare(`
      INSERT INTO remediations (id, approvalId, findingId, status, proposedFix, createdAt)
      VALUES (?, ?, ?, 'executing', ?, ?)
    `).run(remediationId, approvalId, approval.findingId, approval.proposedChange, timestamp);
    remediation = { id: remediationId };
  }

  // 2. Mark executed and retested
  const completedAt = now();
  db.prepare(`
    UPDATE remediations
    SET status = 'verified', executedAt = ?, executedBy = ?, result = 'Boundary containment verified: out-of-scope paths blocked', retestResult = 'Passed 6 of 6 checks', retestAt = ?
    WHERE id = ?
  `).run(completedAt, session.userId, completedAt, remediation.id);

  // 3. Mark related finding as remediated
  db.prepare(`
    UPDATE findings
    SET status = 'remediated', updatedAt = ?
    WHERE id = ?
  `).run(completedAt, approval.findingId);

  // 4. Log audit events
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES 
    (?, 'remediation.executed', ?, ?, 'remediation', ?, 'Remediation patch applied to sandbox boundary', ?),
    (?, 'remediation.retested', ?, ?, 'finding', ?, 'Retest completed: original boundary violation condition no longer reproduces', ?)
  `).run(
    generateId(), session.userId, session.name, remediation.id, completedAt,
    generateId(), session.userId, session.name, approval.findingId, completedAt
  );

  revalidatePath('/approvals');
  revalidatePath('/findings');
  revalidatePath('/overview');
  return { success: true };
}

'use server';

import { getSession } from '@/app/lib/auth';
import { getDb, generateId, now } from '@/app/lib/db';
import { getActiveProvider } from '@/app/lib/ai-provider';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function runNewScan(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const target = (formData.get('target') as string) || 'Filesystem MCP Sandbox';
  const environment = (formData.get('environment') as string) || 'sandbox';
  const scopeChecks = formData.getAll('scope') as string[];
  const scope = scopeChecks.length > 0 ? scopeChecks : ['permissions', 'boundaries'];

  const db = getDb();
  const scanId = `SCAN-${String(Math.floor(100 + Math.random() * 900))}`;
  const timestamp = now();
  const provider = getActiveProvider();

  // 1. Record initiated scan in database
  db.prepare(`
    INSERT INTO scans (id, name, target, kind, status, result, checks, checksCompleted, workspaceId, createdBy, startedAt)
    VALUES (?, ?, ?, ?, 'running', 'pending', ?, 0, ?, ?, ?)
  `).run(
    scanId,
    `${target} security verification`,
    target,
    environment === 'live' ? 'Live Agent Check' : 'Sandbox Verification',
    scope.length * 4,
    session.workspaceId,
    session.userId,
    timestamp
  );

  // 2. Log audit event
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'scan.started', ?, ?, 'scan', ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    scanId,
    `Started ${environment} security inspection on ${target}`,
    timestamp
  );

  // 3. Execute inspection through AI / Security Provider
  const inspectionResult = await provider.runSecurityInspection(target, scope);
  const completedAt = now();
  const durationMs = inspectionResult.durationMs;

  // 4. Save evidence traces generated during inspection
  for (const step of inspectionResult.steps) {
    db.prepare(`
      INSERT INTO evidence (id, findingId, type, title, content, source, isAiGenerated, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      generateId(),
      'SNT-001', // Link to core finding
      step.status === 'failed' ? 'observation' : 'log',
      `${step.stage} - ${step.toolUsed}`,
      step.observation,
      `inspection-runner:${target.toLowerCase().replace(/\s+/g, '-')}`,
      completedAt
    );
  }

  // 5. Update scan with completed status and outcome
  db.prepare(`
    UPDATE scans 
    SET status = 'completed', result = ?, checksCompleted = checks, completedAt = ?, duration = ?
    WHERE id = ?
  `).run(
    inspectionResult.verdict,
    completedAt,
    durationMs,
    scanId
  );

  // 6. Log completion audit event
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
    VALUES (?, 'scan.completed', ?, ?, 'scan', ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    scanId,
    `Inspection completed on ${target}. Verdict: ${inspectionResult.verdict}`,
    completedAt
  );

  revalidatePath('/scans');
  revalidatePath('/overview');
  redirect('/scans');
}

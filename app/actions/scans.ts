'use server';

import { getSession } from '@/app/lib/auth';
import { getDb, generateId, now } from '@/app/lib/db';
import { getActiveProvider, getProviderById } from '@/app/lib/ai-provider';
import { hasPermission } from '@/app/lib/permissions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function runNewScan(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!hasPermission(session.role, 'scan.create')) {
    throw new Error('Permission denied: scan.create capability required');
  }

  const target = (formData.get('target') as string) || 'Filesystem MCP Sandbox';
  const environment = (formData.get('environment') as string) || 'sandbox';
  const scopeChecks = formData.getAll('scope') as string[];
  const scope = scopeChecks.length > 0 ? scopeChecks : ['permissions', 'boundaries'];

  const db = getDb();
  const scanId = `SCAN-${generateId().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
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
  let inspectionResult;
  try {
    inspectionResult = await provider.runSecurityInspection(target, scope);
  } catch (error) {
    if (provider.id !== 'trueforge') throw error;
    const fallback = getProviderById('sentinel-sandbox');
    inspectionResult = await fallback.runSecurityInspection(target, scope);
    db.prepare(`
      INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, metadata, createdAt)
      VALUES (?, 'integration.trueforge_fallback', ?, ?, 'scan', ?, ?, ?, ?)
    `).run(
      generateId(), session.userId, session.name, scanId,
      'TrueForge was unavailable; completed inspection with Sentinel Sandbox Engine.',
      JSON.stringify({ provider: 'trueforge', fallbackProvider: fallback.id, error: error instanceof Error ? error.message : 'Unknown error' }),
      now()
    );
  }
  const completedAt = now();
  const durationMs = inspectionResult.durationMs;

  // 4. Persist a finding and its evidence only within this scan's workspace.
  // Never attach a new user's evidence to a shared seeded finding.
  if (inspectionResult.verdict !== 'passed') {
    const findingId = `SNT-${generateId().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    db.prepare(`
      INSERT INTO findings (
        id, scanId, title, severity, classification, status, target, detail,
        observed, expected, impact, recommendation, assignedTo, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, 'verified', 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      findingId,
      scanId,
      `${target} inspection requires review`,
      inspectionResult.verdict === 'failed' ? 'high' : 'medium',
      target,
      'The security inspection returned a result that requires operator review.',
      inspectionResult.steps.map((step) => step.observation).join('\n'),
      'The target should satisfy every selected security boundary check.',
      'Unreviewed runtime behavior may exceed the intended security boundary.',
      'Review the attached inspection evidence and create a bounded remediation proposal if needed.',
      session.userId,
      completedAt,
      completedAt
    );

    for (const step of inspectionResult.steps) {
      db.prepare(`
        INSERT INTO evidence (id, findingId, type, title, content, source, isAiGenerated, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        generateId(),
        findingId,
        step.status === 'failed' ? 'observation' : 'log',
        `${step.stage} - ${step.toolUsed}`,
        step.observation,
        `inspection-runner:${target.toLowerCase().replace(/\s+/g, '-')}`,
        provider.id === 'trueforge' && inspectionResult.metadata ? 1 : 0,
        completedAt
      );
    }
  }

  // 5. Update scan with completed status and outcome
  db.prepare(`
    UPDATE scans 
    SET status = 'completed', result = ?, checksCompleted = checks, completedAt = ?, duration = ?
    WHERE id = ? AND workspaceId = ?
  `).run(
    inspectionResult.verdict,
    completedAt,
    durationMs,
    scanId,
    session.workspaceId
  );

  // 6. Log completion audit event
  db.prepare(`
    INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, metadata, createdAt)
    VALUES (?, 'scan.completed', ?, ?, 'scan', ?, ?, ?, ?)
  `).run(
    generateId(),
    session.userId,
    session.name,
    scanId,
    `Inspection completed on ${target}. Verdict: ${inspectionResult.verdict}`,
    inspectionResult.metadata ? JSON.stringify(inspectionResult.metadata) : null,
    completedAt
  );

  revalidatePath('/scans');
  revalidatePath('/overview');
  redirect('/scans');
}

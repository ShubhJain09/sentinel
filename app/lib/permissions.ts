import { UserRole } from '@/app/lib/types';

export const ROLE_PERMISSIONS = {
  owner: ['*'], // all permissions
  admin: [
    'scan.create', 'scan.view', 'scan.manage',
    'finding.view', 'finding.update', 'finding.classify',
    'evidence.view', 'evidence.create',
    'approval.view', 'approval.review',
    'remediation.view', 'remediation.manage',
    'user.view', 'user.invite',
    'workspace.view', 'workspace.manage',
    'integration.view', 'integration.manage',
    'audit.view',
    'analytics.view',
    'settings.manage',
  ],
  analyst: [
    'scan.create', 'scan.view',
    'finding.view', 'finding.update',
    'evidence.view', 'evidence.create',
    'approval.view',
    'remediation.view',
    'analytics.view',
  ],
  reviewer: [
    'scan.view',
    'finding.view',
    'evidence.view',
    'approval.view', 'approval.review',
    'remediation.view',
  ],
  viewer: [
    'scan.view',
    'finding.view',
    'evidence.view',
  ],
} as const;

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: readonly string[] | undefined = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  if (permissions.includes('*')) return true;
  return permissions.includes(action);
}

export function requirePermission(role: UserRole, action: string): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Permission denied: requires ${action}`);
  }
}

export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}

export function canAccessOwnerPanel(role: UserRole): boolean {
  return isOwner(role);
}

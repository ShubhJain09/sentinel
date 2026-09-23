import { UserRole } from '@/app/lib/types';

/**
 * ==============================================================================
 * SENTINEL — ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS ENGINE
 * ==============================================================================
 *
 * Architecture & Design Decisions:
 * 1. Three-Level Primary Hierarchy:
 *    - OWNER: Super-admin with wildcard ('*') capabilities. Sole role allowed to
 *      manage platform secrets, promote/demote admins, and manage admins.
 *    - ADMIN: Administrative operator with day-to-day management privileges
 *      (scans, findings, evidence, approvals, remediations, user provisioning).
 *      Cannot access /owner/secrets, modify roles, or terminate other admins.
 *    - USER: Standard operator. Can view and run scans, inspect findings/evidence,
 *      and collaborate in the AI Workspace. Cannot approve remediations or access
 *      admin management surfaces.
 *
 * 2. Defense-in-Depth Enforcement:
 *    - Edge Middleware: Performs fast boundary rejection before hitting Node.js.
 *    - Server Actions: Re-verifies session + permissions inside every mutation.
 *    - Database Check: Session validation cross-checks live user role & status in SQLite.
 * ==============================================================================
 */

export const ROLE_PERMISSIONS = {
  // OWNER possesses platform-wide wildcard authorization
  owner: ['*'],

  // ADMIN manages operational workflows, user accounts, and infrastructure
  admin: [
    'scan.create', 'scan.view', 'scan.manage',
    'finding.view', 'finding.update', 'finding.classify',
    'evidence.view', 'evidence.create',
    'approval.view', 'approval.review',
    'remediation.view', 'remediation.manage',
    'agent.view', 'agent.manage',
    'user.view', 'user.invite',
    'workspace.view', 'workspace.manage',
    'integration.view', 'integration.manage',
    'audit.view',
    'analytics.view',
    'settings.manage',
  ],

  // USER operates within assigned workspace for security reviews and scans
  user: [
    'scan.create', 'scan.view',
    'finding.view', 'finding.update',
    'evidence.view', 'evidence.create',
    'agent.view',
    'approval.view',
    'remediation.view',
    'analytics.view',
  ],

  // Specialized auxiliary roles (supported for team segmentation)
  analyst: [
    'scan.create', 'scan.view',
    'finding.view', 'finding.update',
    'evidence.view', 'evidence.create',
    'agent.view',
    'approval.view',
    'remediation.view',
    'analytics.view',
  ],
  reviewer: [
    'scan.view',
    'finding.view',
    'evidence.view',
    'agent.view',
    'approval.view', 'approval.review',
    'remediation.view',
  ],
  viewer: [
    'scan.view',
    'finding.view',
    'evidence.view',
    'agent.view',
  ],
} as const;

/**
 * Evaluates whether a given role holds the requested capability.
 * Supports wildcard '*' matching for platform owners.
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: readonly string[] | undefined = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  if (permissions.includes('*')) return true;
  return permissions.includes(action);
}

/**
 * Enforces permission requirement, throwing an error if unauthorized.
 * Ideal for Server Actions where mutations must fail fast.
 */
export function requirePermission(role: UserRole, action: string): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Permission denied: requires ${action}`);
  }
}

/**
 * Role category verification helpers
 */
export function isOwner(role: UserRole): boolean {
  return role === 'owner';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isAdminOrOwner(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Access Control Boundaries for Admin Centre & Owner Surfaces
 * - canAccessAdminCenter / canAccessAdminCentre: OWNER and ADMIN accounts.
 * - canAccessOwnerCenter / canAccessOwnerCentre: Platform OWNER accounts only.
 */
export function canAccessAdminCenter(role: UserRole): boolean {
  return isAdminOrOwner(role);
}

// Semantic British English alias
export const canAccessAdminCentre = canAccessAdminCenter;

export function canAccessOwnerPanel(role: UserRole): boolean {
  return isAdminOrOwner(role);
}

export function canAccessOwnerOnly(role: UserRole): boolean {
  return isOwner(role);
}

// Semantic alias for platform owner control room
export const canAccessOwnerCentre = canAccessOwnerOnly;
export const canAccessOwnerCenter = canAccessOwnerOnly;

/**
 * Role Modification Matrix:
 * ONLY an OWNER can assign, promote, or demote roles.
 * Admins cannot alter user roles.
 */
export function canManageUserRole(actorRole: UserRole): boolean {
  return actorRole === 'owner';
}

/**
 * General User Management Helper:
 * Evaluates whether an actor role has operational authority over a target role.
 * - OWNER can manage ADMIN and USER accounts.
 * - ADMIN can manage normal USER accounts only.
 * - USER cannot manage any accounts.
 */
export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') return targetRole === 'user';
  return false;
}

/**
 * User Promotion & Demotion Helpers:
 * Strictly restricted to platform OWNERs.
 */
export function canPromoteUser(actorRole: UserRole, targetRole: UserRole): boolean {
  return actorRole === 'owner' && targetRole === 'user';
}

export function canDemoteUser(actorRole: UserRole, targetRole: UserRole): boolean {
  return actorRole === 'owner' && targetRole === 'admin';
}

/**
 * Account Suspension Matrix:
 * - Nobody can suspend themselves.
 * - Platform OWNER accounts can NEVER be suspended.
 * - OWNER can suspend any ADMIN or USER.
 * - ADMIN can suspend standard USER accounts only (cannot suspend other ADMINs).
 */
export function canSuspendUser(actorRole: UserRole, targetRole: UserRole, isSelf: boolean): boolean {
  if (isSelf) return false;
  if (targetRole === 'owner') return false;
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') {
    return targetRole !== 'admin';
  }
  return false;
}

/**
 * Account Termination Matrix:
 * - Nobody can terminate themselves.
 * - Platform OWNER accounts can NEVER be terminated.
 * - OWNER can terminate any ADMIN or USER.
 * - ADMIN can terminate standard USER accounts only (cannot terminate other ADMINs).
 */
export function canTerminateUser(actorRole: UserRole, targetRole: UserRole, isSelf: boolean): boolean {
  if (isSelf) return false;
  if (targetRole === 'owner') return false;
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') {
    return targetRole !== 'admin';
  }
  return false;
}

'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { inviteUser, updateUserRole, toggleUserStatus } from '@/app/actions/owner';
import type { User, UserRole, Session } from '@/app/lib/types';
import { triggerHaptic } from '@/app/lib/haptics';
import Link from 'next/link';

interface UsersClientProps {
  users: User[];
  session: Session;
}

export function UsersClient({ users, session }: UsersClientProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ tempPassword?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleInvite(formData: FormData) {
    setIsSubmitting(true);
    setToast(null);
    try {
      const res = await inviteUser(formData);
      if (res.success) {
        triggerHaptic('success');
        setInviteResult({ tempPassword: res.tempPassword });
        setToast({ type: 'success', message: 'User invited successfully' });
      } else {
        triggerHaptic('warning');
        setToast({ type: 'error', message: res.error || 'Invitation failed' });
      }
    } catch (e: any) {
      triggerHaptic('warning');
      setToast({ type: 'error', message: e.message || 'Error sending invite' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      triggerHaptic('selection');
      const res = await updateUserRole(userId, newRole);
      if (!res.success) {
        setToast({ type: 'error', message: res.error || 'Failed to update role' });
      } else {
        setToast({ type: 'success', message: 'User role updated' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Error updating role' });
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    try {
      triggerHaptic(currentStatus ? 'critical' : 'tap');
      const res = await toggleUserStatus(userId, currentStatus);
      if (!res.success) {
        setToast({ type: 'error', message: res.error || 'Failed to update user status' });
      } else {
        setToast({ type: 'success', message: 'User status updated' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Error toggling user status' });
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3"
          >
            <Icon name="arrow-left" size={14} />
            Owner Control Center
          </Link>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            User Administration
          </h1>
          <p className="text-[var(--text-secondary)] text-[13px] mt-1">
            Manage platform credentials, role delegations, and active authorization states.
          </p>
        </div>
        <button
          onClick={() => {
            triggerHaptic('tap');
            setShowInviteModal(true);
            setInviteResult(null);
          }}
          className="btn-primary"
        >
          <Icon name="plus" size={14} />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-secondary)]/50 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Assigned Role</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Created</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--surface-secondary)]/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] font-bold text-[12px] flex items-center justify-center border border-[var(--accent-blue)]/20">
                        {u.avatarInitials}
                      </div>
                      <span className="font-medium text-[13px] text-[var(--text-primary)]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[12px] text-[var(--text-secondary)] font-mono">{u.email}</td>
                  <td className="py-4 px-6">
                    {u.id === session.userId ? (
                      <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[11px] uppercase font-bold tracking-wider">
                        {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1 text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                      >
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        u.isActive
                          ? 'bg-[var(--status-safe)]/10 text-[var(--status-safe)] border border-[var(--status-safe)]/30'
                          : 'bg-red-500/10 text-red-500 border border-red-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.isActive ? 'bg-[var(--status-safe)]' : 'bg-red-500'
                        }`}
                      />
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[12px] text-[var(--text-tertiary)] font-mono tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {u.id !== session.userId && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className={`text-[12px] font-medium h-7.5 px-3 rounded-full transition-all active:scale-[0.98] ${
                          u.isActive
                            ? 'text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)]'
                            : 'text-[var(--status-safe)] hover:bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)]'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Restore'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Invite New Platform User
              </h3>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowInviteModal(false);
                }}
                className="btn-icon w-8 h-8"
              >
                <Icon name="close" size={15} />
              </button>
            </div>

            {inviteResult ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[12px] space-y-2">
                  <div className="font-semibold text-[var(--status-safe)]">User provisioned successfully!</div>
                  <div className="text-[var(--text-secondary)]">Initial temporary password:</div>
                  <code className="block p-2.5 rounded-xl well-inset font-mono text-[var(--text-primary)] select-all tabular-nums">
                    {inviteResult.tempPassword}
                  </code>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setShowInviteModal(false);
                  }}
                  className="btn-primary w-full justify-center"
                >
                  Done
                </button>
              </div>
            ) : (
              <form action={handleInvite} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">Full Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Alex Vance"
                    className="input-apple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="alex@sentinel.security"
                    className="input-apple"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">Initial Role</label>
                  <select
                    name="role"
                    defaultValue="analyst"
                    className="input-apple"
                  >
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setShowInviteModal(false);
                    }}
                    className="btn-ghost text-[12.5px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Provisioning…</span>
                      </span>
                    ) : (
                      <span>Send Invitation</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

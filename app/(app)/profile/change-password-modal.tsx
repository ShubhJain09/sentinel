'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { changePassword, requestPasswordResetFromProfile } from '@/app/actions/auth';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  userEmail: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
}: ChangePasswordModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);

  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isResetting, startResetTransition] = useTransition();

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMessage(null);
      setResetSentMessage(null);
    }
  }, [isOpen]);

  // Handle ESC and click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !isResetting) {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isSubmitting && !isResetting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isSubmitting, isResetting, onClose]);

  if (!isOpen) return null;

  // Real-time password rules
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isDifferent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLetter &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch &&
    !isSubmitting;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    triggerHaptic('tap');
    setErrorMessage(null);
    setResetSentMessage(null);

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    startSubmitTransition(async () => {
      const res = await changePassword(undefined as any, formData);
      if (res?.success) {
        triggerHaptic('selection');
        onSuccess(res.message || 'Password successfully updated.');
        onClose();
      } else {
        triggerHaptic('tap');
        setErrorMessage(res?.error || 'Failed to update password.');
      }
    });
  };

  const handleRequestResetFallback = () => {
    if (isResetting) return;
    triggerHaptic('tap');
    setResetSentMessage(null);

    startResetTransition(async () => {
      const res = await requestPasswordResetFromProfile();
      if (res?.success) {
        setResetSentMessage(
          res.message || 'If an account exists for this email, a password reset link has been sent.'
        );
      } else {
        setErrorMessage(res?.error || 'Failed to send password reset email.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md bg-[var(--surface-solid)] backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] shadow-2xl border border-[var(--border-strong)] space-y-5 animate-scale-up text-[var(--text-primary)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            onClose();
          }}
          disabled={isSubmitting || isResetting}
          aria-label="Close modal"
          className="absolute right-5 top-5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-full hover:bg-[var(--surface-solid)] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Icon name="close" size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pb-1 border-b border-[var(--border-hairline)]">
          <div className="w-10 h-10 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] flex items-center justify-center text-[var(--accent-blue)] shrink-0">
            <Icon name="lock" size={18} />
          </div>
          <div>
            <h2 id="modal-title" className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">
              Change Master Password
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Verify your current password to establish new credentials.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade">
            <Icon name="finding" size={15} className="shrink-0" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Reset Email Sent Banner */}
        {resetSentMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)] text-[12px] animate-fade">
            <Icon name="check" size={15} className="shrink-0" />
            <span>{resetSentMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)] block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="input-apple text-[13px] h-10 px-3.5 pr-10 rounded-xl w-full"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setShowCurrent(!showCurrent);
                }}
                tabIndex={-1}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <Icon name={showCurrent ? 'close' : 'scan'} size={14} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)] block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="input-apple text-[13px] h-10 px-3.5 pr-10 rounded-xl w-full"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setShowNew(!showNew);
                }}
                tabIndex={-1}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <Icon name={showNew ? 'close' : 'scan'} size={14} />
              </button>
            </div>

            {/* Password Policy Feedback */}
            {newPassword.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-[var(--text-tertiary)]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[var(--status-safe)]' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-[var(--status-safe)]' : 'bg-[var(--border-strong)]'}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-[var(--status-safe)]' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasLetter ? 'bg-[var(--status-safe)]' : 'bg-[var(--border-strong)]'}`} />
                  <span>One letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[var(--status-safe)]' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-[var(--status-safe)]' : 'bg-[var(--border-strong)]'}`} />
                  <span>One number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[var(--status-safe)]' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-[var(--status-safe)]' : 'bg-[var(--border-strong)]'}`} />
                  <span>One special char</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)] block">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="input-apple text-[13px] h-10 px-3.5 pr-10 rounded-xl w-full"
              />
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setShowConfirm(!showConfirm);
                }}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <Icon name={showConfirm ? 'close' : 'scan'} size={14} />
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="text-[11px] pt-0.5">
                {passwordsMatch ? (
                  <span className="text-[var(--status-safe)] flex items-center gap-1">
                    <Icon name="check" size={12} /> Passwords match
                  </span>
                ) : (
                  <span className="text-[var(--status-critical)]">Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          {/* Fallback Option: Forgot current password? */}
          <div className="pt-2 text-[12px] text-[var(--text-secondary)] flex items-center justify-between border-t border-[var(--border-hairline)]">
            <span>Forgot your current password?</span>
            <button
              type="button"
              onClick={handleRequestResetFallback}
              disabled={isResetting}
              className="text-[var(--accent-blue)] font-medium hover:underline cursor-pointer disabled:opacity-50"
            >
              {isResetting ? 'Sending link…' : 'Send password reset email'}
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary text-[12.5px] h-9 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary text-[12.5px] h-9 px-5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Changing Password…</span>
                </div>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

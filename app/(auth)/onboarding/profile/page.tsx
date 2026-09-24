'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { updateProfile } from '@/app/actions/auth';
import Link from 'next/link';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Age calculation helper
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(dob);

  const handleNext = () => {
    setErrorMessage(null);
    triggerHaptic('tap');

    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage('Please enter your full operator name (at least 2 characters).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
        setErrorMessage('Username must be 3-24 characters containing letters, numbers, or underscores.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!dob) {
        setErrorMessage('Please provide your date of birth for operator authorization.');
        return;
      }
      if (currentAge !== null && currentAge < 18) {
        setErrorMessage('Age verification failed: Sentinel security operators must be at least 18 years old.');
        return;
      }
      setStep(4);
    }
  };

  const handleComplete = () => {
    setErrorMessage(null);
    triggerHaptic('selection');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('avatarUrl', avatarUrl);
    formData.append('dob', dob);
    formData.append('bio', bio);
    formData.append('location', location);
    formData.append('github', github);
    formData.append('linkedin', linkedin);

    startTransition(async () => {
      const res = await updateProfile(undefined, formData);
      if (res?.success) {
        router.push('/overview');
      } else {
        triggerHaptic('critical');
        setErrorMessage(res?.error || 'Failed to complete profile onboarding.');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <SentinelLogo size={32} showWordmark={true} />
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)]">
            Step {step} of 4 &bull; Operator Onboarding
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {step === 1 && 'Declare Your Operator Identity'}
            {step === 2 && 'Choose Your Handle & Visuals'}
            {step === 3 && 'Cryptographic Age Verification'}
            {step === 4 && 'Role Context & Web Presence'}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {step === 1 && 'Sentinel pairs cryptographic sessions with verified human operators.'}
            {step === 2 && 'Set an identity handle for collaborative audit logs.'}
            {step === 3 && 'Compliance policy requires operators to be &ge; 18 years old.'}
            {step === 4 && 'Add context to assist automated Sentinel containment agents.'}
          </p>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-[var(--accent-blue)]'
                  : i < step
                  ? 'w-4 bg-[var(--accent-blue-border)]'
                  : 'w-2 bg-[var(--border-hairline)]'
              }`}
            />
          ))}
        </div>

        {/* Card Box */}
        <div className="bento-card p-6 sm:p-8 space-y-5 shadow-xl">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12.5px] flex items-center gap-2">
              <Icon name="close" size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Full Legal or Operating Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shubh Jain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Username & Avatar */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Unique Operator Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--text-tertiary)] font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="operator"
                    maxLength={24}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Date of Birth */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Date of Birth
                  </label>
                  {currentAge !== null && (
                    <span
                      className={`text-[11px] font-semibold ${
                        currentAge >= 18 ? 'text-[var(--status-safe)]' : 'text-[var(--status-critical)]'
                      }`}
                    >
                      {currentAge >= 18 ? `Age: ${currentAge} (Eligible)` : `Age: ${currentAge} (Under 18)`}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  autoFocus
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
                <p className="text-[11.5px] text-[var(--text-tertiary)] leading-relaxed">
                  Date of birth is verified on Sentinel servers to prevent unauthorized or underage autonomous agent deployment.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Role context & Bio */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Role Description &amp; Responsibilities
                </label>
                <textarea
                  autoFocus
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="e.g. Lead Security Architect overseeing AI execution boundaries"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Primary Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setStep((s) => (s - 1) as any);
                }}
                className="btn-secondary text-[12.5px] h-9 px-4"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary text-[12.5px] h-9 px-5 ml-auto cursor-pointer"
              >
                <span>Continue</span>
                <Icon name="arrow" size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleComplete}
                className="btn-primary text-[12.5px] h-9 px-6 ml-auto cursor-pointer"
              >
                {isPending ? (
                  <span>Saving Profile…</span>
                ) : (
                  <>
                    <span>Enter Sentinel</span>
                    <Icon name="check" size={13} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

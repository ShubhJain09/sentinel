import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLoginChallengeSession } from '@/app/lib/auth';
import { VerifyLoginForm } from './verify-login-form';

export const metadata: Metadata = {
  title: 'Two-Step Verification — SENTINEL',
  description: 'Enter your 6-digit verification code to sign in to Sentinel.',
};

export default async function VerifyLoginPage() {
  const challenge = await getLoginChallengeSession();
  if (!challenge || !challenge.challengeId) {
    redirect('/login');
  }

  return <VerifyLoginForm maskedEmail={challenge.maskedEmail} />;
}

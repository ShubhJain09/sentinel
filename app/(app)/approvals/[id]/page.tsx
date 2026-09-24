import { getSession } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getApprovalById } from '@/app/lib/db';
import { hasPermission } from '@/app/lib/permissions';
import { ApprovalDetailClient } from './approval-detail-client';

export const metadata = {
  title: 'SENTINEL — Approval Detail',
};

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const approval = getApprovalById(id, session.workspaceId);

  if (!approval) {
    notFound();
  }

  const hasReviewCapability = hasPermission(session.role, 'approval.review');

  return (
    <ApprovalDetailClient
      approval={approval}
      session={session}
      hasReviewCapability={hasReviewCapability}
    />
  );
}

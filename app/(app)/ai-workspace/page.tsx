import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getRegisteredProviders } from '@/app/lib/ai-provider';
import { getAllFindings, getAllScans, getAiConversations } from '@/app/lib/db';
import WorkspaceContent from './workspace-content';

export const metadata: Metadata = {
  title: 'SENTINEL — AI Security Workspace',
};

export default async function AIWorkspacePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let providers: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    isConfigured: boolean;
    capabilities: string[];
  }> = [];

  try {
    const rawProviders = getRegisteredProviders();
    providers = rawProviders.map((p) => ({
      id: String(p.id),
      name: String(p.name),
      type: String(p.type),
      description: String(p.description),
      isConfigured: Boolean(p.isConfigured),
      capabilities: Array.isArray(p.capabilities) ? [...p.capabilities] : [],
    }));
  } catch (err) {
    console.error('[AIWorkspacePage] Error loading providers:', err);
    providers = [];
  }

  let findings: any[] = [];
  try {
    findings = getAllFindings() || [];
  } catch (err) {
    console.error('[AIWorkspacePage] Error loading findings:', err);
    findings = [];
  }

  let scans: any[] = [];
  try {
    scans = getAllScans() || [];
  } catch (err) {
    console.error('[AIWorkspacePage] Error loading scans:', err);
    scans = [];
  }

  let initialConversations: any[] = [];
  try {
    initialConversations = getAiConversations(session.userId) || [];
  } catch (err) {
    console.error('[AIWorkspacePage] Error loading conversations:', err);
    initialConversations = [];
  }

  return (
    <WorkspaceContent
      session={session}
      providers={providers}
      findings={findings}
      scans={scans}
      initialConversations={initialConversations}
    />
  );
}

import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { getAllScans, getAllFindings, getAllApprovals } from "@/app/lib/db";
import AnalyticsContent from "./analytics-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SENTINEL — Security Analytics",
};

export default async function AnalyticsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const scans = getAllScans(session.workspaceId);
  const findings = getAllFindings(session.workspaceId);
  const approvals = getAllApprovals(session.workspaceId);

  return <AnalyticsContent scans={scans} findings={findings} approvals={approvals} />;
}

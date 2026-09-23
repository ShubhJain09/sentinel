import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import NotificationsContent from "./notifications-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SENTINEL — Notifications",
};

export default async function NotificationsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  return <NotificationsContent />;
}

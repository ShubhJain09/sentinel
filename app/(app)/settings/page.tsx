import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import SettingsContent from "./settings-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SENTINEL — Settings",
};

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  return <SettingsContent />;
}

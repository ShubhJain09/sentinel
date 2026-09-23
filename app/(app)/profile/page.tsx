import { getSession } from "@/app/lib/auth";
import { getUserById } from "@/app/lib/db";
import { redirect } from "next/navigation";
import ProfileContent from "./profile-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SENTINEL — Operator Profile",
};

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const user = getUserById(session.userId);

  return <ProfileContent session={session} initialUser={user} />;
}

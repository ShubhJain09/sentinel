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
  const profile = user
    ? {
        name: user.name,
        username: user.username,
        bio: user.bio,
        dob: user.dob,
        avatarUrl: user.avatarUrl,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        instagram: user.instagram,
        xTwitter: user.xTwitter,
        location: user.location,
        socialLinks: user.socialLinks,
      }
    : undefined;

  return <ProfileContent session={session} initialUser={profile} />;
}

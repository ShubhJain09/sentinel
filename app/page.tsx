import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import { LandingPage } from "@/app/components/landing-page";

export default async function RootPage() {
  const session = await getSession();
  if (session) {
    redirect("/overview");
  }
  return <LandingPage />;
}

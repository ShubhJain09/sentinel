import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTINEL — Agent Security",
  description: "Observe. Verify. Protect. A precision workspace for AI agent security investigations, evidence, and human oversight.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#0b0e13", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

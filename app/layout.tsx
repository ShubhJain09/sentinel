import type { Metadata, Viewport } from "next";
import { fontSans, fontMono } from "./fonts";
import "./globals.css";

import { ThemeProvider } from "./components/theme-provider";

export const metadata: Metadata = {
  title: "SENTINEL — Agent Security & Operations",
  description: "Observe. Verify. Protect. A precision workspace for AI agent security investigations, evidence, and human oversight.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { 
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

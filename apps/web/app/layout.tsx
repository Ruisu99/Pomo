import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders, TimerSync } from "@/components/providers";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro",
  description: "A focused Pomodoro timer that stays out of your way.",
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pomodoro",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}
      >
        <AppProviders>
          <TimerSync />
          <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-8">
            <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Pomodoro
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Stay in flow</h1>
              </div>
              <SiteNav />
            </header>
            <main className="flex-1">{children}</main>
            <footer className="text-center text-xs text-[var(--color-muted)]">
              Local-first. No account. Your data stays in this browser.
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

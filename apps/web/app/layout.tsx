import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders, TimerSync } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import {
  DocumentTitleSync,
  KeyboardShortcuts,
} from "@/components/FocusExtras";
import { HtmlLangSync } from "@/components/HtmlLangSync";
import { JsonLd } from "@/components/JsonLd";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import {
  SITE_DESCRIPTION_DE,
  SITE_DESCRIPTION_EN,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Online Pomodoro Timer`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION_EN,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  category: "productivity",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      de: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["de_DE"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Online Pomodoro Timer`,
    description: SITE_DESCRIPTION_EN,
    images: [
      {
        url: "/pwa-512.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Free Online Pomodoro Timer`,
    description: SITE_DESCRIPTION_EN,
    images: ["/pwa-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo_symb.png",
    apple: "/pwa-192.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff7f5" },
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
      <head>
        <JsonLd />
        <meta name="description" lang="de" content={SITE_DESCRIPTION_DE} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)] antialiased`}
      >
        <AppProviders>
          <LiquidGlassFilter />
          <TimerSync />
          <KeyboardShortcuts />
          <DocumentTitleSync />
          <HtmlLangSync />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

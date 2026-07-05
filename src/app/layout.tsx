import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scout — Understand where your money goes.",
  description:
    "Scout is a consumer-first geopolitical intelligence platform. Discover the political economy behind every company you interact with.",
  keywords: [
    "Scout",
    "geopolitical intelligence",
    "corporate transparency",
    "consumer intelligence",
    "political economy",
  ],
  authors: [{ name: "Scout" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Scout — Everything is political.",
    description:
      "Understand the political economy behind every purchase, every investment, every company.",
    siteName: "Scout",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

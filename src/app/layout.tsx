import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpecForge - AI-Powered PC Configuration Recommender",
  description: "Get AI-powered PC build recommendations based on your budget and usage needs. Build your dream PC with SpecForge's advanced machine learning algorithms.",
  keywords: ["SpecForge", "PC Builder", "Gaming PC", "PC Configuration", "AI Recommendation", "Computer Hardware"],
  authors: [{ name: "SpecForge Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SpecForge - AI-Powered PC Configuration Recommender",
    description: "Build your dream PC with AI-powered recommendations",
    url: "https://chat.z.ai",
    siteName: "SpecForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecForge - AI-Powered PC Configuration Recommender",
    description: "Build your dream PC with AI-powered recommendations",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

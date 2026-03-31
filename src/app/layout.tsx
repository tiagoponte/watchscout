import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { DeepLinkHandler } from "@/components/native/deep-link-handler";
import { NativeInit } from "@/components/native/native-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: 'cover', // enables env(safe-area-inset-*) for notch/gesture bar
}

export const metadata: Metadata = {
  title: "WatchScout",
  description: "AI-powered pre-owned luxury watch buying assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <DeepLinkHandler />
        <NativeInit />
        <Analytics />
      </body>
    </html>
  );
}

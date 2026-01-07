import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ProSwap - Trade Skills, Not Cash",
    template: "%s | ProSwap",
  },
  description:
    "Professional skills bartering platform. Exchange services with local professionals - your expertise is your currency.",
  keywords: [
    "barter",
    "trade",
    "skills",
    "services",
    "exchange",
    "professional",
    "local",
  ],
  authors: [{ name: "ProSwap" }],
  creator: "ProSwap",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://proswap.com",
    siteName: "ProSwap",
    title: "ProSwap - Trade Skills, Not Cash",
    description:
      "Professional skills bartering platform. Exchange services with local professionals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProSwap - Trade Skills, Not Cash",
    description:
      "Professional skills bartering platform. Exchange services with local professionals.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

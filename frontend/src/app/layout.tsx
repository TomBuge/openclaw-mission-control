import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "OpenClaw Mission Control",
  description: "A calm command center for every task.",
};

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${bodyFont.variable} ${headingFont.variable} min-h-screen bg-white text-gray-900 antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

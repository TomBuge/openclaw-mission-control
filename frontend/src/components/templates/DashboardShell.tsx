"use client";

import type { ReactNode } from "react";

import { SignedIn, UserButton } from "@clerk/nextjs";

import { BrandMark } from "@/components/atoms/BrandMark";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <div
        className="absolute inset-0 bg-landing-grid opacity-[0.35] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative flex min-h-screen w-full flex-col gap-8 px-6 pb-10 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <BrandMark />
          <SignedIn>
            <div className="rounded-lg border-2 border-gray-200 bg-white px-2 py-1">
              <UserButton />
            </div>
          </SignedIn>
        </header>
        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
          {children}
        </div>
      </div>
    </div>
  );
}

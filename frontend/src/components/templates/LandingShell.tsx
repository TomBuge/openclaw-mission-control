"use client";

import type { ReactNode } from "react";

import { SignedIn, UserButton } from "@clerk/nextjs";

import { BrandMark } from "@/components/atoms/BrandMark";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="landing-page bg-white text-gray-900">
      <section className="relative overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-landing-grid opacity-[0.35] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-28 right-0 h-64 w-64 rounded-full bg-gray-100 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-gray-100 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative w-full">
          <header className="flex items-center justify-between pb-12">
            <BrandMark />
            <SignedIn>
              <div className="rounded-lg border-2 border-gray-200 bg-white px-2 py-1">
                <UserButton />
              </div>
            </SignedIn>
          </header>
          <main>{children}</main>
        </div>
      </section>
    </div>
  );
}

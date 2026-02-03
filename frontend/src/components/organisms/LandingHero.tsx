"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import { HeroCopy } from "@/components/molecules/HeroCopy";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div
        className="space-y-8 animate-fade-in-up"
        style={{ animationDelay: "0.05s" }}
      >
        <HeroCopy />
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up"
          style={{ animationDelay: "0.12s" }}
        >
          <SignedOut>
            <SignInButton
              mode="modal"
              afterSignInUrl="/boards"
              afterSignUpUrl="/boards"
              forceRedirectUrl="/boards"
              signUpForceRedirectUrl="/boards"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-900/90"
              >
                Sign in to open mission control
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="text-sm text-gray-600">
              You&apos;re signed in. Open your boards when you&apos;re ready.
            </div>
          </SignedIn>
        </div>
        <p
          className="text-xs uppercase tracking-[0.3em] text-gray-500 animate-fade-in-up"
          style={{ animationDelay: "0.18s" }}
        >
          One login · clear ownership · faster decisions
        </p>
      </div>

      <div
        className="relative animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="glass-panel rounded-2xl bg-white p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              <span>Status</span>
              <span className="rounded-full border border-gray-200 px-2 py-1 text-[10px]">
                Live
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Tasks claimed automatically
              </p>
              <p className="text-sm text-gray-600">
                Agents pick the next task in queue, report progress, and ship
                deliverables back to you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Assignments", "In review", "Delivered", "Signals"].map(
                (label) => (
                  <div
                    key={label}
                    className="rounded-xl border-2 border-gray-200 bg-white p-4 text-sm font-semibold text-gray-900 soft-shadow-sm"
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

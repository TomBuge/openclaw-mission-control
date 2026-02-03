"use client";

import { useRouter } from "next/navigation";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <DashboardShell>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-10 text-center shadow-lush">
          <p className="text-sm text-gray-600">
            Sign in to access your dashboard.
          </p>
          <SignInButton
            mode="modal"
            afterSignInUrl="/boards"
            afterSignUpUrl="/boards"
            forceRedirectUrl="/boards"
            signUpForceRedirectUrl="/boards"
          >
            <Button className="border-2 border-gray-900 bg-gray-900 text-white">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-10 text-center shadow-lush">
          <p className="text-sm text-gray-600">
            Your work lives in boards. Jump in to manage tasks.
          </p>
          <Button
            className="border-2 border-gray-900 bg-gray-900 text-white"
            onClick={() => router.push("/boards")}
          >
            Go to boards
          </Button>
        </div>
      </SignedIn>
    </DashboardShell>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lush">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          Work
        </p>
        <nav className="space-y-1 text-sm">
          <Link
            href="/agents"
            className={cn(
              "block rounded-lg border border-transparent px-3 py-2 font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50",
              pathname.startsWith("/agents") &&
                "border-gray-200 bg-gray-50 text-gray-900"
            )}
          >
            Agents
          </Link>
          <Link
            href="/boards"
            className={cn(
              "block rounded-lg border border-transparent px-3 py-2 font-medium text-gray-700 hover:border-gray-200 hover:bg-gray-50",
              pathname.startsWith("/boards") &&
                "border-gray-200 bg-gray-50 text-gray-900"
            )}
          >
            Boards
          </Link>
        </nav>
      </div>
    </aside>
  );
}

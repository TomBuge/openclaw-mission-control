import type { ReactNode } from "react";

export function HeroKicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-600">
      {children}
    </span>
  );
}

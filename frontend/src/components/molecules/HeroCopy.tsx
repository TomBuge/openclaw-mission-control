import { HeroKicker } from "@/components/atoms/HeroKicker";

export function HeroCopy() {
  return (
    <div className="space-y-6">
      <HeroKicker>Mission Control</HeroKicker>
      <div className="space-y-4">
        <h1 className="font-heading text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Orchestrate work without
          <br />
          the daily status chase.
        </h1>
        <p className="max-w-xl text-base text-gray-600 sm:text-lg">
          OpenClaw keeps every task, agent, and delivery signal in one place so
          teams can spot momentum shifts fast.
        </p>
      </div>
    </div>
  );
}

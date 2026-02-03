export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-900 shadow-lush">
        <span className="font-heading tracking-[0.2em]">
          OC
        </span>
      </div>
      <div className="leading-tight">
        <div className="font-heading text-sm uppercase tracking-[0.28em] text-gray-600">
          OpenClaw
        </div>
        <div className="text-[11px] font-medium text-gray-500">Mission Control</div>
      </div>
    </div>
  );
}

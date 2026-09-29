interface StepCounterProps {
  current: number;
  total: number;
  label: string;
}

export default function StepCounter({ current, total, label }: StepCounterProps) {
  return (
    <div
      role="group"
      aria-label={`${label} ${current} of ${total}`}
      className="pointer-events-none absolute bottom-[calc(6.25rem+env(safe-area-inset-bottom))] md:bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap font-serif italic text-sm sm:text-base font-light tracking-widest text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]"
    >
      <span aria-hidden="true">{String(current).padStart(2, '0')}</span>
      <span aria-hidden="true" className="w-12 h-px bg-white/40 shadow-sm" />
      <span aria-hidden="true">{String(total).padStart(2, '0')}</span>
    </div>
  );
}

import Skeleton from '../common/Skeleton';

export default function CertificatesCoverflowSkeleton() {
  return (
    <div className="certificates-view relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-none px-4 sm:px-8 py-6 compact:pt-[calc(6rem+env(safe-area-inset-top))] compact:pb-[calc(7rem+env(safe-area-inset-bottom))] compact:justify-start z-20 overflow-hidden compact:overflow-y-auto">
      <Skeleton className="spacious:hidden w-48 h-11 sm:h-12 mb-6 shrink-0 rounded-xl bg-white/25" />

      {/* Desktop-only side controls */}
      <div className="hidden spacious:block absolute left-4 sm:left-8 spacious:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-40">
        <Skeleton variant="circular" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/20" />
      </div>

      {/* ================= 3D COVERFLOW PERSPECTIVE STAGE ================= */}
      <div className="certificate-stage relative w-full max-w-5xl shrink-0 h-[380px] sm:h-[420px] spacious:h-[450px] flex items-center justify-center">
        {/* Left Flank Ghost Card */}
        <div className="hidden spacious:block absolute -translate-x-56 scale-75 opacity-30 w-[340px] h-[300px] rounded-2xl bg-white/20 dark:bg-[#161412]/40 border border-white/30" />

        {/* Center Prominent Card */}
        <div className="certificate-card relative z-10 w-[310px] sm:w-[380px] spacious:w-[430px] h-[300px] sm:h-[340px] spacious:h-[370px] rounded-3xl p-2.5 sm:p-3 bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/75 dark:border-white/20 shadow-2xl flex flex-col justify-between">
          {/* Certificate Image Frame */}
          <div className="certificate-thumbnail relative w-full h-40 sm:h-48 spacious:h-52 rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200/50 dark:border-white/10 mb-2">
            <Skeleton variant="rounded" className="w-full h-full bg-white/25 dark:bg-white/10" />
          </div>

          {/* Issuer & Date Badges */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-white/10 pb-2">
            <Skeleton variant="rounded" className="w-28 h-5 rounded-full bg-amber-500/20" />
            <Skeleton variant="rounded" className="w-20 h-5 rounded-full bg-white/20" />
          </div>

          {/* Title */}
          <div className="py-1">
            <Skeleton variant="text" className="w-4/5 h-4 rounded-md bg-stone-900/20 dark:bg-white/25" />
          </div>
        </div>

        {/* Right Flank Ghost Card */}
        <div className="hidden spacious:block absolute translate-x-56 scale-75 opacity-30 w-[340px] h-[300px] rounded-2xl bg-white/20 dark:bg-[#161412]/40 border border-white/30" />
      </div>

      {/* ================= FAR-RIGHT ARROW ================= */}
      <div className="hidden spacious:block absolute right-4 sm:right-8 spacious:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-40">
        <Skeleton variant="circular" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/20" />
      </div>
    </div>
  );
}

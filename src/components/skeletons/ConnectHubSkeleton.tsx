import Skeleton from '../common/Skeleton';

export default function ConnectHubSkeleton() {
  return (
    <div className="relative w-full h-full overflow-y-auto select-none pointer-events-none z-20">
      <div className="min-h-dvh w-full flex flex-col items-center justify-start md:justify-center px-4 sm:px-6 md:px-8 pt-[clamp(6rem,13dvh,8rem)] pb-[calc(7rem+env(safe-area-inset-bottom))] md:py-16">
        <div className="relative w-full max-w-[360px] md:max-w-3xl flex flex-col items-center justify-center space-y-5 md:space-y-7">
        
        {/* Header Title Shimmer */}
        <div className="text-center">
          <Skeleton
            variant="text"
            className="w-60 sm:w-80 h-10 sm:h-14 rounded-2xl bg-white/30 dark:bg-white/15 mx-auto"
          />
        </div>

        {/* 2x3 Grid of Social Cards */}
        <div className="w-full grid grid-cols-2 gap-2.5 md:gap-4 pt-1">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex min-h-16 md:min-h-0 items-center justify-between p-2.5 md:p-4 rounded-2xl bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-md"
            >
              {/* Left: Icon & Info */}
              <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
                <Skeleton className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/60 dark:bg-white/10 border border-white/70 dark:border-white/15 shrink-0" />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Skeleton variant="text" className="w-16 h-3.5 rounded-sm bg-stone-900/20 dark:bg-white/20" />
                  <Skeleton variant="text" className="hidden md:block w-28 sm:w-36 h-3 rounded-sm bg-stone-900/15 dark:bg-white/15" />
                </div>
              </div>

              {/* Right Arrow Icon */}
              <Skeleton className="hidden md:block w-4 h-4 rounded-full bg-white/25 dark:bg-white/10 shrink-0" />
            </div>
          ))}
        </div>

        {/* Bottom Location & Timezone Text Shimmer */}
        <div className="pt-[clamp(2rem,14dvh,7.5rem)] md:pt-2 flex items-center justify-center gap-3">
          <Skeleton variant="rounded" className="w-32 h-4 rounded-full bg-amber-500/25 dark:bg-[#FFD88A]/25" />
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <Skeleton variant="rounded" className="w-28 h-4 rounded-full bg-white/25 dark:bg-white/15" />
        </div>

        </div>
      </div>
    </div>
  );
}

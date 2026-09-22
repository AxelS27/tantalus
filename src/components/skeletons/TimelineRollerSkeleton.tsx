import Skeleton from '../common/Skeleton';

export default function TimelineRollerSkeleton() {
  return (
    <div className="relative w-full h-full flex items-center justify-center z-20 px-6 sm:px-12 md:px-16 pointer-events-none select-none">
      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-10 sm:gap-14 lg:gap-18">
        
        {/* LEFT: Detail Content Skeleton */}
        <div className="flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-center justify-center text-center space-y-4">
          {/* Role Title */}
          <Skeleton
            variant="text"
            className="w-3/4 max-w-md h-9 sm:h-12 md:h-14 rounded-2xl bg-white/20 dark:bg-white/10"
          />

          {/* Location & Date Capsule */}
          <Skeleton
            variant="rounded"
            className="w-64 sm:w-80 h-9 sm:h-11 rounded-full bg-white/15 dark:bg-white/10 border border-white/25 dark:border-white/15"
          />

          {/* Description Paragraphs */}
          <div className="w-full max-w-xl space-y-2.5 pt-2">
            <Skeleton variant="text" className="w-full h-4 sm:h-5 rounded-lg bg-white/15 dark:bg-white/10" />
            <Skeleton variant="text" className="w-11/12 h-4 sm:h-5 rounded-lg bg-white/15 dark:bg-white/10 mx-auto" />
            <Skeleton variant="text" className="w-4/5 h-4 sm:h-5 rounded-lg bg-white/15 dark:bg-white/10 mx-auto" />
          </div>

          {/* Step Counter */}
          <Skeleton variant="text" className="w-16 h-4 rounded-full bg-white/15 dark:bg-white/10 pt-2" />
        </div>

        {/* RIGHT: Cylindrical Roller Wheel Skeleton */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-3">
          {/* Top Arrow Placeholder */}
          <Skeleton variant="circular" className="w-9 h-9 rounded-full bg-white/15 dark:bg-white/10" />

          {/* Roller Wheel Chamber */}
          <div className="relative h-[400px] w-[280px] sm:w-[330px] md:w-[370px] flex flex-col items-center justify-center space-y-3">
            {/* Top Flank Card */}
            <div className="w-11/12 h-16 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 opacity-40 flex items-center p-2.5 gap-3">
              <Skeleton className="w-16 h-11 rounded-xl bg-white/15" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-12 h-2.5 rounded-sm bg-white/15" />
                <Skeleton className="w-24 h-3.5 rounded-sm bg-white/20" />
              </div>
            </div>

            {/* Center Active Card */}
            <div className="w-full h-24 sm:h-26 rounded-2xl bg-white/30 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-xl flex items-center p-3 gap-3.5">
              <Skeleton className="w-24 sm:w-28 h-16 sm:h-18 rounded-xl bg-white/20 dark:bg-white/15 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-14 h-3 rounded-full bg-amber-400/30" />
                <Skeleton className="w-32 h-4 rounded-md bg-white/30" />
                <Skeleton className="w-20 h-3 rounded-md bg-white/20" />
              </div>
            </div>

            {/* Bottom Flank Card */}
            <div className="w-11/12 h-16 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 opacity-40 flex items-center p-2.5 gap-3">
              <Skeleton className="w-16 h-11 rounded-xl bg-white/15" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-12 h-2.5 rounded-sm bg-white/15" />
                <Skeleton className="w-24 h-3.5 rounded-sm bg-white/20" />
              </div>
            </div>
          </div>

          {/* Bottom Arrow Placeholder */}
          <Skeleton variant="circular" className="w-9 h-9 rounded-full bg-white/15 dark:bg-white/10" />
        </div>

      </div>
    </div>
  );
}

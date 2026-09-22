import Skeleton from '../common/Skeleton';

export default function ProjectsGridSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-none px-4 py-4 overflow-hidden z-20">
      {/* 3D Cube Container with Non-Overlapping Flanks */}
      <div className="relative w-full flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-14">
        
        {/* Left Arrow Placeholder */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center shrink-0">
          <Skeleton variant="circular" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/15" />
        </div>

        {/* 3D Perspective Stage Skeleton */}
        <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[310px] sm:h-[340px] md:h-[365px] flex items-center justify-center shrink-0">
          <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-1.5 sm:p-2 rounded-xl bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-md"
              >
                {/* 16:9 Thumbnail Box */}
                <Skeleton
                  variant="rounded"
                  className="w-full aspect-[16/9] rounded-lg bg-black/15 dark:bg-white/10 border border-white/30 dark:border-white/10 shrink-0"
                />

                {/* Centered Single-Line Title */}
                <div className="w-full flex items-center justify-center px-1 py-1">
                  <Skeleton
                    variant="text"
                    className="w-3/4 h-3.5 rounded-full bg-stone-900/20 dark:bg-white/20"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow Placeholder */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center shrink-0">
          <Skeleton variant="circular" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/15" />
        </div>

      </div>

      {/* Bottom Pagination Dots Skeleton */}
      <div className="flex items-center justify-center gap-2.5 pt-4">
        <Skeleton className="w-7 h-1.5 rounded-full bg-amber-600/50 dark:bg-[#FFD88A]/50" />
        <Skeleton className="w-2 h-1.5 rounded-full bg-stone-400/40 dark:bg-white/20" />
        <Skeleton className="w-2 h-1.5 rounded-full bg-stone-400/40 dark:bg-white/20" />
        <Skeleton className="w-2 h-1.5 rounded-full bg-stone-400/40 dark:bg-white/20" />
      </div>
    </div>
  );
}

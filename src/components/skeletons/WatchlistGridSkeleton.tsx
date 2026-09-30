import Skeleton from '../common/Skeleton';

export default function WatchlistGridSkeleton() {
  return (
    <div className="relative w-full h-full overflow-y-auto select-none pointer-events-none z-20">
      <div className="relative mx-auto max-w-5xl px-5 sm:px-10 pt-24 spacious:pt-36 pb-[calc(7rem+env(safe-area-inset-bottom))] spacious:pb-24">
        
        <div className="flex justify-center mb-6 md:mb-10">
          <Skeleton variant="text" className="w-44 sm:w-56 h-10 sm:h-14 rounded-xl bg-white/40 dark:bg-white/15" />
        </div>
        {/* Category Filter Pills Skeleton */}
        <div className="flex flex-wrap justify-center md:flex-nowrap gap-2 pb-3 md:pb-5 mb-2 md:mb-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                className={`h-7 sm:h-8 rounded-full bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/15 ${
                  i === 0 ? 'w-14' : i === 1 ? 'w-18' : 'w-22'
                }`}
              />
            ))}
        </div>

        {/* Poster cards use the same gallery columns as the loaded page. */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 w-full">
          {[...Array(15)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col p-2 sm:p-2.5 rounded-2xl bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-md gap-2.5"
            >
              {/* 2:3 Movie Poster Aspect Skeleton */}
              <Skeleton
                variant="rounded"
                className="w-full aspect-[2/3] rounded-xl bg-black/15 dark:bg-white/10 border border-white/30 dark:border-white/10 shrink-0"
              />

              {/* Title & Metadata Lines */}
              <div className="space-y-1.5 px-0.5">
                <Skeleton
                  variant="text"
                  className="w-4/5 h-3.5 rounded-full bg-stone-900/25 dark:bg-white/25"
                />
                <Skeleton
                  variant="text"
                  className="w-1/2 h-3 rounded-full bg-stone-700/20 dark:bg-white/15"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Skeleton variant="circular" className="w-8 h-8 rounded-full bg-white/30 dark:bg-white/10" />
          <Skeleton variant="text" className="w-20 h-4 rounded-full bg-white/30 dark:bg-white/15" />
          <Skeleton variant="circular" className="w-8 h-8 rounded-full bg-white/30 dark:bg-white/10" />
        </div>

      </div>
    </div>
  );
}

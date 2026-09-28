import Skeleton from '../common/Skeleton';

export default function WatchlistGridSkeleton() {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-16 select-none pointer-events-none z-20">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Header Skeleton: Title + Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/20 dark:border-white/10">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-44 sm:w-56 h-8 sm:h-10 rounded-xl bg-white/40 dark:bg-white/15" />
            <Skeleton variant="text" className="w-60 sm:w-72 h-4 rounded-full bg-white/25 dark:bg-white/10" />
          </div>

          {/* Category Filter Pills Skeleton */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
        </div>

        {/* 3x5 Poster Cards Grid Skeleton (2:3 Aspect Ratio) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
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

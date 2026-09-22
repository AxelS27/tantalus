import Skeleton from '../common/Skeleton';

export default function ProjectDetailSkeleton() {
  return (
    <div className="relative min-h-screen w-full select-none pointer-events-none font-sans overflow-x-hidden">
      
      {/* Top Floating Navbar Capsule Shimmer */}
      <header className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full px-4 sm:px-8 max-w-5xl">
        <div className="w-full h-10 sm:h-11 flex items-center justify-between p-1 rounded-full bg-white/60 dark:bg-[#161412]/75 backdrop-blur-2xl border border-white/60 dark:border-stone-700/60 shadow-lg">
          <Skeleton variant="rounded" className="w-28 sm:w-36 h-8 rounded-full bg-white/70 dark:bg-white/15" />
          <Skeleton variant="text" className="w-48 sm:w-64 h-4 rounded-full bg-stone-900/20 dark:bg-white/20" />
          <div className="w-28 sm:w-36 hidden sm:block" />
        </div>
      </header>

      {/* Main Center Editorial Canvas Panel */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-16">
        <div className="relative w-full rounded-3xl sm:rounded-[36px] bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/70 dark:border-white/20 shadow-2xl p-6 sm:p-10 md:p-14 space-y-12 sm:space-y-16">
          
          {/* Section 1: Hero Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Visual Stage Box */}
            <div className="lg:col-span-6 space-y-3">
              <Skeleton
                variant="rounded"
                className="w-full h-[230px] sm:h-[280px] md:h-[320px] lg:h-[330px] rounded-2xl bg-black/10 dark:bg-black/40 border border-white/40 dark:border-white/20"
              />
              <div className="flex items-center justify-center gap-2 pt-1">
                <Skeleton className="w-6 h-1.5 rounded-full bg-amber-600/40" />
                <Skeleton className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-white/20" />
                <Skeleton className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-white/20" />
              </div>
            </div>

            {/* Right Specs Ledger */}
            <div className="lg:col-span-6 space-y-6 pt-1">
              {/* Metadata list */}
              <div className="space-y-3 pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton variant="text" className="w-12 h-3.5 rounded-sm bg-stone-500/20" />
                  <Skeleton variant="text" className="w-36 h-4 rounded-sm bg-amber-600/30" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton variant="text" className="w-14 h-3.5 rounded-sm bg-stone-500/20" />
                  <Skeleton variant="text" className="w-48 h-4 rounded-sm bg-stone-800/20 dark:bg-white/20" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton variant="text" className="w-12 h-3.5 rounded-sm bg-stone-500/20" />
                  <Skeleton variant="text" className="w-28 h-4 rounded-sm bg-amber-600/30" />
                </div>
              </div>

              {/* Action Buttons & Tech Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-24 h-3 rounded-sm bg-stone-500/20" />
                  <Skeleton variant="rounded" className="w-full h-8 rounded-xl bg-amber-500/30" />
                  <Skeleton variant="rounded" className="w-full h-8 rounded-xl bg-stone-800/20 dark:bg-white/10" />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-24 h-3 rounded-sm bg-stone-500/20" />
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="w-14 h-6 rounded-lg bg-white/40 dark:bg-white/10" />
                    <Skeleton className="w-18 h-6 rounded-lg bg-white/40 dark:bg-white/10" />
                    <Skeleton className="w-20 h-6 rounded-lg bg-white/40 dark:bg-white/10" />
                    <Skeleton className="w-16 h-6 rounded-lg bg-white/40 dark:bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: About the Project Article */}
          <div className="pt-8 border-t border-stone-200 dark:border-white/20 space-y-4 max-w-4xl">
            <Skeleton variant="text" className="w-48 h-6 sm:h-7 rounded-lg bg-stone-900/25 dark:bg-white/25" />
            <div className="space-y-2.5 pt-1">
              <Skeleton variant="text" className="w-full h-4 rounded-md bg-stone-700/20 dark:bg-white/15" />
              <Skeleton variant="text" className="w-11/12 h-4 rounded-md bg-stone-700/20 dark:bg-white/15" />
              <Skeleton variant="text" className="w-4/5 h-4 rounded-md bg-stone-700/20 dark:bg-white/15" />
            </div>
            <div className="space-y-2.5 pt-2">
              <Skeleton variant="text" className="w-full h-4 rounded-md bg-stone-700/20 dark:bg-white/15" />
              <Skeleton variant="text" className="w-10/12 h-4 rounded-md bg-stone-700/20 dark:bg-white/15" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

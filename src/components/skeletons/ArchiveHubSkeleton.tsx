import Skeleton from '../common/Skeleton';

export default function ArchiveHubSkeleton() {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center px-6 py-16 select-none pointer-events-none">
      {/* macOS Launchpad 4x2 / 2x3 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-5 sm:gap-y-6 md:gap-y-7 justify-items-center w-full max-w-md sm:max-w-xl md:max-w-2xl">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2.5">
            {/* Squircle Frosted Glass Icon Box */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-[22px] sm:rounded-[24px] md:rounded-[26px] bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-lg flex items-center justify-center p-4">
              <Skeleton
                variant="rounded"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/30 dark:bg-white/15"
              />
            </div>

            {/* App Label */}
            <Skeleton
              variant="text"
              className="w-16 sm:w-20 h-3.5 rounded-full bg-white/25 dark:bg-white/20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

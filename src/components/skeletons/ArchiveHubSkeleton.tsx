import Skeleton from '../common/Skeleton';

export default function ArchiveHubSkeleton() {
  return (
    <div className="relative w-full h-full overflow-y-auto flex flex-col select-none pointer-events-none">
      <div className="min-h-dvh w-full flex flex-col items-center justify-center px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] md:py-16">
        <Skeleton className="spacious:hidden w-40 h-12 mb-8 rounded-xl bg-white/25" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-2 md:gap-x-8 gap-y-5 md:gap-y-7 justify-items-center w-full max-w-[340px] md:max-w-2xl">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2.5">
            {/* Squircle Frosted Glass Icon Box */}
            <div className="w-16 h-16 md:w-22 md:h-22 rounded-[20px] md:rounded-[26px] bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl border border-white/60 dark:border-white/20 shadow-lg flex items-center justify-center p-4">
              <Skeleton
                variant="rounded"
                className="w-7 h-7 md:w-10 md:h-10 rounded-xl bg-white/30 dark:bg-white/15"
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
    </div>
  );
}

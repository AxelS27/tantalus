import Skeleton from '../common/Skeleton';

export default function StoryBookSkeleton() {
  return (
    <div className="relative w-full h-full flex items-center justify-center z-20 px-4 sm:px-8 md:px-12 pointer-events-none select-none">
      <div className="w-full max-w-4xl xl:max-w-5xl h-[82vh] max-h-[780px] rounded-3xl bg-white/20 dark:bg-[#161412]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-6 sm:p-10 flex flex-col justify-between shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-300/30 dark:border-stone-700/40 pb-5">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-48 h-7 sm:h-8 rounded-lg bg-white/30 dark:bg-white/15" />
            <Skeleton variant="text" className="w-32 h-4 rounded-md bg-white/20 dark:bg-white/10" />
          </div>
          <Skeleton variant="rounded" className="w-36 h-9 rounded-full bg-white/25 dark:bg-white/10" />
        </div>

        {/* Content Body */}
        <div className="flex-1 py-8 space-y-4">
          <Skeleton variant="text" className="w-3/4 h-8 rounded-lg bg-white/30 dark:bg-white/15" />
          <Skeleton variant="text" className="w-full h-4 rounded-md bg-white/20 dark:bg-white/10" />
          <Skeleton variant="text" className="w-full h-4 rounded-md bg-white/20 dark:bg-white/10" />
          <Skeleton variant="text" className="w-5/6 h-4 rounded-md bg-white/20 dark:bg-white/10" />
          <Skeleton variant="text" className="w-4/5 h-4 rounded-md bg-white/20 dark:bg-white/10" />
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between border-t border-stone-300/30 dark:border-stone-700/40 pt-5">
          <Skeleton variant="rounded" className="w-28 h-9 rounded-full bg-white/20 dark:bg-white/10" />
          <Skeleton variant="text" className="w-24 h-4 rounded-md bg-white/20 dark:bg-white/10" />
          <Skeleton variant="rounded" className="w-28 h-9 rounded-full bg-white/20 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

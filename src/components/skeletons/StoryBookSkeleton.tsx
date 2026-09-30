import Skeleton from '../common/Skeleton';

export default function StoryBookSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center compact:justify-start compact:pt-[calc(6rem+env(safe-area-inset-top))] compact:pb-[calc(7rem+env(safe-area-inset-bottom))] compact:overflow-y-auto pointer-events-none select-none">
      <Skeleton className="spacious:hidden w-48 h-11 mb-6 shrink-0 rounded-xl bg-white/25" />
      <div className="storybook-shelf-stage relative w-full max-w-5xl shrink-0 h-[420px] sm:h-[460px] spacious:h-[500px] flex items-center justify-center my-auto">
        <div className="storybook-shelf-card absolute w-[260px] sm:w-[300px] spacious:w-[330px] aspect-[1/1.42] rounded-lg bg-[#392f26]/80 border border-[#E8C582]/35 shadow-2xl flex flex-col items-center justify-center gap-5 p-8">
          <Skeleton className="w-20 h-20 rounded-full bg-[#E8C582]/25" />
          <Skeleton className="w-4/5 h-7 rounded-md bg-[#E8C582]/25" />
          <Skeleton className="w-2/3 h-3 rounded-full bg-[#E8C582]/15" />
        </div>
      </div>
    </div>
  );
}

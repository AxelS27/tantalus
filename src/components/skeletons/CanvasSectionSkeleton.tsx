import Skeleton from '../common/Skeleton';

export default function CanvasSectionSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 select-none pointer-events-none">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        {/* Shimmering Center Shield */}
        <Skeleton
          variant="rounded"
          className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 shadow-lg"
        />
        {/* Shimmering Title */}
        <Skeleton
          variant="text"
          className="w-48 h-6 rounded-full bg-white/15"
        />
        {/* Shimmering Description Subtitle */}
        <Skeleton
          variant="text"
          className="w-64 h-3.5 rounded-full bg-white/10"
        />
      </div>
    </div>
  );
}

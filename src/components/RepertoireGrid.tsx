import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import repertoire from '../data/repertoire.json';
import { getAssetUrl } from '../lib/assets';
import ImageWithSkeleton from './common/ImageWithSkeleton';

type Genre = 'All' | 'Romantic' | 'Classical' | 'Baroque' | 'OST & Soundtracks' | 'Studies';
const genres: Genre[] = ['All', 'Romantic', 'Classical', 'Baroque', 'OST & Soundtracks', 'Studies'];
const visibleRepertoire = repertoire.filter((piece) => !/^epr-level-(?:[4-9]|10)$/.test(piece.id));
const pageSize = 15;

interface RepertoireGridProps {
  isActive?: boolean;
  onReachTop?: () => void;
}

export const RepertoireGrid = memo(function RepertoireGrid({
  isActive = true,
  onReachTop,
}: RepertoireGridProps) {
  const [genre, setGenre] = useState<Genre>('All');
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const arrivedAtTopRef = useRef(Date.now());
  const lastAttemptRef = useRef(0);
  const attemptsRef = useRef(0);
  const wasAtTopRef = useRef(true);

  const filteredPieces = useMemo(
    () => genre === 'All' ? visibleRepertoire : visibleRepertoire.filter((piece) => piece.genre === genre),
    [genre],
  );
  const pageCount = Math.ceil(filteredPieces.length / pageSize);
  const pieces = filteredPieces.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (isActive) {
      arrivedAtTopRef.current = Date.now();
      lastAttemptRef.current = 0;
      attemptsRef.current = 0;
    }
  }, [isActive]);

  const handleScroll = () => {
    const atTop = (scrollRef.current?.scrollTop ?? 0) <= 2;
    if (atTop && !wasAtTopRef.current) {
      arrivedAtTopRef.current = Date.now();
      lastAttemptRef.current = 0;
      attemptsRef.current = 0;
    }
    if (!atTop) attemptsRef.current = 0;
    wasAtTopRef.current = atTop;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if ((scrollRef.current?.scrollTop ?? 0) > 2 || e.deltaY >= 0) {
      attemptsRef.current = 0;
      return;
    }
    const now = Date.now();
    if (e.deltaY >= -50 || now - arrivedAtTopRef.current < 500 || now - lastAttemptRef.current < 220) return;
    attemptsRef.current = now - lastAttemptRef.current > 1600 ? 1 : attemptsRef.current + 1;
    lastAttemptRef.current = now;
    if (attemptsRef.current >= 2) {
      attemptsRef.current = 0;
      onReachTop?.();
    }
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    wasAtTopRef.current = true;
    arrivedAtTopRef.current = Date.now();
    attemptsRef.current = 0;
    lastAttemptRef.current = 0;
  };

  const selectGenre = (nextGenre: Genre) => {
    if (nextGenre === genre) return;
    setGenre(nextGenre);
    setPage(1);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    wasAtTopRef.current = true;
    arrivedAtTopRef.current = Date.now();
    attemptsRef.current = 0;
    lastAttemptRef.current = 0;
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`repertoire-scroll-container relative z-20 w-full h-full overflow-y-scroll overflow-x-hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="relative mx-auto max-w-5xl px-5 sm:px-10 pt-32 sm:pt-36 pb-24">
        <header className="text-center mb-8 sm:mb-10">
          <h1
            className="font-serif italic font-light text-5xl sm:text-7xl text-white tracking-tight"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 8px 36px rgba(0,0,0,0.7)' }}
          >
            Repertoire
          </h1>
        </header>

        <div className="flex sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-5 mb-3 sm:mb-5" aria-label="Filter repertoire by genre">
          {genres.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectGenre(item)}
              aria-pressed={genre === item}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] sm:text-xs font-medium tracking-wide backdrop-blur-2xl border shadow-[0_4px_16px_rgba(0,0,0,0.12)] cursor-pointer transition-colors ${
                genre === item
                  ? 'bg-white/80 border-white/80 text-stone-950 dark:bg-stone-900/85 dark:text-amber-200'
                  : 'bg-black/35 border-white/30 text-white hover:bg-black/55'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {pieces.map((piece) => (
            <motion.a
              key={piece.id}
              href={piece.scoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open score for ${piece.title}`}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.18 }}
              className="group relative min-w-0 flex flex-col p-1.5 sm:p-2 rounded-xl bg-white/45 dark:bg-[#161412]/60 hover:bg-white/65 dark:hover:bg-[#161412]/75 backdrop-blur-xl border border-white/60 dark:border-white/20 hover:border-white/95 dark:hover:border-white/40 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9),0_8px_24px_-4px_rgba(40,30,20,0.14)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.65)] transition-colors cursor-pointer overflow-hidden"
            >
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/20 border border-white/40 dark:border-white/15">
                <ImageWithSkeleton
                  src={getAssetUrl(piece.image)}
                  alt={piece.title}
                  loading="lazy"
                  decoding="async"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                  skeletonClassName="bg-white/10 dark:bg-black/40"
                />
              </div>
              <div className="w-full min-h-12 sm:min-h-14 flex items-center justify-center text-center px-1 py-1.5">
                <h2
                  title={piece.title}
                  className="w-full line-clamp-2 font-sans text-[11px] sm:text-xs leading-snug font-semibold text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors"
                >
                  {piece.title}
                </h2>
              </div>
            </motion.a>
          ))}
        </div>

        {pageCount > 1 && (
          <nav aria-label="Repertoire pages" className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 sm:mt-12">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/35 border border-white/30 text-white backdrop-blur-xl hover:bg-black/55 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => goToPage(number)}
                aria-label={`Page ${number}`}
                aria-current={page === number ? 'page' : undefined}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border text-xs font-semibold backdrop-blur-xl cursor-pointer transition-colors ${
                  page === number
                    ? 'bg-white/80 border-white/80 text-stone-950 dark:bg-stone-900/85 dark:text-amber-200'
                    : 'bg-black/35 border-white/30 text-white hover:bg-black/55'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
              aria-label="Next page"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-black/35 border border-white/30 text-white backdrop-blur-xl hover:bg-black/55 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
});

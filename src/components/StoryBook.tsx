import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  animate,
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Flame,
  Waves,
  X,
  List,
  Sparkles,
  Scroll,
} from 'lucide-react';
import { storybooksData, type StoryBookItem } from '../data/storybooks';

export interface StoryBookProps {
  isActive?: boolean;
  onReachTop?: () => void;
}

interface BookCardProps {
  book: StoryBookItem;
  index: number;
  position: MotionValue<number>;
  selectedIndex: number;
  isCoverOpen: boolean;
  onSelect: (book: StoryBookItem, index: number, isCenter: boolean) => void;
}

// Helper to render book emblem icon
const renderEmblemIcon = (emblem?: StoryBookItem['emblem'], sizeClass = 'w-6 h-6') => {
  switch (emblem) {
    case 'compass':
      return <Compass className={`${sizeClass} text-amber-300`} />;
    case 'owl':
      return <Eye className={`${sizeClass} text-sky-300`} />;
    case 'thread':
      return <Flame className={`${sizeClass} text-emerald-300`} />;
    case 'wave':
      return <Waves className={`${sizeClass} text-orange-300`} />;
    default:
      return <Compass className={`${sizeClass} text-amber-300`} />;
  }
};

// 3D Animated Physical Book on Shelf
const BookCard = memo(function BookCard({
  book,
  index,
  position,
  selectedIndex,
  isCoverOpen,
  onSelect,
}: BookCardProps) {
  const x = useTransform(position, (current) => (index - current) * 300);
  const rotateY = useTransform(position, (current) =>
    Math.max(-32, Math.min(32, -(index - current) * 25)),
  );
  const z = useTransform(position, (current) =>
    -Math.min(220, Math.abs(index - current) * 90),
  );
  const scale = useTransform(position, (current) =>
    Math.max(0.68, 1 - Math.abs(index - current) * 0.14),
  );
  const opacity = useTransform(position, (current) =>
    Math.max(0.2, 1 - Math.abs(index - current) * 0.32),
  );
  const zIndex = useTransform(position, (current) =>
    Math.round(30 - Math.min(25, Math.abs(index - current) * 8)),
  );

  const offset = index - selectedIndex;
  const isCenter = offset === 0;
  const isClickable = Math.abs(offset) <= 2;

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        if (isClickable) {
          onSelect(book, index, isCenter);
        }
      }}
      style={{
        x,
        rotateY,
        z,
        scale,
        opacity,
        zIndex,
        transformStyle: 'preserve-3d',
        pointerEvents: isClickable ? 'auto' : 'none',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
      className="group absolute w-[260px] sm:w-[300px] md:w-[330px] aspect-[1/1.42] transition-shadow cursor-pointer select-none"
    >
      {/* 3D BOOK CONTAINER */}
      <div
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* ================= 1. BACK COVER & CLEAN INNER PARCHMENT ================= */}
        <div
          style={{ backgroundColor: book.coverColor }}
          className={`absolute inset-0 ml-4 rounded-r-3xl border-2 border-[#D8A048]/60 p-1 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            isCenter
              ? 'shadow-[0_25px_60px_-10px_rgba(216,160,72,0.4)]'
              : 'shadow-xl'
          }`}
        >
          {/* Gilded Page Block Edge */}
          <div className="absolute right-0 top-2 bottom-2 w-3 bg-gradient-to-l from-[#C8B898] via-[#EFE6D5] to-[#DFD3BE] rounded-r-md border-l border-amber-900/20 shadow-inner" />
          <div className="absolute bottom-0 left-2 right-2 h-3 bg-gradient-to-t from-[#C8B898] via-[#EFE6D5] to-[#DFD3BE] rounded-b-md border-t border-amber-900/20 shadow-inner" />

          {/* Clean Antique Parchment Sheet */}
          <div className="relative w-[calc(100%-14px)] h-[calc(100%-14px)] rounded-r-2xl bg-[#FAF6EE] dark:bg-[#1C1816] p-6 flex flex-col justify-between text-[#2B231D] dark:text-[#EAE3D9] shadow-inner overflow-hidden">
            <div className="absolute inset-3 border border-amber-900/10 dark:border-amber-100/10 rounded-r-xl pointer-events-none" />
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-[#8A7B6E] dark:text-[#8E8478] uppercase border-b border-amber-900/10 dark:border-amber-100/10 pb-1.5 z-10">
              <span>{book.volume}</span>
              <span>Folio I</span>
            </div>

            <div className="flex flex-col items-center text-center gap-2.5 my-auto z-10 py-4">
              <div className="w-14 h-14 rounded-full border border-amber-600/30 dark:border-amber-400/30 flex items-center justify-center bg-amber-500/10 shadow-xs">
                {renderEmblemIcon(book.emblem, 'w-7 h-7 text-amber-700 dark:text-amber-300')}
              </div>
              <h4 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#1F1712] dark:text-white">
                {book.title}
              </h4>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-[#8A7B6E] dark:text-[#8E8478] border-t border-amber-900/10 dark:border-amber-100/10 pt-1.5 z-10">
              <span>{book.totalChapters} Chapters</span>
              <span>{book.author}</span>
            </div>
          </div>
        </div>

        {/* ================= 2. 3D BOOK SPINE ================= */}
        <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-[#120B08] via-[#2A1912] to-[#1A100B] rounded-l-md border-r border-amber-600/30 shadow-inner z-30 pointer-events-none" />

        {/* ================= 3. FRONT HARDCOVER LEAF ================= */}
        <motion.div
          animate={{
            rotateY: isCenter && isCoverOpen ? -165 : 0,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
          }}
          className="absolute inset-0 ml-4 rounded-r-3xl z-40 pointer-events-none"
        >
          {/* --- FACE A: FRONT HARDCOVER --- */}
          <div
            style={{
              backgroundColor: book.coverColor,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`absolute inset-0 rounded-r-3xl border-2 p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300 ${
              isCenter
                ? 'border-[#D8A048] shadow-[0_25px_60px_-10px_rgba(216,160,72,0.4)] group-hover:shadow-[0_30px_70px_-10px_rgba(216,160,72,0.5)] group-hover:scale-[1.02]'
                : 'border-[#D8A048]/40 shadow-xl'
            }`}
          >
            <div className="absolute inset-2 border border-amber-400/30 rounded-r-2xl pointer-events-none" />
            <div className="absolute top-3 left-3 text-amber-400/40 text-[10px] font-serif select-none">✦</div>
            <div className="absolute top-3 right-3 text-amber-400/40 text-[10px] font-serif select-none">✦</div>
            <div className="absolute bottom-3 left-3 text-amber-400/40 text-[10px] font-serif select-none">✦</div>
            <div className="absolute bottom-3 right-3 text-amber-400/40 text-[10px] font-serif select-none">✦</div>

            <div className="flex flex-col items-center gap-1 z-10 pt-1">
              <span className="text-xs tracking-widest font-mono text-amber-300/90 uppercase font-bold">
                {book.volume}
              </span>
              <div className="w-8 h-px bg-amber-400/40 my-0.5" />
              <span className="text-[10px] font-serif tracking-widest text-amber-200/80">
                {book.year}
              </span>
            </div>

            <div className="flex flex-col items-center text-center gap-2 z-10 my-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-amber-400/50 flex items-center justify-center bg-amber-950/40 backdrop-blur-sm shadow-md mb-1 group-hover:scale-105 transition-transform">
                {renderEmblemIcon(book.emblem, 'w-6 h-6 sm:w-7 sm:h-7')}
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif tracking-wider text-amber-100 font-bold drop-shadow-md leading-tight">
                {book.title}
              </h3>

              {book.originalTitle && (
                <span className="text-xs sm:text-sm font-serif italic text-amber-300/80">
                  {book.originalTitle}
                </span>
              )}

              <p className="text-[11px] sm:text-xs font-serif italic text-amber-200/70 max-w-[200px] line-clamp-2 leading-relaxed mt-1">
                {book.subtitle}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 z-10 pb-1">
              <div className="w-10 h-px bg-amber-400/40 mb-1" />
              <span className="text-[10px] tracking-widest font-serif text-amber-300/90 uppercase">
                {book.author}
              </span>
            </div>

            {isCenter && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 text-[10px] font-serif tracking-wider uppercase text-amber-200 bg-amber-950/90 px-3 py-1 rounded-full border border-amber-400/40 backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>{book.isAvailable ? 'Click to Read' : 'Coming Soon'}</span>
              </div>
            )}

            <div className="absolute -bottom-4 right-8 w-5 h-12 bg-gradient-to-b from-red-800 to-red-950 rounded-b-sm shadow-md border-t border-amber-400/40 pointer-events-none" />
          </div>

          {/* --- FACE B: INSIDE COVER LINING --- */}
          <div
            style={{
              backgroundColor: book.coverColor,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="absolute inset-0 rounded-l-3xl border-2 border-[#D8A048]/60 p-5 flex flex-col justify-between overflow-hidden shadow-2xl bg-gradient-to-br from-[#231510] to-[#120B08]"
          >
            <div className="absolute inset-2 border border-amber-400/20 rounded-l-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-[9px] font-mono text-amber-300/60 uppercase">
              <span>Ex Libris</span>
              <span>{book.volume}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 my-auto">
              <div className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center bg-amber-950/30">
                <Sparkles className="w-5 h-5 text-amber-300/80" />
              </div>
              <span className="font-serif italic text-xs text-amber-200/90">
                Bibliotheca Universalis
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Single Page Data representation in a continuous novel flow
export type NovelPageData =
  | {
      type: 'blank-cover';
      pageNumber: number;
    }
  | {
      type: 'toc';
      bookTitle: string;
      subtitle: string;
      chapterPageMap: { chapterId: string; number: string; title: string; motif: string; pageNumber: number }[];
      pageNumber: number;
    }
  | {
      type: 'chapter-title-leaf';
      chapterNumber: string;
      chapterTitle: string;
      subtitle: string;
      motif: string;
      theme: string;
      emblem?: StoryBookItem['emblem'];
      pageNumber: number;
    }
  | {
      type: 'narrative';
      chapterNumber: string;
      chapterTitle: string;
      paragraphs: string[];
      isFirstPageOfChapter: boolean; // only page 1 gets drop-cap
      pageNumber: number;
    }
  | {
      type: 'finis';
      pageNumber: number;
    };

// Spread = 2 Facing Pages (Left & Right)
export interface NovelSpread {
  id: string;
  spreadIndex: number;
  leftPage: NovelPageData;
  rightPage: NovelPageData;
}

export const StoryBook = memo(function StoryBook({
  isActive = true,
  onReachTop,
}: StoryBookProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const position = useMotionValue(0);

  // Animation Sequence States
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isZoomingPaper, setIsZoomingPaper] = useState(false);
  const [isReaderSpread, setIsReaderSpread] = useState(false);

  // Paginated Spread Navigation (100% paginated novel flow, zero vertical scroll!)
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const sequenceTimersRef = useRef<number[]>([]);

  // Dragging states
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Wheel timing & safe threshold protection
  const lastWheelTimeRef = useRef<number>(0);
  const arrivedAtFirstBookTimeRef = useRef<number>(Date.now());
  const upwardScrollAttemptCountRef = useRef<number>(0);

  const currentBook: StoryBookItem = storybooksData[selectedIndex] || storybooksData[0];

  // Reset spread index whenever active book changes
  useEffect(() => {
    setCurrentSpreadIndex(0);
  }, [selectedIndex]);

  // =========================================================================
  // CONTINUOUS NOVEL PAGINATOR:
  // Maximizes page space: Each chapter's complete text fills the facing page
  // from top to bottom completely without leaving empty bottom half-pages!
  // =========================================================================
  const spreads: NovelSpread[] = useMemo(() => {
    const allPages: NovelPageData[] = [];
    const chapterPageMap: { chapterId: string; number: string; title: string; motif: string; pageNumber: number }[] = [];

    // Page 0: Inside Cover (Blank)
    allPages.push({
      type: 'blank-cover',
      pageNumber: 0,
    });

    // Page 1: TOC placeholder
    allPages.push({
      type: 'toc',
      bookTitle: currentBook?.title || '',
      subtitle: currentBook?.subtitle || '',
      chapterPageMap: [],
      pageNumber: 1,
    });

    let pageCounter = 2;

    if (currentBook && currentBook.chapters && currentBook.chapters.length > 0) {
      currentBook.chapters.forEach((ch) => {
        const titleLeafPageNum = pageCounter++;
        chapterPageMap.push({
          chapterId: ch.id,
          number: ch.number,
          title: ch.title,
          motif: ch.motif,
          pageNumber: titleLeafPageNum,
        });

        // 1. Dedicated Chapter Title Leaf
        allPages.push({
          type: 'chapter-title-leaf',
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          subtitle: ch.subtitle,
          motif: ch.motif,
          theme: ch.theme,
          emblem: currentBook.emblem,
          pageNumber: titleLeafPageNum,
        });

        // 2. Paginate chapter narrative paragraphs (5 paragraphs per page fits completely within height bounds!)
        const MAX_PARAGRAPHS_PER_PAGE = 5;
        const totalTextPages = Math.max(1, Math.ceil(ch.paragraphs.length / MAX_PARAGRAPHS_PER_PAGE));

        for (let pIdx = 0; pIdx < totalTextPages; pIdx++) {
          const start = pIdx * MAX_PARAGRAPHS_PER_PAGE;
          const pageParagraphs = ch.paragraphs.slice(start, start + MAX_PARAGRAPHS_PER_PAGE);

          allPages.push({
            type: 'narrative',
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            paragraphs: pageParagraphs,
            isFirstPageOfChapter: pIdx === 0, // only the first text page gets the drop-cap
            pageNumber: pageCounter++,
          });
        }
      });
    }

    // Final Page: Finis
    allPages.push({
      type: 'finis',
      pageNumber: pageCounter++,
    });

    // Update Page 1 (Table of Contents) with the calculated chapterPageMap
    allPages[1] = {
      type: 'toc',
      bookTitle: currentBook?.title || '',
      subtitle: currentBook?.subtitle || '',
      chapterPageMap,
      pageNumber: 1,
    };

    // Ensure even number of pages for dual spreads
    if (allPages.length % 2 !== 0) {
      allPages.push({
        type: 'blank-cover',
        pageNumber: pageCounter++,
      });
    }

    // Pair sequential pages into Dual-Page Spreads (Left & Right)
    const spreadList: NovelSpread[] = [];
    for (let i = 0; i < allPages.length; i += 2) {
      const spreadIdx = i / 2;
      spreadList.push({
        id: `spread-${spreadIdx}`,
        spreadIndex: spreadIdx,
        leftPage: allPages[i] || { type: 'blank-cover', pageNumber: i },
        rightPage: allPages[i + 1] || { type: 'blank-cover', pageNumber: i + 1 },
      });
    }

    return spreadList;
  }, [currentBook]);

  const currentSpread = useMemo(() => {
    if (!spreads || spreads.length === 0) {
      return {
        id: 'spread-fallback',
        spreadIndex: 0,
        leftPage: { type: 'blank-cover' as const, pageNumber: 0 },
        rightPage: { type: 'finis' as const, pageNumber: 1 },
      };
    }
    return spreads[currentSpreadIndex] || spreads[0];
  }, [spreads, currentSpreadIndex]);

  const clearSequenceTimers = () => {
    sequenceTimersRef.current.forEach((t) => window.clearTimeout(t));
    sequenceTimersRef.current = [];
  };

  useEffect(() => {
    return () => clearSequenceTimers();
  }, []);

  // Shelf animation
  const animateToIndex = useCallback(
    (index: number) => {
      position.stop();
      animate(position, index, {
        type: 'spring',
        stiffness: 130,
        damping: 24,
        mass: 1.25,
      });
    },
    [position],
  );

  const settleToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(storybooksData.length - 1, index));
      selectedIndexRef.current = clamped;
      setSelectedIndex(clamped);
      setIsCoverOpen(false);
      setIsZoomingPaper(false);
      setIsReaderSpread(false);
      animateToIndex(clamped);
    },
    [animateToIndex],
  );

  const handleNextShelf = useCallback(() => {
    if (selectedIndex < storybooksData.length - 1) {
      settleToIndex(selectedIndex + 1);
    }
  }, [selectedIndex, settleToIndex]);

  const handlePrevShelf = useCallback(() => {
    if (selectedIndex > 0) {
      settleToIndex(selectedIndex - 1);
    }
  }, [selectedIndex, settleToIndex]);

  // Unified Opening Sequence
  const handleOpenSequence = useCallback((book: StoryBookItem) => {
    if (!book.isAvailable) return;
    clearSequenceTimers();

    setIsCoverOpen(true);
    setCurrentSpreadIndex(0); // Start at Spread 0 (Table of Contents)

    const t1 = window.setTimeout(() => {
      setIsZoomingPaper(true);
    }, 750);

    const t2 = window.setTimeout(() => {
      setIsReaderSpread(true);
    }, 1450);

    sequenceTimersRef.current = [t1, t2];
  }, []);

  // Unified Closing Sequence
  const handleCloseSequence = useCallback(() => {
    clearSequenceTimers();

    setIsReaderSpread(false);
    setIsTocOpen(false);

    const t1 = window.setTimeout(() => {
      setIsZoomingPaper(false);
    }, 400);

    const t2 = window.setTimeout(() => {
      setIsCoverOpen(false);
    }, 900);

    sequenceTimersRef.current = [t1, t2];
  }, []);

  // Turn to Next Spread
  const handleNextSpread = useCallback(() => {
    if (currentSpreadIndex < spreads.length - 1) {
      setCurrentSpreadIndex((prev) => prev + 1);
    }
  }, [currentSpreadIndex, spreads.length]);

  // Turn to Previous Spread
  const handlePrevSpread = useCallback(() => {
    if (currentSpreadIndex > 0) {
      setCurrentSpreadIndex((prev) => prev - 1);
    }
  }, [currentSpreadIndex]);

  // Jump to specific chapter spread from Table of Contents
  const handleJumpToChapterByPage = useCallback(
    (pageNumber: number) => {
      const targetSpreadIdx = Math.floor(pageNumber / 2);
      if (targetSpreadIdx >= 0 && targetSpreadIdx < spreads.length) {
        setCurrentSpreadIndex(targetSpreadIdx);
        setIsTocOpen(false);
      }
    },
    [spreads.length],
  );

  // Global window pointerup/cancel listener
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
      }
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        const snapped = Math.round(position.get());
        settleToIndex(snapped);
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [position, settleToIndex]);

  // Pointer drag controls for shelf
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || e.button !== 0 || isReaderSpread || isCoverOpen) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartIndexRef.current = position.get();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || isReaderSpread || isCoverOpen) return;
    const dx = e.clientX - dragStartXRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) > 8) {
        isDraggingRef.current = true;
        setIsDragging(true);
        hasDraggedRef.current = true;
        setIsCoverOpen(false);
        position.stop();
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      } else {
        return;
      }
    }

    const rawIndex = dragStartIndexRef.current - dx / 240;
    const maxIdx = storybooksData.length - 1;

    let boundedIndex = rawIndex;
    if (rawIndex < 0) {
      boundedIndex = rawIndex * 0.25;
    } else if (rawIndex > maxIdx) {
      boundedIndex = maxIdx + (rawIndex - maxIdx) * 0.25;
    }

    position.set(boundedIndex);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);

      const targetIndex = Math.round(position.get());
      settleToIndex(targetIndex);
    }
  };

  // Wheel listener: SCROLL = FLIP NOVEL PAGE! (Zero vertical scroll)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
    e.stopPropagation();

    const now = Date.now();
    if (now - lastWheelTimeRef.current < 220) return;

    if (isReaderSpread) {
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 15) {
        if (delta > 0) {
          handleNextSpread();
        } else {
          handlePrevSpread();
        }
        lastWheelTimeRef.current = now;
      }
      return;
    }

    // On shelf:
    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    if (e.deltaY < -20 && selectedIndex === 0) {
      if (now - arrivedAtFirstBookTimeRef.current < 500) return;

      if (e.deltaY < -50) {
        upwardScrollAttemptCountRef.current += 1;
        if (upwardScrollAttemptCountRef.current >= 2) {
          upwardScrollAttemptCountRef.current = 0;
          lastWheelTimeRef.current = now;
          onReachTop?.();
          return;
        }
      }
      return;
    }

    upwardScrollAttemptCountRef.current = 0;

    if (Math.abs(delta) > 10) {
      if (delta > 0) {
        handleNextShelf();
      } else {
        handlePrevShelf();
      }
      lastWheelTimeRef.current = now;
    }
  };

  useEffect(() => {
    if (selectedIndex === 0) {
      arrivedAtFirstBookTimeRef.current = Date.now();
    }
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        if (isTocOpen) {
          setIsTocOpen(false);
        } else if (isReaderSpread || isCoverOpen) {
          handleCloseSequence();
        } else {
          onReachTop?.();
        }
        return;
      }

      if (isReaderSpread) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') handleNextSpread();
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') handlePrevSpread();
      } else {
        if (e.key === 'ArrowLeft') handlePrevShelf();
        if (e.key === 'ArrowRight') handleNextShelf();
        if (e.key === 'Enter' || e.key === ' ') {
          if (currentBook && currentBook.isAvailable && !isCoverOpen) {
            handleOpenSequence(currentBook);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    isReaderSpread,
    isCoverOpen,
    isTocOpen,
    currentBook,
    handlePrevShelf,
    handleNextShelf,
    handleOpenSequence,
    handleCloseSequence,
    handlePrevSpread,
    handleNextSpread,
    onReachTop,
  ]);

  const handleCardSelect = useCallback(
    (book: StoryBookItem, index: number, isCenter: boolean) => {
      if (hasDraggedRef.current) return;
      if (isCenter) {
        if (book.isAvailable && !isCoverOpen) {
          handleOpenSequence(book);
        }
      } else {
        settleToIndex(index);
      }
    },
    [isCoverOpen, handleOpenSequence, settleToIndex],
  );

  // Helper to render an individual novel page authentically
  const renderNovelPage = (page: NovelPageData | undefined, isLeft: boolean) => {
    if (!page || page.type === 'blank-cover') {
      return (
        <div
          style={{ backgroundColor: currentBook?.coverColor || '#2B1612' }}
          className={`relative flex-1 ${
            isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'
          } overflow-hidden bg-gradient-to-br from-black/20 via-transparent to-black/40 h-full`}
        />
      );
    }

    if (page.type === 'toc') {
      return (
        <div className="relative flex-1 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] h-full">
          {/* Top Fixed Spacer */}
          <div className="h-4 flex-shrink-0" />

          {/* Book Title & Table of Contents */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 min-h-0 py-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1F1712] dark:text-white tracking-wide">
              {page.bookTitle}
            </h2>
            <p className="text-xs sm:text-sm font-serif italic text-amber-700 dark:text-amber-400">
              {page.subtitle}
            </p>

            {/* Clickable Index Table with Accurate Page Numbers */}
            <div className="w-full max-w-md mt-6 space-y-1.5">
              {page.chapterPageMap?.map((item) => (
                <button
                  key={item.chapterId}
                  onClick={() => handleJumpToChapterByPage(item.pageNumber)}
                  className="group w-full flex items-baseline justify-between py-0.5 text-left hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-baseline gap-2.5 truncate pr-2">
                    <span className="font-serif text-xs text-[#8A7B6E] dark:text-[#8E8478] w-16 flex-shrink-0 text-left">
                      {item.number}
                    </span>
                    <span className="font-serif text-xs sm:text-[13px] text-[#2B231D] dark:text-[#DDD5CA] group-hover:underline truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#8A7B6E] dark:text-[#8E8478] flex-shrink-0">
                    {item.pageNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Height Bottom Page Number */}
          <div className="h-6 flex-shrink-0 flex items-center justify-center text-xs font-serif text-[#8A7B6E] dark:text-[#8E8478]">
            {page.pageNumber}
          </div>
        </div>
      );
    }

    if (page.type === 'chapter-title-leaf') {
      return (
        <div className="relative flex-1 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] h-full">
          {/* Top Fixed Spacer */}
          <div className="h-4 flex-shrink-0" />

          {/* Center Title Leaf (Dedicated Chapter Division Page) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 min-h-0 py-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-600/30 dark:border-amber-400/30 flex items-center justify-center bg-amber-500/5 shadow-xs mb-1">
              {renderEmblemIcon(page.emblem, 'w-8 h-8 sm:w-10 sm:h-10 text-amber-700 dark:text-amber-300')}
            </div>

            <span className="text-xs font-serif tracking-[0.25em] text-amber-800 dark:text-amber-400 uppercase font-semibold">
              {page.chapterNumber}
            </span>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1F1712] dark:text-white tracking-wide">
              {page.chapterTitle}
            </h3>

            <p className="text-xs sm:text-sm font-serif italic text-[#7A695A] dark:text-[#A89E92] max-w-xs leading-relaxed mt-1">
              {page.subtitle}
            </p>
          </div>

          {/* Fixed Height Bottom Page Number */}
          <div className="h-6 flex-shrink-0 flex items-center justify-center text-xs font-serif text-[#8A7B6E] dark:text-[#8E8478]">
            {page.pageNumber}
          </div>
        </div>
      );
    }

    if (page.type === 'narrative') {
      return (
        <div className="relative flex-1 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] h-full">
          {/* Top Fixed Spacer */}
          <div className="h-2 flex-shrink-0" />

          {/* Narrative Text Body (Zero overflow, strict height containment!) */}
          <div className="flex-1 flex flex-col justify-start gap-2.5 sm:gap-3 min-h-0 py-1 overflow-hidden">
            {page.paragraphs?.map((paragraph, pIdx) => {
              if (page.isFirstPageOfChapter && pIdx === 0 && paragraph.length > 0) {
                const firstLetter = paragraph.charAt(0);
                const restOfParagraph = paragraph.slice(1);
                return (
                  <p
                    key={pIdx}
                    className="leading-[1.65] sm:leading-[1.7] text-justify font-serif font-light text-xs sm:text-sm md:text-[15px] lg:text-[15.5px] text-[#2B231D] dark:text-[#DDD5CA]"
                  >
                    <span className="float-left text-4xl sm:text-5xl leading-[0.8] pr-2.5 pt-0.5 font-serif font-bold text-amber-800 dark:text-[#E8C582] select-none">
                      {firstLetter}
                    </span>
                    {restOfParagraph}
                  </p>
                );
              }
              return (
                <p
                  key={pIdx}
                  className={`leading-[1.65] sm:leading-[1.7] text-justify font-serif font-light text-xs sm:text-sm md:text-[15px] lg:text-[15.5px] text-[#2B231D] dark:text-[#DDD5CA] ${
                    pIdx > 0 || !page.isFirstPageOfChapter ? 'indent-5 sm:indent-7' : ''
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Fixed Height Bottom Page Number */}
          <div className="h-5 flex-shrink-0 flex items-center justify-center text-[11px] sm:text-xs font-serif text-[#8A7B6E] dark:text-[#8E8478]">
            {page.pageNumber}
          </div>
        </div>
      );
    }

    // Finis Page
    return (
      <div className="relative flex-1 p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] h-full">
        <div className="h-4 flex-shrink-0" />

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 min-h-0 py-8">
          <span className="text-3xl font-serif italic text-amber-800 dark:text-[#E8C582]">
            FINIS
          </span>
          <p className="text-xs sm:text-sm font-serif italic text-[#7A695A] dark:text-[#A89E92] max-w-xs leading-relaxed">
            {currentBook?.epigraph?.quote || ''}
          </p>
        </div>

        <div className="h-6 flex-shrink-0 flex items-center justify-center text-xs font-serif text-[#8A7B6E] dark:text-[#8E8478]">
          {page.pageNumber}
        </div>
      </div>
    );
  };

  return (
    <div
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none px-4 sm:px-8 py-6 z-20 overflow-hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. SHELF LAYER (Zooms slowly & deeply into the center book paper)         */}
      {/* ========================================================================= */}
      <motion.div
        animate={{
          scale: isZoomingPaper ? 2.2 : 1,
          opacity: isZoomingPaper ? 0 : 1,
          filter: isZoomingPaper ? 'blur(28px)' : 'blur(0px)',
          pointerEvents: isCoverOpen || isReaderSpread ? 'none' : 'auto',
        }}
        transition={{
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
      >
        {/* FAR-LEFT ARROW (Screen Edge) */}
        <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-40">
          {selectedIndex > 0 && (
            <button
              onClick={handlePrevShelf}
              title="Previous Tome"
              className="p-3 sm:p-3.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* 3D COVER CAROUSEL STAGE */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
          className={`relative w-full max-w-5xl h-[420px] sm:h-[460px] md:h-[500px] flex items-center justify-center touch-none select-none my-auto ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {storybooksData.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              index={index}
              position={position}
              selectedIndex={selectedIndex}
              isCoverOpen={selectedIndex === index && isCoverOpen}
              onSelect={handleCardSelect}
            />
          ))}
        </div>

        {/* FAR-RIGHT ARROW (Screen Edge) */}
        <div className="absolute right-4 sm:right-8 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-40">
          {selectedIndex < storybooksData.length - 1 && (
            <button
              onClick={handleNextShelf}
              title="Next Tome"
              className="p-3 sm:p-3.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* STEP INDICATOR COUNTER */}
        <div className="absolute bottom-6 sm:bottom-8 z-30 flex items-center gap-3 font-serif italic text-sm sm:text-base text-white tracking-widest">
          <span style={{ textShadow: '0 1px 6px rgba(0,0,0,0.85)' }}>
            0{selectedIndex + 1}
          </span>
          <span className="w-12 h-[1px] bg-white/40 shadow-sm" />
          <span style={{ textShadow: '0 1px 6px rgba(0,0,0,0.85)' }}>
            0{storybooksData.length}
          </span>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. DUAL-PAGE SPREAD AUTHENTIC NOVEL SIMULATION (PAGINATED & NO SCROLL)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReaderSpread && (
          <motion.div
            key="reader-spread-active"
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 15 }}
            transition={{
              duration: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-6xl xl:max-w-7xl h-[92vh] max-h-[860px] flex flex-col items-center justify-between z-40 my-auto px-2 sm:px-4"
          >
            {/* Top Reader Floating Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full flex items-center justify-between px-4 py-2 z-30 mb-2"
            >
              {/* Back to Shelf Button */}
              <button
                onClick={handleCloseSequence}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 text-amber-100 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-serif transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Return to Shelf</span>
              </button>

              {/* Center Book Title Badge */}
              <div className="flex items-center gap-2.5 font-serif text-sm sm:text-base text-amber-200/90 tracking-wider">
                <span className="font-bold">{currentBook?.title || 'StoryBook'}</span>
                <span className="opacity-40">•</span>
                <span className="italic text-amber-400">
                  {currentSpread?.leftPage?.type === 'blank-cover'
                    ? 'Front Matter'
                    : currentSpread?.leftPage?.type === 'chapter-title-leaf'
                    ? currentSpread.leftPage.chapterNumber
                    : `Spread ${currentSpreadIndex + 1}`}
                </span>
              </div>

              {/* Table of Contents Drawer Trigger */}
              <button
                onClick={() => setIsTocOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 text-amber-100 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-serif transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <List className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Index</span>
              </button>
            </motion.div>

            {/* ================= DUAL-PAGE SPREAD PHYSICAL BOOK CONTAINER ================= */}
            <div className="relative w-full flex-1 flex items-stretch justify-center rounded-3xl shadow-[0_35px_100px_rgba(0,0,0,0.9)] border-2 border-[#D8A048]/70 bg-[#160E0A] p-3 sm:p-4 overflow-hidden">
              
              {/* Outer Hardcover Base Tray */}
              <div className="absolute inset-0 bg-[#2B1612] rounded-3xl pointer-events-none" />
              <div className="absolute inset-2 border border-amber-400/40 rounded-2xl pointer-events-none" />

              {/* ================= OPEN PARCHMENT SPREAD ================= */}
              <div className="relative w-full h-full flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] text-[#2B231D] dark:text-[#EAE3D9] shadow-inner">
                
                {/* LEFT PAGE */}
                {renderNovelPage(currentSpread?.leftPage, true)}

                {/* CENTER BOOK SPINE CREASE & GUTTER */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gradient-to-r from-black/20 via-black/5 to-black/20 pointer-events-none z-20 shadow-inner" />

                {/* Silk Ribbon Bookmark */}
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="hidden md:block absolute left-1/2 top-0 w-5 h-36 -translate-x-1/2 bg-gradient-to-b from-red-800 via-red-900 to-red-950 rounded-b-sm shadow-md border-t border-amber-400/40 pointer-events-none z-30"
                />

                {/* RIGHT PAGE */}
                {renderNovelPage(currentSpread?.rightPage, false)}

              </div>
            </div>

            {/* ================= BOTTOM SPREAD PAGE-TURN NAVIGATION ================= */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full flex items-center justify-between px-4 py-2 z-30 mt-2"
            >
              {/* Prev Spread Button */}
              <button
                onClick={handlePrevSpread}
                disabled={currentSpreadIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 hover:bg-black/70 text-amber-100 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-serif disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Turn Left</span>
              </button>

              {/* Progress Indicator / Spread Counter */}
              <div className="flex items-center gap-2 font-serif text-xs sm:text-sm text-amber-200/80">
                <span className="font-mono">
                  {currentSpreadIndex === 0
                    ? 'Front Matter'
                    : `Spread ${currentSpreadIndex}`}
                </span>
                <span>/</span>
                <span className="font-mono">{spreads.length - 1} Spreads</span>
              </div>

              {/* Next Spread Button */}
              <button
                onClick={handleNextSpread}
                disabled={currentSpreadIndex === spreads.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs sm:text-sm font-serif disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <span>Turn Right</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SLIDE-OVER TABLE OF CONTENTS (DRAWER) ================= */}
      <AnimatePresence>
        {isTocOpen && isReaderSpread && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTocOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-[#FAF6EE] dark:bg-[#151210] border-l border-amber-900/20 dark:border-amber-100/10 shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <h3 className="font-serif font-bold text-base text-[#1F1712] dark:text-white tracking-wide">
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setIsTocOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#6B5E51] dark:text-[#A89E92] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-2 no-scrollbar">
                {/* Front Matter Button */}
                <button
                  onClick={() => {
                    setCurrentSpreadIndex(0);
                    setIsTocOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                    currentSpreadIndex === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-sm'
                      : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-black/5 dark:hover:border-white/5 text-[#4A3F35] dark:text-[#C5BBAF]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A7B6E] dark:text-[#8E8478]">
                    Front Matter
                  </span>
                  <span className="font-serif font-semibold text-sm leading-snug">
                    Title & Table of Contents
                  </span>
                </button>

                {currentBook && currentBook.chapters && currentBook.chapters.map((ch, idx) => {
                  const targetPageNumber = (idx + 1) * 2;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleJumpToChapterByPage(targetPageNumber)}
                      className="w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer bg-white/40 dark:bg-white/5 border-transparent hover:border-black/5 dark:hover:border-white/5 text-[#4A3F35] dark:text-[#C5BBAF]"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A7B6E] dark:text-[#8E8478]">
                        <span>{ch.number}</span>
                        <span>Motif: {ch.motif}</span>
                      </div>
                      <span className="font-serif font-semibold text-sm leading-snug">
                        {ch.title}
                      </span>
                      <span className="text-xs font-serif italic text-[#7A695A] dark:text-[#A89E92] line-clamp-1">
                        {ch.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-[#8A7B6E] dark:text-[#8E8478] font-serif">
                <span>{currentBook?.title || ''}</span>
                <span>{currentBook?.chapters?.length || 0} Chapters</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default StoryBook;

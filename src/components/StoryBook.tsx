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
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { storybooksData, type StoryBookItem } from '../data/storybooks/index';
import { getAssetUrl } from '../lib/assets';
import StepCounter from './common/StepCounter';
import { elasticLayoutSpring } from '../lib/motion';

const BOOKMARK_STORAGE_KEY_PREFIX = 'tantalize_storybook_bookmark_';

const getSavedBookmarkSpread = (bookId: string): number | null => {
  try {
    const saved = localStorage.getItem(`${BOOKMARK_STORAGE_KEY_PREFIX}${bookId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const index = parsed?.spreadIndex;
      // Older records used 0 as "no bookmark". Only the new explicit flag makes 0 a saved spread.
      if (Number.isInteger(index) && index >= 0 && (index > 0 || parsed.bookmarked === true)) {
        return index;
      }
    }
  } catch {}
  return null;
};

const getSavedBookmarkPage = (bookId: string): number | null => {
  try {
    const saved = localStorage.getItem(`${BOOKMARK_STORAGE_KEY_PREFIX}${bookId}`);
    const pageIndex = saved ? JSON.parse(saved)?.pageIndex : null;
    if (Number.isInteger(pageIndex) && pageIndex >= 0) return pageIndex;
  } catch {}
  const spreadIndex = getSavedBookmarkSpread(bookId);
  return spreadIndex === null ? null : spreadIndex * 2;
};

const saveBookmarkSpread = (bookId: string, spreadIndex: number | null, pageIndex?: number) => {
  try {
    if (spreadIndex === null) {
      localStorage.removeItem(`${BOOKMARK_STORAGE_KEY_PREFIX}${bookId}`);
    } else {
      localStorage.setItem(
        `${BOOKMARK_STORAGE_KEY_PREFIX}${bookId}`,
        JSON.stringify({ spreadIndex, pageIndex: pageIndex ?? spreadIndex * 2, bookmarked: true, updatedAt: Date.now() }),
      );
    }
  } catch {}
};

function BookmarkRibbonMark() {
  return (
    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#4e1a20] via-[#933e3c] to-[#4e1a20] [clip-path:polygon(0_0,100%_0,100%_100%,50%_88%,0_100%)]">
      <span className="absolute inset-y-0 left-px w-px bg-amber-300/45" />
      <span className="absolute inset-y-0 right-px w-px bg-amber-300/45" />
      <span className="absolute top-4 bottom-6 left-1/2 w-px -translate-x-1/2 bg-amber-100/15" />
    </span>
  );
}

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
      className="storybook-shelf-card group absolute w-[260px] sm:w-[300px] md:w-[330px] aspect-[1/1.42] transition-shadow cursor-pointer select-none"
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
          {/* Thin, warm paper edges beneath the inner leaf. */}
          <div className="absolute right-1 top-2 bottom-2 w-1.5 bg-gradient-to-l from-[#B6A27F] via-[#E6D8BE] to-[#D4C2A4] rounded-r-sm border-l border-amber-900/10" />
          <div className="absolute bottom-1 left-2 right-2 h-1.5 bg-gradient-to-t from-[#B6A27F] via-[#E6D8BE] to-[#D4C2A4] rounded-b-sm border-t border-amber-900/10" />

          {/* Clean Antique Parchment Sheet */}
          <div className="relative w-[calc(100%-5px)] h-[calc(100%-5px)] rounded-r-2xl bg-[#FAF6EE] p-6 flex flex-col justify-between text-[#2B231D] shadow-inner overflow-hidden">
            <div className="absolute inset-3 border border-amber-900/10 rounded-r-xl pointer-events-none" />
            <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-[#8A7B6E] uppercase border-b border-amber-900/10 pb-1.5 z-10">
              <span>{book.volume}</span>
              <span>Page 01</span>
            </div>

            <div className="flex flex-col items-center text-center gap-2.5 my-auto z-10 py-4">
              <div className="w-14 h-14 rounded-full border border-amber-600/30 flex items-center justify-center bg-amber-500/10 shadow-xs">
                {renderEmblemIcon(book.emblem, 'w-7 h-7 text-amber-700')}
              </div>
              <h4 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#1F1712]">
                {book.title}
              </h4>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-1.5 z-10">
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
      type: 'frontispiece';
      book: StoryBookItem;
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
      chapterId: string;
      chapterNumber: string;
      chapterTitle: string;
      subtitle: string;
      motif: string;
      theme: string;
      emblem?: StoryBookItem['emblem'];
      pageNumber: number;
    }
  | {
      type: 'chapter-narrative';
      chapterId: string;
      chapterNumber: string;
      chapterTitle: string;
      subtitle: string;
      motif: string;
      paragraphs: string[];
      isFirstPageOfChapter: boolean; // only page 1 gets drop-cap
      isLastPageOfChapter: boolean;
      pageNumber: number;
    }
  | {
      type: 'finis';
      book: StoryBookItem;
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
  const [mobilePageIndex, setMobilePageIndex] = useState(0);
  const [mobilePageDirection, setMobilePageDirection] = useState(1);
  const mobileTouchStartRef = useRef<{ x: number; y: number } | null>(null);
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

  // Persistent Reading Bookmark State (Manual Put / Take off Bookmark)
  const [savedBookmarkSpread, setSavedBookmarkSpread] = useState<number | null>(() =>
    getSavedBookmarkSpread(currentBook?.id || 'adoketos'),
  );
  const [savedBookmarkPage, setSavedBookmarkPage] = useState<number | null>(() =>
    getSavedBookmarkPage(currentBook?.id || 'adoketos'),
  );
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState('Bookmark Placed');

  // Sync bookmark from storage when active book changes
  useEffect(() => {
    if (currentBook?.id) {
      const saved = getSavedBookmarkSpread(currentBook.id);
      setSavedBookmarkSpread(saved);
      setSavedBookmarkPage(getSavedBookmarkPage(currentBook.id));
    }
  }, [currentBook?.id]);

  // =========================================================================
  // CONTINUOUS OPTIMAL NOVEL PAGINATOR:
  // 1. Each new chapter starts with a dedicated Title Leaf on the facing page.
  // 2. The narrative pages maximize available vertical space from top to bottom
  //    using continuous sentence-level flow, with zero empty waste and zero overflow.
  // =========================================================================
  const { spreads, chapterPageMap } = useMemo(() => {
    const allPages: NovelPageData[] = [];
    const chapterMap: { chapterId: string; number: string; title: string; motif: string; pageNumber: number }[] = [];

    // Page 0: Inside Frontispiece / Ex Libris (Left page of Front Matter)
    allPages.push({
      type: 'frontispiece',
      book: currentBook,
      pageNumber: 0,
    });

    // Page 1: Table of Contents Placeholder (Right page of Front Matter)
    allPages.push({
      type: 'toc',
      bookTitle: currentBook?.title || '',
      subtitle: currentBook?.subtitle || '',
      chapterPageMap: [],
      pageNumber: 1,
    });

    let pageCounter = 2;

    // Full narrative capacity budget (calibrated for balanced editorial font size & vertical page fill)
    const NARRATIVE_CHAR_BUDGET = 880;

    if (currentBook && currentBook.chapters && currentBook.chapters.length > 0) {
      currentBook.chapters.forEach((ch) => {
        // Dedicated Chapter Title Leaf page
        const titleLeafPage = pageCounter++;
        chapterMap.push({
          chapterId: ch.id,
          number: ch.number,
          title: ch.title,
          motif: ch.motif,
          pageNumber: titleLeafPage,
        });

        allPages.push({
          type: 'chapter-title-leaf',
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          subtitle: ch.subtitle,
          motif: ch.motif,
          theme: ch.theme,
          emblem: currentBook.emblem,
          pageNumber: titleLeafPage,
        });

        // Narrative text pages (maximized packing with sentence-level splitting)
        let isFirst = true;
        let curParas: string[] = [];
        let curChars = 0;

        const flush = (isLast: boolean) => {
          if (curParas.length === 0) return;
          allPages.push({
            type: 'chapter-narrative',
            chapterId: ch.id,
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            subtitle: ch.subtitle,
            motif: ch.motif,
            paragraphs: [...curParas],
            isFirstPageOfChapter: isFirst,
            isLastPageOfChapter: isLast,
            pageNumber: pageCounter++,
          });
          isFirst = false;
          curParas = [];
          curChars = 0;
        };

        for (let pIdx = 0; pIdx < ch.paragraphs.length; pIdx++) {
          const rawPara = ch.paragraphs[pIdx].trim();
          if (!rawPara) continue;

          const paraCost = rawPara.length + 20;

          if (curChars + paraCost <= NARRATIVE_CHAR_BUDGET) {
            curParas.push(rawPara);
            curChars += paraCost;
          } else {
            // Split paragraph into natural sentences so page is filled completely
            const sentences = rawPara.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [rawPara];
            const fitSentences: string[] = [];
            const remSentences: string[] = [];
            let tempChars = curChars;

            for (const s of sentences) {
              if (tempChars + s.length <= NARRATIVE_CHAR_BUDGET || (fitSentences.length === 0 && curChars < NARRATIVE_CHAR_BUDGET * 0.45)) {
                fitSentences.push(s);
                tempChars += s.length;
              } else {
                remSentences.push(s);
              }
            }

            if (fitSentences.length > 0) {
              curParas.push(fitSentences.join(' ').trim());
            }

            flush(false);

            if (remSentences.length > 0) {
              const remText = remSentences.join(' ').trim();
              curParas.push(remText);
              curChars += remText.length + 20;
            }
          }
        }

        if (curParas.length > 0) {
          flush(true);
        }
      });
    }

    // Final Page: Finis
    allPages.push({
      type: 'finis',
      book: currentBook,
      pageNumber: pageCounter++,
    });

    // Update Page 1 (Table of Contents) with the calculated chapterMap
    allPages[1] = {
      type: 'toc',
      bookTitle: currentBook?.title || '',
      subtitle: currentBook?.subtitle || '',
      chapterPageMap: chapterMap,
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

    return { spreads: spreadList, chapterPageMap: chapterMap };
  }, [currentBook]);

  // The phone reader uses the same ordered content, but reveals one leaf at a time.
  const mobilePages = useMemo(
    () => spreads.flatMap((spread) => [spread.leftPage, spread.rightPage]).filter((page) => page.type !== 'blank-cover'),
    [spreads],
  );

  const currentSpread = useMemo(() => {
    if (!spreads || spreads.length === 0) {
      return {
        id: 'spread-fallback',
        spreadIndex: 0,
        leftPage: { type: 'blank-cover' as const, pageNumber: 0 },
        rightPage: { type: 'finis' as const, book: currentBook, pageNumber: 1 },
      };
    }
    return spreads[currentSpreadIndex] || spreads[0];
  }, [spreads, currentSpreadIndex, currentBook]);

  // 3D Physical Page Turn States
  const [turnAnimation, setTurnAnimation] = useState<{
    direction: 'forward' | 'backward';
    fromSpreadIdx: number;
    toSpreadIdx: number;
    durationSec?: number;
  } | null>(null);
  const [isBookmarkRetracting, setIsBookmarkRetracting] = useState(false);
  const isFlippingRef = useRef(false);
  const flipTimerRef = useRef<number | null>(null);

  const isMobileReader = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const isCurrentSpreadBookmarked = isMobileReader
    ? savedBookmarkPage === mobilePageIndex && savedBookmarkPage !== null
    : savedBookmarkSpread !== null &&
      (turnAnimation ? turnAnimation.toSpreadIdx === savedBookmarkSpread : currentSpreadIndex === savedBookmarkSpread);

  // Toggle Bookmark: Put Bookmark / Take off Bookmark
  const handleToggleBookmark = useCallback(() => {
    if (!currentBook?.id) return;

    if (isCurrentSpreadBookmarked) {
      // Take off Bookmark
      saveBookmarkSpread(currentBook.id, null);
      setSavedBookmarkSpread(null);
      setSavedBookmarkPage(null);
      setBookmarkToastMessage('Bookmark Removed');
      setShowBookmarkToast(true);
      window.setTimeout(() => setShowBookmarkToast(false), 2000);
    } else {
      // Put Bookmark on this page
      const pageIndex = isMobileReader ? mobilePageIndex : currentSpreadIndex * 2;
      saveBookmarkSpread(currentBook.id, currentSpreadIndex, pageIndex);
      setSavedBookmarkSpread(currentSpreadIndex);
      setSavedBookmarkPage(pageIndex);
      setBookmarkToastMessage('Bookmark Placed');
      setShowBookmarkToast(true);
      window.setTimeout(() => setShowBookmarkToast(false), 2000);
    }
  }, [currentBook?.id, currentSpreadIndex, isCurrentSpreadBookmarked, isMobileReader, mobilePageIndex]);

  const clearSequenceTimers = () => {
    sequenceTimersRef.current.forEach((t) => window.clearTimeout(t));
    sequenceTimersRef.current = [];
    if (flipTimerRef.current) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
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

  // Unified Opening Sequence with Resume from Bookmark
  const handleOpenSequence = useCallback((book: StoryBookItem) => {
    if (!book.isAvailable) return;
    clearSequenceTimers();
    isFlippingRef.current = false;
    setIsBookmarkRetracting(false);
    setTurnAnimation(null);

    const savedSpread = getSavedBookmarkSpread(book.id);
    setIsCoverOpen(true);
    const resumeSpread = savedSpread !== null && savedSpread < spreads.length ? savedSpread : 0;
    setCurrentSpreadIndex(resumeSpread);
    const savedPage = getSavedBookmarkPage(book.id);
    setMobilePageIndex(savedPage !== null && savedPage < mobilePages.length ? savedPage : resumeSpread * 2);

    const t1 = window.setTimeout(() => {
      setIsZoomingPaper(true);
    }, 750);

    const t2 = window.setTimeout(() => {
      setIsReaderSpread(true);
    }, 1450);

    sequenceTimersRef.current = [t1, t2];
  }, [spreads.length, mobilePages.length]);

  // Unified Closing Sequence
  const handleCloseSequence = useCallback(() => {
    clearSequenceTimers();
    isFlippingRef.current = false;
    setIsBookmarkRetracting(false);
    setTurnAnimation(null);

    setIsReaderSpread(false);
    setIsTocOpen(false);

    // Let the reader start shrinking first, then reveal the shelf beneath it.
    const t1 = window.setTimeout(() => {
      setIsZoomingPaper(false);
    }, 300);

    // Close the cover only after the shelf book is back in place.
    const t2 = window.setTimeout(() => {
      setIsCoverOpen(false);
    }, 1200);

    sequenceTimersRef.current = [t1, t2];
  }, []);

  // Jump to specific chapter spread with Sequential Multi-Page Flip Animation
  const handleJumpToChapterByPage = useCallback(
    (pageNumber: number) => {
      const targetSpreadIdx = Math.floor(pageNumber / 2);
      if (targetSpreadIdx < 0 || targetSpreadIdx >= spreads.length) return;

      setIsTocOpen(false);

      if (targetSpreadIdx === currentSpreadIndex) return;
      if (isFlippingRef.current) return;

      const diff = targetSpreadIdx - currentSpreadIndex;
      const step = diff > 0 ? 1 : -1;
      const totalSteps = Math.abs(diff);

      // Single turns stay deliberate. Longer jumps accelerate through the middle,
      // then slow down so the destination feels like a natural landing.
      let currentStep = 0;
      let curIdx = currentSpreadIndex;

      const stepRiffle = () => {
        if (currentStep >= totalSteps) {
          isFlippingRef.current = false;
          setTurnAnimation(null);
          return;
        }

        const fromIdx = curIdx;
        const toIdx = curIdx + step;
        const progress = totalSteps === 1 ? 0 : currentStep / (totalSteps - 1);
        const edgeWeight = Math.pow(Math.abs(2 * progress - 1), 1.5);
        const stepDurationMs = totalSteps === 1 ? 800 : Math.round(180 + 220 * edgeWeight);
        curIdx = toIdx;
        currentStep++;

        isFlippingRef.current = true;
        setTurnAnimation({
          direction: step > 0 ? 'forward' : 'backward',
          fromSpreadIdx: fromIdx,
          toSpreadIdx: toIdx,
          durationSec: stepDurationMs / 1000,
        });

        if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = window.setTimeout(() => {
          setCurrentSpreadIndex(toIdx);
          if (currentStep < totalSteps) {
            stepRiffle();
          } else {
            requestAnimationFrame(() => {
              setTurnAnimation(null);
              isFlippingRef.current = false;
            });
          }
        }, stepDurationMs + (currentStep === totalSteps ? 40 : 0));
      };

      isFlippingRef.current = true;
      if (savedBookmarkSpread === currentSpreadIndex) {
        setIsBookmarkRetracting(true);
        flipTimerRef.current = window.setTimeout(() => {
          setIsBookmarkRetracting(false);
          stepRiffle();
        }, 220);
      } else {
        stepRiffle();
      }
    },
    [currentSpreadIndex, savedBookmarkSpread, spreads.length],
  );

  const goToMobilePage = useCallback((targetPage: number) => {
    setIsTocOpen(false);
    if (targetPage < 0 || targetPage >= mobilePages.length || targetPage === mobilePageIndex) return;
    setMobilePageDirection(targetPage > mobilePageIndex ? 1 : -1);
    setMobilePageIndex(targetPage);
    setCurrentSpreadIndex(Math.floor(targetPage / 2));
    setIsTocOpen(false);
  }, [mobilePageIndex, mobilePages.length]);

  // Turn to Next Spread with 3D Page Turn Animation (Unified with Index Engine)
  const handleNextSpread = useCallback(() => {
    if (currentSpreadIndex < spreads.length - 1) {
      handleJumpToChapterByPage((currentSpreadIndex + 1) * 2);
    }
  }, [currentSpreadIndex, spreads.length, handleJumpToChapterByPage]);

  // Turn to Previous Spread with 3D Page Turn Animation (Unified with Index Engine)
  const handlePrevSpread = useCallback(() => {
    if (currentSpreadIndex > 0) {
      handleJumpToChapterByPage((currentSpreadIndex - 1) * 2);
    }
  }, [currentSpreadIndex, handleJumpToChapterByPage]);

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
    if (!isActive || isTocOpen) return;
    e.stopPropagation();

    const now = Date.now();
    if (now - lastWheelTimeRef.current < 220) return;

    if (isReaderSpread) {
      // Phone leaves scroll internally; wheel gestures must not skip unread text.
      if (window.matchMedia('(max-width: 767px)').matches) return;
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
        if (window.matchMedia('(max-width: 767px)').matches) {
          if (e.key === 'ArrowRight') goToMobilePage(mobilePageIndex + 1);
          if (e.key === 'ArrowLeft') goToMobilePage(mobilePageIndex - 1);
        } else {
          if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') handleNextSpread();
          if (e.key === 'ArrowLeft' || e.key === 'PageUp') handlePrevSpread();
        }
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
    goToMobilePage,
    mobilePageIndex,
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

  // Helper to render an individual novel page authentically with maximized content density
  const renderNovelPage = (page: NovelPageData | undefined, isLeft: boolean, mobile = false) => {
    if (!page || page.type === 'blank-cover') {
      return (
        <div
          style={{ backgroundColor: currentBook?.coverColor || '#2B1612', transform: 'translateZ(0)' }}
          className={`relative w-full h-full ${
            isLeft ? 'rounded-l-2xl' : 'rounded-r-2xl'
          } overflow-hidden bg-gradient-to-br from-black/20 via-transparent to-black/40`}
        />
      );
    }

    // 1. FRONTISPIECE / HALF-TITLE PAGE (Pure Minimalist Title Page)
    if (page.type === 'frontispiece') {
      const book = page.book;
      return (
        <div
          style={{ transform: 'translateZ(0)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          className="relative w-full h-full p-7 sm:p-9 md:p-11 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#2B231D] [text-rendering:geometricPrecision]"
        >
          {/* Inner Paper Border Accent */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-amber-900/10 rounded-2xl pointer-events-none" />

          {/* Pure Minimalist Book Title */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 min-h-0 py-6 px-4 z-10 my-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1F1712] tracking-[0.2em] uppercase">
              {book.title}
            </h2>
            {book.originalTitle && (
              <p className="text-xs sm:text-sm font-serif italic text-amber-800/80 tracking-widest">
                {book.originalTitle}
              </p>
            )}
          </div>

          {/* Uniform Centered Footer */}
          <div className="flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-2.5 z-10 flex-shrink-0">
            <span>{String(page.pageNumber).padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    // 2. TABLE OF CONTENTS / INDEX (Right page of Front Matter)
    if (page.type === 'toc') {
      return (
        <div
          style={{ transform: 'translateZ(0)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          className="relative w-full h-full p-7 sm:p-9 md:p-11 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#2B231D] [text-rendering:geometricPrecision]"
        >
          {/* Inner Paper Border Accent */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-amber-900/10 rounded-2xl pointer-events-none" />

          {/* Book Title & Clickable Index Table with Hierarchy & Dot Leaders */}
          <div className={`flex-1 flex flex-col justify-start min-h-0 py-2 px-2 sm:px-6 md:px-8 z-10 ${mobile ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`}>
            <div className="text-center pb-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#1F1712] tracking-wide">
                Table of Contents
              </h3>
              <p className="text-xs sm:text-sm font-serif italic text-amber-800/80 mt-0.5">
                Chronicle of Thirteen Convergences
              </p>
              <div className="w-12 h-px bg-amber-600/30 mx-auto my-2" />
            </div>

            {/* Clickable Index Table with Hierarchy, Dot Leaders & Larger Typography */}
            <div className={`w-full flex-1 flex flex-col py-1 space-y-1 ${mobile ? 'justify-start shrink-0' : 'justify-between overflow-hidden'}`}>
              {page.chapterPageMap?.map((item) => {
                const chSpreadIdx = Math.floor(item.pageNumber / 2);
                const isBookmarked = savedBookmarkSpread !== null && chSpreadIdx === savedBookmarkSpread;
                return (
                  <button
                    key={item.chapterId}
                    onClick={() => mobile ? goToMobilePage(item.pageNumber) : handleJumpToChapterByPage(item.pageNumber)}
                    className={`group w-full flex items-baseline justify-between rounded-md hover:bg-amber-500/10 text-left transition-colors cursor-pointer ${mobile ? 'min-h-11 py-2 px-0' : 'py-1 px-2'}`}
                  >
                    <div className="flex items-baseline gap-2.5 min-w-0 flex-1 pr-2">
                      <span className="font-serif text-xs sm:text-[13px] md:text-sm text-[#8A7B6E] w-16 sm:w-24 md:w-28 flex-shrink-0 text-left uppercase tracking-wider font-medium">
                        {item.number}
                      </span>
                      <span className={`font-serif font-medium text-[#241D17] group-hover:text-amber-800 flex items-center gap-1.5 ${mobile ? 'text-sm leading-tight' : 'text-xs sm:text-sm md:text-[14.5px] lg:text-[15px] truncate'}`} >
                        {item.title}
                        {isBookmarked && (
                          <Bookmark className="w-3.5 h-3.5 text-amber-700 fill-amber-500/30 flex-shrink-0" />
                        )}
                      </span>
                      <span className={`${mobile ? 'hidden' : 'flex-1'} border-b border-dotted border-[#8A7B6E]/40 mx-2 mb-1 min-w-[24px]`} />
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-[#8A7B6E] group-hover:text-amber-800 flex-shrink-0 tabular-nums font-semibold">
                      {String(item.pageNumber).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Uniform Centered Footer */}
          <div className="flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-2.5 z-10 flex-shrink-0">
            <span>{String(page.pageNumber).padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    // 3. DEDICATED CHAPTER TITLE LEAF (Pure, Clean & Simple)
    if (page.type === 'chapter-title-leaf') {
      return (
        <div
          style={{ transform: 'translateZ(0)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          className="relative w-full h-full p-7 sm:p-9 md:p-11 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#2B231D] [text-rendering:geometricPrecision]"
        >
          {/* Inner Paper Border Accent */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-amber-900/10 rounded-2xl pointer-events-none" />

          {/* Pure & Minimalist Center Chapter Division */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 min-h-0 py-6 px-4 sm:px-8 z-10 my-auto">
            <span className="text-xs sm:text-sm font-serif tracking-[0.35em] text-amber-800 uppercase font-semibold">
              {page.chapterNumber}
            </span>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1F1712] tracking-wide max-w-md leading-snug">
              {page.chapterTitle}
            </h3>

            {page.subtitle && (
              <p className="text-xs sm:text-sm font-serif italic text-[#7A695A] max-w-xs leading-relaxed mt-1">
                {page.subtitle}
              </p>
            )}
          </div>

          {/* Uniform Centered Footer */}
          <div className="flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-2.5 z-10 flex-shrink-0">
            <span>{String(page.pageNumber).padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    // 4. MAXIMIZED NARRATIVE TEXT PAGE (Continuous full-height text flow)
    if (page.type === 'chapter-narrative') {
      return (
        <div
          style={{ transform: 'translateZ(0)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          className="relative w-full h-full p-7 sm:p-9 md:p-11 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#2B231D] [text-rendering:geometricPrecision]"
        >
          {/* Inner Paper Border Accent */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-amber-900/10 rounded-2xl pointer-events-none" />

          {/* Narrative Text Body (Balanced, highly legible editorial font) */}
          <div className={`flex-1 flex flex-col justify-start gap-2.5 sm:gap-3 min-h-0 py-1 px-2 sm:px-4 md:px-6 z-10 ${mobile ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'}`} >
            {page.paragraphs?.map((paragraph, pIdx) => {
              if (page.isFirstPageOfChapter && pIdx === 0 && paragraph.length > 0) {
                const firstLetter = paragraph.charAt(0);
                const restOfParagraph = paragraph.slice(1);
                return (
                  <p
                    key={pIdx}
                    className="leading-[1.66] sm:leading-[1.7] md:leading-[1.74] text-justify font-serif font-normal text-[14.5px] sm:text-[16px] md:text-[17px] lg:text-[17.5px] text-[#1A1410] hyphens-auto select-text"
                  >
                    <span className="float-left text-5xl sm:text-6xl md:text-7xl leading-[0.8] pr-3 pt-1 font-serif font-bold text-amber-800 select-text">
                      {firstLetter}
                    </span>
                    {restOfParagraph}
                  </p>
                );
              }
              return (
                <p
                  key={pIdx}
                  className={`leading-[1.66] sm:leading-[1.7] md:leading-[1.74] text-justify font-serif font-normal text-[14.5px] sm:text-[16px] md:text-[17px] lg:text-[17.5px] text-[#1A1410] hyphens-auto select-text ${
                    pIdx > 0 || !page.isFirstPageOfChapter ? 'indent-6 sm:indent-8' : ''
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Uniform Centered Footer */}
          <div className="flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-2.5 z-10 flex-shrink-0">
            <span>{String(page.pageNumber).padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    // 5. FINIS PAGE (Pure Video & Quote)
    if (page.type === 'finis') {
      return (
        <div
          style={{ transform: 'translateZ(0)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          className="relative w-full h-full p-7 sm:p-9 md:p-11 lg:p-12 flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#2B231D] [text-rendering:geometricPrecision]"
        >
          {/* Inner Paper Border Accent */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-amber-900/10 rounded-2xl pointer-events-none" />

          {/* Center Showcase: Pure Video & Quote */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 min-h-0 py-6 px-4 sm:px-8 z-10 my-auto">
            {/* Cinematic Animated Winged Man Painting */}
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] aspect-[16/9] rounded-xl overflow-hidden border border-amber-900/20 shadow-xl bg-black/10">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="w-full h-full object-cover"
              >
                <source src={getAssetUrl('/videos/storybook-icarus.webm')} type="video/webm" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            <p className="text-sm sm:text-base md:text-[17px] font-serif italic text-[#3D3126] max-w-md leading-relaxed px-2 mt-2">
              "Icarus died smiling, for to fall is to have once soared"
            </p>
          </div>

          {/* Uniform Centered Footer */}
          <div className="flex items-center justify-center text-[11px] sm:text-xs font-mono text-[#8A7B6E] border-t border-amber-900/10 pt-2.5 z-10 flex-shrink-0">
            <span>{String(page.pageNumber).padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    // Fallback blank parchment
    return (
      <div className="relative flex-1 p-8 overflow-hidden bg-[#FAF6EE] dark:bg-[#1A1614] h-full" />
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
          duration: isZoomingPaper ? 1.5 : 0.85,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
      >
        <h1 className="md:hidden absolute top-[clamp(5.5rem,16dvh,9rem)] left-0 right-0 z-30 text-center font-serif italic font-light text-4xl tracking-tight text-white select-text" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 8px 36px rgba(0,0,0,0.7)' }}>
          Story Books
        </h1>

        {/* FAR-LEFT ARROW (Screen Edge) */}
        <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-40">
          {selectedIndex > 0 && (
            <button
              onClick={handlePrevShelf}
              title="Previous Tome"
              className="glass-surface p-3 sm:p-3.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
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
              className="glass-surface p-3 sm:p-3.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        <StepCounter current={selectedIndex + 1} total={storybooksData.length} label="Story" />
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
            exit={{ opacity: 0, scale: 0.88, y: 15, transition: { duration: 0.65, ease: [0.4, 0, 0.8, 0.3] } }}
            transition={{
              duration: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
            className="absolute inset-x-0 top-3 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] md:relative md:inset-auto w-full max-w-6xl xl:max-w-7xl h-auto md:h-[92vh] max-h-[860px] flex flex-col items-center justify-between z-40 md:my-auto px-2 sm:px-4"
          >
            {/* Top Reader Floating Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full flex items-center justify-between px-2 sm:px-4 py-2 pt-14 md:pt-2 z-30 mb-2"
            >
              {/* Back to Shelf Button */}
              <button
                onClick={handleCloseSequence}
                className="glass-surface glass-ivory group flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5]/85 md:bg-[#FAF8F5]/60 dark:bg-[#161412]/75 md:dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/80 dark:hover:bg-[#161412]/80 text-stone-900 dark:text-amber-100 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 text-xs sm:text-sm font-serif transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_8px_32px_-6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-6px_rgba(0,0,0,0.3)]"
              >
                <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Return to Shelf</span>
              </button>

              {/* Right Action Group: Bookmark & Index Drawer Trigger */}
              <motion.div layout="position" transition={{ layout: elasticLayoutSpring }} className="flex items-center gap-2">
                {/* Put / Take off Bookmark Trigger */}
                <motion.button
                  layout="size"
                  transition={{ layout: elasticLayoutSpring }}
                  onClick={handleToggleBookmark}
                  title={isCurrentSpreadBookmarked ? 'Take off Bookmark' : 'Put Bookmark'}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full backdrop-blur-2xl backdrop-saturate-[180%] border text-xs font-serif transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_8px_32px_-6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-6px_rgba(0,0,0,0.3)] ${
                    isCurrentSpreadBookmarked
                      ? 'bg-red-950/40 text-amber-200 border-amber-400/50 shadow-[0_0_15px_rgba(216,160,72,0.3)]'
                      : 'bg-[#FAF8F5]/60 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/80 dark:hover:bg-[#161412]/80 text-stone-900 dark:text-amber-100 border-white/60 dark:border-white/20'
                  }`}
                >
                  {isCurrentSpreadBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-stone-600 dark:text-amber-200/80" />
                  )}
                  <motion.span layout="position" className="hidden sm:inline">
                    {showBookmarkToast
                      ? bookmarkToastMessage
                      : isCurrentSpreadBookmarked
                      ? 'Take off Bookmark'
                      : 'Put Bookmark'}
                  </motion.span>
                </motion.button>

                {/* Table of Contents Drawer Trigger */}
                <motion.button layout="position" transition={{ layout: elasticLayoutSpring }}
                  onClick={() => setIsTocOpen(true)}
                  className="glass-surface glass-ivory flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5]/60 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/80 dark:hover:bg-[#161412]/80 text-stone-900 dark:text-amber-100 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 text-xs sm:text-sm font-serif transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_8px_32px_-6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-6px_rgba(0,0,0,0.3)]"
                >
                  <List className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <span className="hidden sm:inline">Index</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Mobile reader: one independent parchment leaf per step. */}
            <div className="md:hidden relative w-full max-w-xl flex-1 min-h-0 rounded-2xl border border-[#D8A048]/70 bg-[#FAF6EE] p-1.5 shadow-[0_24px_60px_rgba(20,10,5,0.45)] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${currentBook.id}-${mobilePageIndex}`}
                  initial={{ opacity: 0, x: mobilePageDirection * 24, rotateY: mobilePageDirection * 5 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -mobilePageDirection * 24, rotateY: -mobilePageDirection * 5 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-full w-full rounded-xl overflow-hidden"
                >
                  {renderNovelPage(mobilePages[mobilePageIndex], false, true)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ================= DUAL-PAGE SPREAD PHYSICAL BOOK CONTAINER ================= */}
            <div className="relative hidden md:flex w-full flex-1 items-stretch justify-center rounded-3xl shadow-[0_35px_100px_rgba(0,0,0,0.9)] border-2 border-[#D8A048]/70 bg-[#160E0A] p-3 sm:p-4 overflow-visible">
              
              {/* Outer Hardcover Base Tray */}
              <div className="absolute inset-0 bg-[#2B1612] rounded-3xl pointer-events-none" />
              <div className="absolute inset-2 border border-amber-400/40 rounded-2xl pointer-events-none" />

              {/* ================= OPEN PARCHMENT SPREAD ================= */}
              <div
                style={{ perspective: '2200px', transformStyle: 'preserve-3d' }}
                className="relative w-full h-full flex flex-col md:flex-row rounded-2xl bg-[#FAF6EE] text-[#2B231D] shadow-inner overflow-visible"
              >
                {!turnAnimation ? (
                  <>
                    {/* IDLE LEFT PAGE */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(currentSpread?.leftPage, true)}
                    </div>

                    {/* IDLE RIGHT PAGE */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(currentSpread?.rightPage, false)}
                    </div>
                  </>
                ) : turnAnimation.direction === 'forward' ? (
                  <>
                    {/* BASE LEFT PAGE (Current Spread Left Page) */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(spreads[turnAnimation.fromSpreadIdx]?.leftPage, true)}
                    </div>

                    {/* BASE RIGHT PAGE (Upcoming Spread Right Page, already prepared underneath) */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(spreads[turnAnimation.toSpreadIdx]?.rightPage, false)}
                    </div>

                    {/* 3D TURNING LEAF (Rotates around center spine from 0deg to -180deg) */}
                    <motion.div
                      key={`turn-forward-${turnAnimation.fromSpreadIdx}-${turnAnimation.toSpreadIdx}`}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: -180 }}
                      transition={{
                        duration: turnAnimation.durationSec ?? 0.68,
                        ease: turnAnimation.durationSec && turnAnimation.durationSec < 0.4 ? 'easeInOut' : [0.45, 0, 0.55, 1],
                      }}
                      onAnimationComplete={() => {
                        if (!turnAnimation.durationSec) {
                          setCurrentSpreadIndex(turnAnimation.toSpreadIdx);
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              setTurnAnimation(null);
                              isFlippingRef.current = false;
                            });
                          });
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '50%',
                        width: '50%',
                        transformOrigin: 'left center',
                        transformStyle: 'preserve-3d',
                        zIndex: 30,
                        willChange: 'transform',
                      }}
                      className="hidden md:block pointer-events-none"
                    >
                      {/* FRONT FACE OF TURNING LEAF (From Right Page) */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                        className="w-full h-full flex flex-col overflow-visible bg-[#FAF6EE] shadow-[12px_0_24px_rgba(43,22,12,0.24)]"
                      >
                        {renderNovelPage(spreads[turnAnimation.fromSpreadIdx]?.rightPage, false)}
                        {/* Shading follows the leaf as it folds around the spine. */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.4, 0] }}
                          transition={{ duration: turnAnimation.durationSec ?? 0.68, ease: 'easeInOut' }}
                          className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none"
                        />
                      </div>

                      {/* BACK FACE OF TURNING LEAF (Upcoming Left Page Landing on Left Side - NON MIRRORED) */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          transform: 'rotateY(180deg)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                        className="w-full h-full flex flex-col overflow-visible bg-[#FAF6EE]"
                      >
                        {renderNovelPage(spreads[turnAnimation.toSpreadIdx]?.leftPage, true)}
                        {/* Dynamic landing shadow overlay as leaf settles */}
                        <motion.div
                          initial={{ opacity: 0.25 }}
                          animate={{ opacity: [0.25, 0] }}
                          transition={{ duration: turnAnimation.durationSec ?? 0.68, ease: 'easeOut' }}
                          className="absolute inset-0 bg-gradient-to-l from-black/25 via-black/10 to-transparent pointer-events-none"
                        />
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* BASE LEFT PAGE (Upcoming Spread Left Page, already prepared underneath) */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(spreads[turnAnimation.toSpreadIdx]?.leftPage, true)}
                    </div>

                    {/* BASE RIGHT PAGE (Current Spread Right Page) */}
                    <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-[#FAF6EE]">
                      {renderNovelPage(spreads[turnAnimation.fromSpreadIdx]?.rightPage, false)}
                    </div>

                    {/* 3D TURNING LEAF (Rotates around center spine from 0deg to 180deg) */}
                    <motion.div
                      key={`turn-backward-${turnAnimation.fromSpreadIdx}-${turnAnimation.toSpreadIdx}`}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{
                        duration: turnAnimation.durationSec ?? 0.68,
                        ease: turnAnimation.durationSec && turnAnimation.durationSec < 0.4 ? 'easeInOut' : [0.45, 0, 0.55, 1],
                      }}
                      onAnimationComplete={() => {
                        if (!turnAnimation.durationSec) {
                          setCurrentSpreadIndex(turnAnimation.toSpreadIdx);
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              setTurnAnimation(null);
                              isFlippingRef.current = false;
                            });
                          });
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: '50%',
                        transformOrigin: 'right center',
                        transformStyle: 'preserve-3d',
                        zIndex: 30,
                        willChange: 'transform',
                      }}
                      className="hidden md:block pointer-events-none"
                    >
                      {/* FRONT FACE (Turning Left Page) */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                        className="w-full h-full flex flex-col overflow-visible bg-[#FAF6EE] shadow-[-12px_0_24px_rgba(43,22,12,0.24)]"
                      >
                        {renderNovelPage(spreads[turnAnimation.fromSpreadIdx]?.leftPage, true)}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.4, 0] }}
                          transition={{ duration: turnAnimation.durationSec ?? 0.68, ease: 'easeInOut' }}
                          className="absolute inset-0 bg-gradient-to-l from-black/25 via-black/10 to-transparent pointer-events-none"
                        />
                      </div>

                      {/* BACK FACE (Upcoming Right Page Landing on Right Side - NON MIRRORED) */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          transform: 'rotateY(180deg)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                        className="w-full h-full flex flex-col overflow-visible bg-[#FAF6EE]"
                      >
                        {renderNovelPage(spreads[turnAnimation.toSpreadIdx]?.rightPage, false)}
                        <motion.div
                          initial={{ opacity: 0.25 }}
                          animate={{ opacity: [0.25, 0] }}
                          transition={{ duration: turnAnimation.durationSec ?? 0.68, ease: 'easeOut' }}
                          className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none"
                        />
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Subtle Center Book Spine Crease & Natural Fold Shadow (Ultra-refined, zero blocky occlusion) */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-amber-900/15 pointer-events-none z-40" />
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 bg-gradient-to-r from-black/[0.04] via-transparent to-black/[0.04] pointer-events-none z-40" />

                {/* Reveal the ribbon only after landing; retract it before turning away. */}
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 z-45 w-5 h-32 overflow-hidden pointer-events-none">
                  <AnimatePresence>
                    {!turnAnimation && isCurrentSpreadBookmarked && !isBookmarkRetracting && (
                      <motion.button
                        key="center-ribbon-bookmark"
                        type="button"
                        aria-label="Remove bookmark"
                        title="Remove bookmark"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onClick={handleToggleBookmark}
                        className="relative block w-full h-full cursor-pointer pointer-events-auto [filter:drop-shadow(0_5px_5px_rgba(39,17,11,0.35))]"
                      >
                        <BookmarkRibbonMark />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* A leaf at a time on phones; the two-page controls stay on desktop. */}
            <div className="md:hidden w-full flex items-center justify-between gap-2 px-2 py-2 mt-2 z-30">
              <button type="button" onClick={() => goToMobilePage(mobilePageIndex - 1)} disabled={mobilePageIndex === 0} className="min-h-11 min-w-20 px-3 rounded-full bg-[#FAF8F5]/75 text-stone-900 font-serif text-sm border border-white/60 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer">
                Previous
              </button>
              <span className="font-mono text-xs text-white/90 tabular-nums whitespace-nowrap [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
                {mobilePageIndex + 1} / {mobilePages.length}
              </span>
              <button type="button" onClick={() => goToMobilePage(mobilePageIndex + 1)} disabled={mobilePageIndex >= mobilePages.length - 1} className="min-h-11 min-w-20 px-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-serif text-sm border border-amber-400/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer">
                Next
              </button>
            </div>

            {/* ================= BOTTOM SPREAD PAGE-TURN NAVIGATION (Theme-standardized) ================= */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden md:flex w-full flex-wrap sm:flex-nowrap items-center justify-between px-4 py-2 z-30 mt-2"
            >
              {/* Prev Spread Button */}
              <button
                onClick={handlePrevSpread}
                disabled={currentSpreadIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5]/60 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/80 dark:hover:bg-[#161412]/80 text-stone-900 dark:text-amber-100 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 text-xs sm:text-sm font-serif disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_8px_32px_-6px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-6px_rgba(0,0,0,0.3)]"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Turn Left</span>
              </button>

              {/* Reading position and direct return to the saved spread. */}
              <motion.div layout="position" transition={{ layout: elasticLayoutSpring }} className="order-3 sm:order-none w-full sm:w-auto flex items-center justify-center gap-2 mt-2 sm:mt-0">
                <motion.div layout="position" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5]/40 dark:bg-[#161412]/50 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/40 dark:border-white/15 text-stone-900 dark:text-amber-200/90 font-serif text-xs sm:text-sm shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6)]">
                  <span className="font-mono">
                    {currentSpreadIndex === 0
                      ? 'Front Matter'
                      : `Spread ${currentSpreadIndex}`}
                  </span>
                  <span>/</span>
                  <span className="font-mono">{Math.max(1, spreads.length - 1)} Spreads</span>
                </motion.div>
                {savedBookmarkSpread !== null && (
                  <motion.button
                    layout="size"
                    transition={{ layout: elasticLayoutSpring }}
                    type="button"
                    onClick={() => handleJumpToChapterByPage(savedBookmarkSpread * 2)}
                    disabled={currentSpreadIndex === savedBookmarkSpread}
                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-amber-400/40 bg-[#FAF8F5]/65 dark:bg-[#161412]/70 px-3 py-1.5 font-serif text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 backdrop-blur-2xl transition-[background-color,opacity,border-color] duration-200 hover:bg-[#FAF8F5]/90 dark:hover:bg-[#161412]/90 disabled:opacity-50 disabled:cursor-default cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0" />
                    <motion.span layout="position" className="whitespace-nowrap">
                      {currentSpreadIndex === savedBookmarkSpread ? 'At Bookmark' : 'Go to Bookmark'}
                    </motion.span>
                  </motion.button>
                )}
              </motion.div>

              {/* Next Spread Button */}
              <button
                onClick={handleNextSpread}
                disabled={currentSpreadIndex >= spreads.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium text-xs sm:text-sm font-serif disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_8px_24px_-4px_rgba(216,160,72,0.4)] border border-amber-400/30"
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
          <div
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex justify-end"
          >
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

              <div
                onWheel={(e) => e.stopPropagation()}
                className="flex-1 overflow-y-auto py-4 space-y-2 no-scrollbar overscroll-contain"
              >
                {/* Front Matter Button */}
                <button
                  onClick={() => isMobileReader ? goToMobilePage(0) : handleJumpToChapterByPage(0)}
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

                {chapterPageMap.map((ch) => {
                  const targetSpreadIdx = Math.floor(ch.pageNumber / 2);
                  const isCurrentChapter = isMobileReader ? mobilePageIndex === ch.pageNumber : currentSpreadIndex === targetSpreadIdx;
                  const isBookmarkedChapter = savedBookmarkSpread !== null && targetSpreadIdx === savedBookmarkSpread;
                  return (
                    <button
                      key={ch.chapterId}
                      onClick={() => isMobileReader ? goToMobilePage(ch.pageNumber) : handleJumpToChapterByPage(ch.pageNumber)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                        isCurrentChapter
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-sm'
                          : 'bg-white/40 dark:bg-white/5 border-transparent hover:border-black/5 dark:hover:border-white/5 text-[#4A3F35] dark:text-[#C5BBAF]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A7B6E] dark:text-[#8E8478]">
                        <div className="flex items-center gap-1.5">
                          <span>{ch.number}</span>
                          {isBookmarkedChapter && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">
                              <Bookmark className="w-2.5 h-2.5 fill-amber-500/40" />
                              <span>Saved</span>
                            </span>
                          )}
                        </div>
                        <span>{String(ch.pageNumber).padStart(2, '0')}</span>
                      </div>
                      <span className="font-serif font-semibold text-sm leading-snug">
                        {ch.title}
                      </span>
                      <span className="text-xs font-serif italic text-[#7A695A] dark:text-[#A89E92] line-clamp-1">
                        Motif: {ch.motif}
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

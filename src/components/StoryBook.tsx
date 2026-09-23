import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  ArrowDown,
  Music,
  Code2,
  Brain,
  Feather,
  Bookmark,
  Layers,
  Scroll,
} from 'lucide-react';

export interface StoryChapter {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  latinMotto: string;
  icon: typeof BookOpen;
  yearSpan: string;
  dropCap: string;
  paragraphs: string[];
  keyHighlight: {
    quote: string;
    attribution: string;
  };
  tags: string[];
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'prologue',
    numeral: 'Prologue',
    title: "The Scholar's Sanctuary",
    subtitle: 'Where curiosity ignites and thought finds its timeless home',
    latinMotto: 'Initium Sapientiae Timor Domini',
    icon: Feather,
    yearSpan: 'Origins',
    dropCap: 'I',
    paragraphs: [
      'n the quiet sanctuary of the grand library, amidst towering marble arches and gilded leather-bound folios, the pursuit of knowledge begins not with certainty, but with relentless wonder. From an early age, every machine was a puzzle waiting to be deciphered, and every book a map to uncharted realms.',
      'Growing up in Jakarta, the intersection of science and artistry became a compass. Whether understanding how electrical pulses turn into mathematical logic, or how centuries of philosophy inform modern computation, every question asked opened five more doors.',
      'Here, inside this study of thought, ideas are forged into reality. The journey is not merely about writing code or training models, but about cultivating depth, purpose, and timeless craftsmanship in everything touched.',
    ],
    keyHighlight: {
      quote: 'The mind is not a vessel to be filled, but a fire to be kindled.',
      attribution: 'Plutarch',
    },
    tags: ['Curiosity', 'Philosophy', 'Origins'],
  },
  {
    id: 'engineering',
    numeral: 'Chapter I',
    title: "The Architect's Craft",
    subtitle: 'Forging robust structures of logic, systems, and clean scale',
    latinMotto: 'Scientia Potentia Est',
    icon: Code2,
    yearSpan: 'Systems & Code',
    dropCap: 'B',
    paragraphs: [
      'ehind every elegant interface lies a fortress of disciplined architecture. Software engineering to me is modern alchemy: transmuting abstract thoughts into resilient, high-performance systems that serve human needs seamlessly.',
      'From low-level data structures and memory patterns to scalable distributed microservices and reactive interfaces, craftsmanship requires an obsession with details. Every byte, every frame per second, and every API boundary is deliberate.',
      'Through academic leadership at BINUS, technical mentorship, and real-world system deployments, engineering transitioned from an individual craft into a collaborative pursuit of engineering excellence.',
    ],
    keyHighlight: {
      quote: 'Simplicity is prerequisite for reliability.',
      attribution: 'Edsger W. Dijkstra',
    },
    tags: ['Full-Stack', 'Architecture', 'High Performance'],
  },
  {
    id: 'ai-research',
    numeral: 'Chapter II',
    title: 'The Frontier of Intelligence',
    subtitle: 'Teaching mathematics to perceive, reason, and illuminate',
    latinMotto: 'Per Aspera Ad Astra',
    icon: Brain,
    yearSpan: 'AI & Deep Learning',
    dropCap: 'T',
    paragraphs: [
      'he dawn of modern artificial intelligence is our generation’s printing press. In deep learning and computer vision, we do not merely optimize loss functions; we teach silicon matrices to uncover patterns hidden beneath the noise of reality.',
      'My research spans computer vision applications, multimodal representations, and deep neural networks designed for real-world reliability. At the Apple Developer Academy and through continuous research, the focus is bridging bleeding-edge theory with practical human empowerment.',
      'We stand at an inflection point where software is no longer static instructions, but adaptive reasoning entities. Building with safety, mathematical rigor, and aesthetic elegance is the ultimate calling.',
    ],
    keyHighlight: {
      quote: 'The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.',
      attribution: 'Edsger W. Dijkstra',
    },
    tags: ['Computer Vision', 'Deep Learning', 'PyTorch'],
  },
  {
    id: 'polyphony',
    numeral: 'Chapter III',
    title: 'The Resonance of Piano',
    subtitle: 'Polyphony in Bach, romantic breadth in Chopin, discipline in touch',
    latinMotto: 'Ars Longa, Vita Brevis',
    icon: Music,
    yearSpan: 'Classical Music',
    dropCap: 'A',
    paragraphs: [
      't the keyboard of a grand piano, time bends. There is an intimate symmetry between counterpoint in a Bach fugue and concurrent execution in modern software: independent voices weaving together in harmonic equilibrium.',
      'Playing classical piano taught me tactile patience, micro-timing, and emotional resonance. The discipline needed to master Chopin’s ballades or Liszt’s etudes directly mirrors the perseverance needed to resolve complex distributed systems or debug non-converging gradient descents.',
      'Art and engineering are never opposites; they are two hands of the same pianist. Music brings soul to logic, ensuring that what we create remains deeply human.',
    ],
    keyHighlight: {
      quote: 'Music is the arithmetic of sounds as optics is the geometry of light.',
      attribution: 'Claude Debussy',
    },
    tags: ['Classical Piano', 'Chopin', 'Counterpoint'],
  },
  {
    id: 'epilogue',
    numeral: 'Epilogue',
    title: 'The Unending Horizon',
    subtitle: 'Continuing the quest with uncompromising craftsmanship',
    latinMotto: 'Ad Meliora',
    icon: Sparkles,
    yearSpan: 'The Horizon',
    dropCap: 'T',
    paragraphs: [
      'he canvas before us is vast and unwritten. In an era of rapid technological acceleration, true distinction is found not in fleeting trends, but in deep fundamentals, relentless curiosity, and unwavering taste.',
      'Whether building next-generation AI agents, crafting cinematic user experiences, or exploring classical repertoire, every endeavor is an ode to human potential.',
      'The book remains open. Each day is a fresh folio waiting to be written with purpose, beauty, and conviction.',
    ],
    keyHighlight: {
      quote: 'Stay hungry, stay foolish. The journey is the reward.',
      attribution: 'Steve Jobs',
    },
    tags: ['Vision', 'Craftsmanship', 'Future'],
  },
];

interface StoryBookProps {
  isActive?: boolean;
  onReachBottom?: () => void;
  onReachHome?: () => void;
  onReachArchive?: () => void;
}

export const StoryBook = memo(function StoryBook({
  isActive = true,
  onReachBottom,
  onReachHome,
  onReachArchive,
}: StoryBookProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'folio' | 'scroll'>('folio');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTimeRef = useRef(0);

  const chapter = STORY_CHAPTERS[currentChapterIndex];

  const handleBack = useCallback(() => {
    if (onReachArchive) {
      onReachArchive();
    } else if (onReachHome) {
      onReachHome();
    }
  }, [onReachArchive, onReachHome]);

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < STORY_CHAPTERS.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
    } else {
      if (onReachBottom) {
        onReachBottom();
      } else {
        handleBack();
      }
    }
  }, [currentChapterIndex, onReachBottom, handleBack]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
    } else {
      handleBack();
    }
  }, [currentChapterIndex, handleBack]);

  // Keyboard navigation when StoryBook is active
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevChapter();
      } else if (e.key === 'Escape' || e.key === 'Home') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNextChapter, handlePrevChapter, handleBack]);

  // Handle wheel events inside the StoryBook card
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 450) return;

    const target = e.currentTarget;
    const isAtTop = target.scrollTop <= 5;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 5;

    if (e.deltaY > 60) {
      if (isAtBottom || viewMode === 'folio') {
        lastScrollTimeRef.current = now;
        handleNextChapter();
      }
    } else if (e.deltaY < -60) {
      if (isAtTop || viewMode === 'folio') {
        lastScrollTimeRef.current = now;
        handlePrevChapter();
      }
    }
  };

  const IconComponent = chapter.icon;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto select-none">
      {/* Ambient Radial Vignette & Warm Golden Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-radial-at-c from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Renaissance Illuminated Book / Frosted Glass Codex */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl h-[86vh] max-h-[820px] rounded-3xl sm:rounded-[32px] bg-[#FAF8F5]/85 dark:bg-[#161412]/85 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-stone-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_1px_1px_rgba(255,255,255,0.4)_inset] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100"
      >
        {/* Top Ornate Header Bar */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-4 sm:py-5 border-b border-stone-300/60 dark:border-stone-800/80 flex items-center justify-between gap-4 bg-[#FAF8F5]/40 dark:bg-black/20">
          {/* Left: Codex Title & Latin Motto */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/20 flex items-center justify-center text-[#C28B38] dark:text-[#E8C582] shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif italic text-lg sm:text-xl font-medium tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                  The Grand Library & Chronicles
                </h2>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  Folio {currentChapterIndex + 1} of {STORY_CHAPTERS.length}
                </span>
              </div>
              <p className="font-serif italic text-xs sm:text-sm text-[#B07D2B] dark:text-[#E8C582]/90 tracking-wide">
                {chapter.latinMotto}
              </p>
            </div>
          </div>

          {/* Right: Chapter Selector Ribbon & View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode((prev) => (prev === 'folio' ? 'scroll' : 'folio'))}
              title={viewMode === 'folio' ? 'Switch to Continuous Scroll' : 'Switch to Folio Book'}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-stone-200/50 dark:bg-stone-800/50 hover:bg-stone-300/60 dark:hover:bg-stone-700/60 text-stone-700 dark:text-stone-300 text-xs font-sans flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              {viewMode === 'folio' ? (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-medium">Folio</span>
                </>
              ) : (
                <>
                  <Scroll className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-medium">Scroll</span>
                </>
              )}
            </button>

            {/* Quick Glide Back to Archive Hub Button */}
            <button
              onClick={handleBack}
              title="Return to Archive Hub"
              className="px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-400/15 dark:hover:bg-amber-400/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-sans tracking-wide uppercase font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Archive</span>
            </button>
          </div>
        </div>

        {/* Chapter Ribbon / Index Tabs */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-2.5 bg-stone-200/35 dark:bg-stone-900/40 border-b border-stone-300/40 dark:border-stone-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2">
          {STORY_CHAPTERS.map((item, idx) => {
            const isSelected = idx === currentChapterIndex;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentChapterIndex(idx)}
                className={`group relative px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wider transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 dark:bg-amber-400/20 text-amber-950 dark:text-amber-200 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-amber-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-300/30 dark:hover:bg-stone-800/40 border border-transparent'
                }`}
              >
                <span className="text-[10px] font-serif italic text-amber-700 dark:text-amber-400 font-semibold">
                  {idx === 0 ? '0' : idx === STORY_CHAPTERS.length - 1 ? 'Ω' : idx}
                </span>
                <span className="text-[11px] tracking-wide">{item.numeral}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Story Reader Body */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 md:p-12 select-text"
        >
          {viewMode === 'folio' ? (
            /* ================= FOLIO PAGE MODE ================= */
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl mx-auto space-y-8"
              >
                {/* Chapter Title & Epoch */}
                <div className="space-y-2 border-b border-stone-300/40 dark:border-stone-800/60 pb-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-[#B07D2B] dark:text-[#E8C582] font-semibold">
                    <IconComponent className="w-4 h-4" />
                    <span>{chapter.numeral}</span>
                    <span>•</span>
                    <span>{chapter.yearSpan}</span>
                  </div>
                  <h3 className="font-serif italic text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-950 dark:text-white leading-[1.15]">
                    {chapter.title}
                  </h3>
                  <p className="font-serif italic text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                    {chapter.subtitle}
                  </p>
                </div>

                {/* Chapter Paragraphs with Illuminated Drop Cap */}
                <div className="space-y-5 text-stone-800 dark:text-stone-200 font-serif text-lg sm:text-xl leading-relaxed sm:leading-loose tracking-wide">
                  {chapter.paragraphs.map((p, pIdx) => {
                    if (pIdx === 0) {
                      return (
                        <p key={pIdx} className="relative">
                          <span className="float-left text-5xl sm:text-6xl md:text-7xl font-serif italic text-[#C28B38] dark:text-[#E8C582] pr-3 sm:pr-4 pt-1 leading-none font-normal select-none drop-shadow-sm">
                            {chapter.dropCap}
                          </span>
                          {p}
                        </p>
                      );
                    }
                    return <p key={pIdx}>{p}</p>;
                  })}
                </div>

                {/* Illuminated Quote Card */}
                <div className="relative rounded-2xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/25 dark:border-amber-400/20 p-6 sm:p-7 backdrop-blur-md shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-[#B07D2B] dark:text-[#E8C582] font-semibold">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Illuminated Epigraph</span>
                  </div>
                  <blockquote className="font-serif italic text-lg sm:text-xl md:text-2xl text-stone-900 dark:text-stone-100 leading-snug">
                    "{chapter.keyHighlight.quote}"
                  </blockquote>
                  <p className="font-serif italic text-sm text-stone-600 dark:text-stone-400 text-right">
                    — {chapter.keyHighlight.attribution}
                  </p>
                </div>

                {/* Chapter Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {chapter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-sans tracking-wide bg-stone-200/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-stone-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            /* ================= CONTINUOUS PANORAMIC SCROLL MODE ================= */
            <div className="max-w-3xl mx-auto space-y-16 py-4">
              {STORY_CHAPTERS.map((chap, idx) => {
                const ChapIcon = chap.icon;
                return (
                  <section key={chap.id} className="space-y-6 scroll-mt-6 border-b border-stone-300/40 dark:border-stone-800/60 pb-12 last:border-b-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-[#B07D2B] dark:text-[#E8C582] font-semibold">
                        <ChapIcon className="w-4 h-4" />
                        <span>{chap.numeral}</span>
                        <span>•</span>
                        <span>{chap.yearSpan}</span>
                      </div>
                      <h3 className="font-serif italic text-3xl sm:text-4xl font-light text-stone-950 dark:text-white">
                        {chap.title}
                      </h3>
                      <p className="font-serif italic text-sm text-[#B07D2B] dark:text-[#E8C582]">
                        {chap.latinMotto}
                      </p>
                    </div>

                    <div className="space-y-4 text-stone-800 dark:text-stone-200 font-serif text-lg sm:text-xl leading-relaxed tracking-wide">
                      {chap.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>
                          {pIdx === 0 && (
                            <span className="float-left text-5xl font-serif italic text-[#C28B38] dark:text-[#E8C582] pr-3 leading-none select-none">
                              {chap.dropCap}
                            </span>
                          )}
                          {p}
                        </p>
                      ))}
                    </div>

                    <div className="rounded-xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/20 p-4 text-sm font-serif italic text-stone-800 dark:text-stone-200">
                      "{chap.keyHighlight.quote}" — <span className="opacity-75">{chap.keyHighlight.attribution}</span>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-3.5 sm:py-4 border-t border-stone-300/60 dark:border-stone-800/80 bg-[#FAF8F5]/60 dark:bg-black/30 flex items-center justify-between gap-4">
          {/* Previous Page Button */}
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0}
            className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              currentChapterIndex === 0
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : 'bg-white/70 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300/60 dark:border-stone-700 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Chapter Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {STORY_CHAPTERS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentChapterIndex(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === currentChapterIndex
                    ? 'w-6 bg-[#C28B38] dark:bg-[#E8C582]'
                    : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400 dark:hover:bg-stone-500'
                }`}
                title={`Jump to ${STORY_CHAPTERS[dotIdx].title}`}
              />
            ))}
          </div>

          {/* Next Page / Continue Downward Button */}
          <button
            onClick={handleNextChapter}
            className="px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider bg-[#C28B38] hover:bg-[#A87428] dark:bg-[#E8C582] dark:hover:bg-[#FFD88A] text-white dark:text-stone-950 font-medium border border-transparent shadow-sm flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
          >
            <span className="hidden sm:inline">
              {currentChapterIndex === STORY_CHAPTERS.length - 1 ? 'Explore World' : 'Next Chapter'}
            </span>
            {currentChapterIndex === STORY_CHAPTERS.length - 1 ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default StoryBook;

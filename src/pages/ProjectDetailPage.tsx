import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Github,
  ExternalLink,
  Calendar,
  Tag as TagIcon,
  User,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Play,
  Image as ImageIcon,
  LayoutGrid,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';
import { getProjectById, getAllProjects, type ProjectItem } from '../data/projects';
import { getAssetUrl } from '../lib/assets';
import ImageWithSkeleton from '../components/common/ImageWithSkeleton';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onSelectProject: (id: string) => void;
}

export const ProjectDetailPage = memo(function ProjectDetailPage({
  projectId,
  onBack,
  onSelectProject,
}: ProjectDetailPageProps) {
  const project = useMemo(() => getProjectById(projectId), [projectId]);
  const allProjects = useMemo(() => getAllProjects(), []);
  const currentIndex = useMemo(
    () => allProjects.findIndex((p) => p.id === project?.id),
    [allProjects, project],
  );

  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  // Unified media list (deduplicated thumbnail + gallery)
  const allMedia = useMemo(() => {
    if (!project) return [];
    const list: string[] = [];
    if (project.thumbnail) list.push(project.thumbnail);
    if (project.gallery) {
      project.gallery.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : project.thumbnail ? [project.thumbnail] : [];
  }, [project]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase');
  const [gridPage, setGridPage] = useState(1);
  const gridItemsPerPage = 6;
  const filmstripRef = useRef<HTMLDivElement>(null);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Scroll to top on project change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveMediaIndex(0);
    setGridPage(1);
  }, [projectId]);

  // Scroll active thumbnail into view inside filmstrip
  useEffect(() => {
    if (filmstripRef.current) {
      const activeEl = filmstripRef.current.querySelector(
        `[data-index="${activeMediaIndex}"]`,
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeMediaIndex]);

  // Keyboard navigation for active slide & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev + 1) % allMedia.length);
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        } else if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        }
      } else {
        if (e.key === 'Escape') {
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allMedia.length, onBack]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  if (!project) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAF8F5] dark:bg-[#161412] text-stone-900 dark:text-stone-100">
        <h2 className="font-serif italic text-3xl sm:text-4xl mb-4">Project Not Found</h2>
        <p className="text-sm font-sans text-stone-600 dark:text-stone-400 mb-6">
          The requested project "{projectId}" could not be located in the archives.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-stone-800/80 backdrop-blur-xl border border-stone-300 dark:border-stone-700 text-xs font-sans font-semibold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Projects</span>
        </button>
      </div>
    );
  }

  const totalGridPages = Math.ceil(allMedia.length / gridItemsPerPage);
  const paginatedGridMedia = allMedia.slice(
    (gridPage - 1) * gridItemsPerPage,
    gridPage * gridItemsPerPage,
  );

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 overflow-y-auto selection:bg-[#E8C582]/30">
      
      {/* Ambient Radial Vignette & Classical Noise Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 dark:from-amber-900/20 via-transparent to-transparent" />

      {/* Main Content Article */}
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-24 sm:pb-32">
        
        {/* Navigation Bar / Return to Canvas */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/70 dark:bg-[#1a1816]/80 hover:bg-white/95 dark:hover:bg-[#1a1816]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-stone-200/80 dark:border-white/15 hover:border-amber-700/40 dark:hover:border-amber-400/40 text-xs sm:text-sm font-sans font-semibold tracking-wide text-stone-800 dark:text-stone-200 transition-all duration-200 cursor-pointer hover:scale-103 active:scale-97 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700 dark:text-[#FFD88A] group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-serif italic text-stone-500 dark:text-stone-400">
            <span>AxelS27</span>
            <span className="w-1 h-1 rounded-full bg-amber-700/60 dark:bg-[#FFD88A]/60" />
            <span>Archival Codex</span>
          </div>
        </div>

        {/* Project Header Title & Meta */}
        <header className="mb-10 sm:mb-14 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {project.year && (
              <span className="px-3 py-1 rounded-full text-xs font-serif italic font-medium bg-amber-500/15 border border-amber-600/30 dark:border-amber-400/30 text-amber-900 dark:text-[#FFD88A]">
                {project.year}
              </span>
            )}
            {project.role && (
              <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-wider bg-black/5 dark:bg-white/10 border border-stone-300/60 dark:border-white/10 text-stone-700 dark:text-stone-300">
                {project.role}
              </span>
            )}
            {project.client && (
              <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-serif italic text-stone-600 dark:text-stone-400 bg-black/[0.03] dark:bg-white/5 border border-stone-200 dark:border-white/5">
                {project.client}
              </span>
            )}
          </div>

          <h1
            className="font-serif italic text-3xl sm:text-5xl md:text-6xl font-light text-stone-950 dark:text-stone-50 tracking-tight leading-[1.15]"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.08)',
            }}
          >
            {project.title}
          </h1>

          <p className="font-sans text-base sm:text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-4xl leading-relaxed pt-1">
            {project.description}
          </p>
        </header>

        {/* Unified Media Showcase Studio (Fixed Frame, Carousel & Grid Modes) */}
        {allMedia.length > 0 && (
          <section className="mb-14 sm:mb-20">
            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#161412]/80 backdrop-blur-2xl backdrop-saturate-[180%] border border-stone-200/80 dark:border-white/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_16px_44px_rgba(0,0,0,0.6)]">
              
              {/* Studio Controls Header */}
              <div className="flex items-center justify-between gap-3 px-1.5 sm:px-2 pb-2.5 mb-2 border-b border-stone-200/60 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif italic text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                    Media Showcase
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-stone-600 dark:text-stone-400">
                    {viewMode === 'showcase'
                      ? `${activeMediaIndex + 1} / ${allMedia.length}`
                      : `${allMedia.length} Photos`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {allMedia.length > 1 && (
                    <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/10 border border-stone-200 dark:border-white/10">
                      <button
                        onClick={() => setViewMode('showcase')}
                        className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          viewMode === 'showcase'
                            ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-sm font-bold'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                        }`}
                      >
                        <SlidersHorizontal size={12} />
                        <span>Showcase</span>
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-sm font-bold'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                        }`}
                      >
                        <LayoutGrid size={12} />
                        <span>Grid</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => openLightbox(activeMediaIndex)}
                    title="Fullscreen View"
                    className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* View Mode: 1. Showcase View (Active Stage + Filmstrip) */}
              {viewMode === 'showcase' && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Main Display Stage */}
                  <div
                    onClick={() => openLightbox(activeMediaIndex)}
                    className="relative w-full h-[300px] sm:h-[400px] md:h-[460px] rounded-xl sm:rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200/80 dark:border-white/15 group cursor-pointer"
                  >
                    {/* Background Blur Shimmer for Aspect-Ratio Safe Fill */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={getAssetUrl(allMedia[activeMediaIndex])}
                        alt=""
                        className="w-full h-full object-cover blur-2xl opacity-25 scale-120 transition-all duration-700"
                      />
                    </div>

                    {/* Active Foreground Image */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeMediaIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full h-full relative z-10 flex items-center justify-center p-2 sm:p-4"
                      >
                        <ImageWithSkeleton
                          src={getAssetUrl(allMedia[activeMediaIndex])}
                          alt={`${project.title} preview ${activeMediaIndex + 1}`}
                          optimizeSource={false}
                          wrapperClassName="w-full h-full flex items-center justify-center"
                          className="max-h-full max-w-full object-contain object-center rounded-lg select-none transition-transform duration-500 group-hover:scale-[1.01]"
                          loading="eager"
                          decoding="async"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Left / Right Carousel Buttons */}
                    {allMedia.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          title="Previous Image"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextSlide}
                          title="Next Image"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Hover Click-to-Zoom Badge */}
                    <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-sans font-semibold shadow-lg">
                        <Maximize2 size={12} />
                        <span>Click to Expand</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Thumbnail Filmstrip */}
                  {allMedia.length > 1 && (
                    <div
                      ref={filmstripRef}
                      className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 px-1 scroll-smooth shrink-0 no-scrollbar"
                    >
                      {allMedia.map((mediaUrl, idx) => {
                        const isSelected = idx === activeMediaIndex;
                        return (
                          <button
                            key={idx}
                            data-index={idx}
                            onClick={() => setActiveMediaIndex(idx)}
                            className={`relative shrink-0 w-20 sm:w-26 md:w-28 h-14 sm:h-17 md:h-18 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-amber-600 dark:ring-[#FFD88A] scale-103 opacity-100 shadow-md'
                                : 'opacity-55 hover:opacity-90 hover:scale-100 border-stone-300/80 dark:border-white/10'
                            }`}
                          >
                            <img
                              src={getAssetUrl(mediaUrl)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                              {idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* View Mode: 2. Paginated Grid View */}
              {viewMode === 'grid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 h-[300px] sm:h-[400px] md:h-[460px]">
                    {paginatedGridMedia.map((mediaUrl, idx) => {
                      const originalIndex = (gridPage - 1) * gridItemsPerPage + idx;
                      return (
                        <div
                          key={originalIndex}
                          onClick={() => openLightbox(originalIndex)}
                          className="relative h-full w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200/80 dark:border-white/15 group cursor-pointer"
                        >
                          <ImageWithSkeleton
                            src={getAssetUrl(mediaUrl)}
                            alt={`${project.title} gallery ${originalIndex + 1}`}
                            optimizeSource={false}
                            wrapperClassName="w-full h-full"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="px-3 py-1 rounded-full bg-black/75 text-white text-xs font-sans font-semibold backdrop-blur-md">
                              Zoom
                            </span>
                          </div>
                          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black/70 text-white rounded">
                            #{originalIndex + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid Pagination Bar */}
                  <div className="flex items-center justify-between px-2 pt-2 border-t border-stone-200/60 dark:border-white/10">
                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                      Page {gridPage} of {Math.max(1, totalGridPages)} ({allMedia.length} total)
                    </span>

                    {totalGridPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={gridPage === 1}
                          onClick={() => setGridPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-stone-300 dark:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalGridPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setGridPage(page)}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              gridPage === page
                                ? 'bg-amber-700 dark:bg-[#FFD88A] text-white dark:text-stone-950 shadow-sm'
                                : 'border border-stone-300 dark:border-white/15 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          disabled={gridPage === totalGridPages}
                          onClick={() => setGridPage((p) => Math.min(totalGridPages, p + 1))}
                          className="p-1.5 rounded-lg border border-stone-300 dark:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 2-Column Main Section: Overview & Deep Dive (Left 8) + Specs & Links (Right 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* LEFT: Overview & Narrative Content */}
          <div className="lg:col-span-8 space-y-10">
            {project.content && project.content.length > 0 && (
              <section className="space-y-6">
                <h2 className="font-serif italic text-2xl sm:text-3xl font-light text-stone-950 dark:text-stone-100 border-b border-stone-200/80 dark:border-white/10 pb-3">
                  Project Overview & Architecture
                </h2>

                <div className="space-y-5">
                  {project.content.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="font-sans text-base sm:text-[17px] text-stone-800 dark:text-stone-300 leading-relaxed tracking-[0.01em]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sticky Project Specs & Quick Actions Card */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#161412]/85 backdrop-blur-2xl backdrop-saturate-[180%] border border-stone-200/80 dark:border-white/15 shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),0_16px_40px_rgba(0,0,0,0.07)] dark:shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.65)] lg:sticky lg:top-8 space-y-6">
              
              <div className="space-y-5">
                <h3 className="font-serif italic text-sm tracking-wider uppercase text-amber-800 dark:text-[#FFD88A] font-medium border-b border-stone-200/60 dark:border-white/10 pb-2">
                  Technical Specifications
                </h3>

                {project.client && (
                  <div className="flex items-start gap-3.5">
                    <Briefcase className="w-4 h-4 text-amber-700 dark:text-[#FFD88A] shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-0.5">
                        Client / Context
                      </p>
                      <p className="font-serif italic text-sm sm:text-base font-normal text-stone-900 dark:text-stone-100">
                        {project.client}
                      </p>
                    </div>
                  </div>
                )}

                {project.role && (
                  <div className="flex items-start gap-3.5">
                    <User className="w-4 h-4 text-amber-700 dark:text-[#FFD88A] shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-0.5">
                        Role
                      </p>
                      <p className="font-serif italic text-sm sm:text-base font-normal text-stone-900 dark:text-stone-100">
                        {project.role}
                      </p>
                    </div>
                  </div>
                )}

                {project.year && (
                  <div className="flex items-start gap-3.5">
                    <Calendar className="w-4 h-4 text-amber-700 dark:text-[#FFD88A] shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-0.5">
                        Timeline
                      </p>
                      <p className="font-serif italic text-sm sm:text-base font-normal text-stone-900 dark:text-stone-100">
                        {project.year}
                      </p>
                    </div>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-3.5 pt-1">
                    <TagIcon className="w-4 h-4 text-amber-700 dark:text-[#FFD88A] shrink-0 mt-1" />
                    <div className="w-full">
                      <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-2">
                        Technologies & Domains
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase bg-black/5 dark:bg-white/10 border border-stone-300/60 dark:border-white/10 text-stone-800 dark:text-stone-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200/60 dark:border-white/10 space-y-2.5">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-stone-300/80 dark:border-white/10 transition-all group cursor-pointer text-stone-900 dark:text-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Github size={16} />
                      <span className="font-sans font-semibold text-xs sm:text-sm">Source Code</span>
                    </div>
                    <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </a>
                )}

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-800 dark:bg-[#E8C582] text-white dark:text-stone-950 hover:bg-amber-900 dark:hover:bg-[#FFD88A] shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink size={16} />
                      <span className="font-sans font-bold text-xs sm:text-sm uppercase tracking-wide">
                        {project.demoLabel || 'Live Demo'}
                      </span>
                    </div>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {project.presentationUrl && (
                  <a
                    href={project.presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-stone-300/80 dark:border-white/10 transition-all group cursor-pointer text-stone-900 dark:text-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Presentation size={16} />
                      <span className="font-sans font-semibold text-xs sm:text-sm">
                        {project.presentationLabel || 'Presentation Deck'}
                      </span>
                    </div>
                    <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-stone-300/80 dark:border-white/10 transition-all group cursor-pointer text-stone-900 dark:text-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Play size={16} />
                      <span className="font-sans font-semibold text-xs sm:text-sm">
                        {project.videoLabel || 'Watch Video Demo'}
                      </span>
                    </div>
                    <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </a>
                )}

                {project.posterUrl && (
                  <a
                    href={project.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-stone-300/80 dark:border-white/10 transition-all group cursor-pointer text-stone-900 dark:text-stone-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon size={16} />
                      <span className="font-sans font-semibold text-xs sm:text-sm">
                        {project.posterLabel || 'Project Poster'}
                      </span>
                    </div>
                    <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </a>
                )}
              </div>

            </div>
          </aside>

        </div>

        {/* Previous / Next Project Discovery Navigation */}
        <section className="mt-16 sm:mt-24 pt-10 border-t border-stone-200/80 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="font-serif italic text-xs uppercase tracking-widest text-amber-800 dark:text-[#FFD88A] font-medium">
                Archival Codex Navigation
              </span>
              <h3 className="font-serif italic text-xl sm:text-2xl text-stone-950 dark:text-stone-100">
                Explore More Works
              </h3>
            </div>

            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-300 dark:border-white/15 text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:border-amber-700/50 dark:hover:border-amber-400/50 transition-all cursor-pointer"
            >
              <LayoutGrid size={13} />
              <span>View All Projects</span>
            </button>
          </div>

          <div className={`grid gap-5 sm:gap-6 ${prevProject && nextProject ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Previous Project Card */}
            {prevProject && (
              <div
                onClick={() => onSelectProject(prevProject.id)}
                className="group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#161412]/80 hover:bg-white/95 dark:hover:bg-[#161412]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/15 hover:border-amber-700/50 dark:hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-serif italic text-amber-800 dark:text-[#FFD88A]">
                    <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Project</span>
                  </div>
                  {prevProject.year && (
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {prevProject.year}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200 dark:border-white/10 shrink-0">
                    <img
                      src={getAssetUrl(prevProject.thumbnail)}
                      alt={prevProject.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif italic text-base sm:text-lg font-medium text-stone-950 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-[#FFD88A] truncate transition-colors">
                      {prevProject.title}
                    </h4>
                    {prevProject.tags && prevProject.tags.length > 0 && (
                      <p className="text-xs font-mono text-stone-500 dark:text-stone-400 truncate pt-0.5">
                        {prevProject.tags.slice(0, 3).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Next Project Card */}
            {nextProject && (
              <div
                onClick={() => onSelectProject(nextProject.id)}
                className="group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-[#161412]/80 hover:bg-white/95 dark:hover:bg-[#161412]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/15 hover:border-amber-700/50 dark:hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  {nextProject.year && (
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {nextProject.year}
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-xs font-serif italic text-amber-800 dark:text-[#FFD88A] ml-auto">
                    <span>Next Project</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200 dark:border-white/10 shrink-0">
                    <img
                      src={getAssetUrl(nextProject.thumbnail)}
                      alt={nextProject.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif italic text-base sm:text-lg font-medium text-stone-950 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-[#FFD88A] truncate transition-colors">
                      {nextProject.title}
                    </h4>
                    {nextProject.tags && nextProject.tags.length > 0 && (
                      <p className="text-xs font-mono text-stone-500 dark:text-stone-400 truncate pt-0.5">
                        {nextProject.tags.slice(0, 3).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeLightbox}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center z-10"
            >
              {/* Top Controls */}
              <div className="w-full flex items-center justify-between text-white mb-3 px-2">
                <span className="font-serif italic text-sm text-stone-300">
                  {project.title} ({lightboxIndex + 1} / {allMedia.length})
                </span>
                <button
                  onClick={closeLightbox}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer hover:scale-110"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Image in Lightbox */}
              <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-2 sm:p-4">
                <img
                  src={getAssetUrl(allMedia[lightboxIndex])}
                  alt={`Fullscreen ${lightboxIndex + 1}`}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl select-none"
                />

                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((prev) => (prev + 1) % allMedia.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
});
export default ProjectDetailPage;

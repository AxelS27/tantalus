import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Play,
  Image as ImageIcon,
  Compass,
  Maximize2,
  X,
} from 'lucide-react';
import { getProjectById, getAllProjects } from '../data/projects';
import { getAssetUrl } from '../lib/assets';
import ImageWithSkeleton from '../components/common/ImageWithSkeleton';
import Footer from '../components/common/Footer';

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

  // Unified media gallery
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount / change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveMediaIndex(0);
  }, [projectId]);

  // Keyboard navigation
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

  if (!project) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100">
        <h2 className="font-serif italic text-4xl mb-3">Project Not Found</h2>
        <p className="font-sans text-sm text-stone-600 dark:text-stone-400 mb-6">
          The requested project could not be found.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-800 dark:bg-[#E8C582] text-white dark:text-stone-950 font-sans text-sm font-semibold hover:scale-105 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 selection:bg-[#E8C582]/30 selection:text-amber-950 overflow-x-hidden">
      
      {/* Background Classical Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[70vh] bg-gradient-to-b from-amber-200/20 dark:from-amber-900/10 via-transparent to-transparent blur-3xl opacity-60" />
      </div>

      {/* Minimal Top Header Bar */}
      <header className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 md:px-16 pointer-events-none max-w-7xl mx-auto">
        <a
          href="/#projects"
          onClick={(e) => {
            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              onBack();
            }
          }}
          className="pointer-events-auto group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-[#1c1a18]/70 hover:bg-white/90 dark:hover:bg-[#1c1a18]/90 backdrop-blur-xl border border-stone-300/60 dark:border-white/10 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-sans font-medium tracking-wide shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Projects</span>
        </a>

        <div className="pointer-events-auto hidden sm:inline-flex items-center gap-2 font-mono text-xs text-stone-500 dark:text-stone-400">
          <span>{String(currentIndex + 1).padStart(2, '0')} / {String(allProjects.length).padStart(2, '0')}</span>
          <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-stone-600" />
          <span>{project.year || '2026'}</span>
        </div>
      </header>

      {/* Main Fluid Editorial Container */}
      <article className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-14 pt-24 sm:pt-32 pb-24">
        
        {/* ================= 1. WIDE FLUID HERO SECTION ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14 sm:mb-18">
          
          {/* Left Side (6 cols on desktop): Title, Meta Ledger, Links & Tags */}
          <div className="lg:col-span-6 space-y-6 pt-1">
            
            {/* Monumental Classical Title */}
            <h1
              className="font-serif italic text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-light tracking-tight text-stone-950 dark:text-stone-50 leading-[1.15]"
              style={{
                textShadow: '0 2px 14px rgba(0,0,0,0.06)',
              }}
            >
              {project.title}
            </h1>

            {/* Editorial Metadata Ledger */}
            <div className="border-t border-b border-stone-300/60 dark:border-white/10 py-3 space-y-2 text-xs sm:text-sm">
              {project.role && (
                <div className="flex items-baseline justify-between text-stone-800 dark:text-stone-200">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Role</span>
                  <span className="text-amber-800 dark:text-[#FFD88A] font-sans font-medium">{project.role}</span>
                </div>
              )}
              {project.client && (
                <div className="flex items-baseline justify-between text-stone-800 dark:text-stone-200">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Client</span>
                  <span className="text-stone-700 dark:text-stone-300 font-sans">{project.client}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-baseline justify-between text-stone-800 dark:text-stone-200">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Year</span>
                  <span className="font-mono text-xs font-semibold text-amber-700 dark:text-[#E8C582]">{project.year}</span>
                </div>
              )}
            </div>

            {/* Fluid Action Links */}
            <div className="space-y-2.5 pt-0.5">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm sm:text-base font-sans font-semibold text-amber-900 dark:text-[#FFD88A] hover:text-amber-700 dark:hover:text-[#E8C582] transition-colors no-underline"
                >
                  <span className="underline underline-offset-4 decoration-amber-700/40 dark:decoration-[#E8C582]/40">
                    {project.demoLabel || 'Live Demo'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </a>
              )}

              {/* Auxiliary Resource Links */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-sans text-stone-700 dark:text-stone-300">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-amber-800 dark:hover:text-[#E8C582] transition-colors no-underline"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700">GitHub</span>
                  </a>
                )}

                {project.presentationUrl && (
                  <a
                    href={project.presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-amber-800 dark:hover:text-[#E8C582] transition-colors no-underline"
                  >
                    <Presentation className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700">{project.presentationLabel || 'Presentation'}</span>
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-amber-800 dark:hover:text-[#E8C582] transition-colors no-underline"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700">{project.videoLabel || 'Video Demo'}</span>
                  </a>
                )}

                {project.posterUrl && (
                  <a
                    href={project.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-amber-800 dark:hover:text-[#E8C582] transition-colors no-underline"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="underline underline-offset-4 decoration-stone-300 dark:decoration-stone-700">{project.posterLabel || 'Poster'}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Fluid Technology Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 block mb-1">
                  Technologies
                </span>
                <p className="font-sans text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {project.tags.join('  •  ')}
                </p>
              </div>
            )}

          </div>

          {/* Right Side (6 cols on desktop): Compact & Proportionate Visual Stage */}
          <div className="lg:col-span-6">
            {allMedia.length > 0 && (
              <div className="space-y-2.5">
                {/* Main Visual Frame (Refined Height & Proportion) */}
                <div
                  onClick={() => openLightbox(activeMediaIndex)}
                  className="relative w-full h-[230px] sm:h-[280px] md:h-[320px] lg:h-[330px] rounded-2xl overflow-hidden bg-black/5 dark:bg-black/50 border border-stone-300/70 dark:border-white/10 group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Ambient Blur Backdrop */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={getAssetUrl(allMedia[activeMediaIndex])}
                      alt=""
                      className="w-full h-full object-cover blur-3xl opacity-25 scale-125 transition-all duration-700"
                    />
                  </div>

                  {/* Active Media Image */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMediaIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full relative z-10 flex items-center justify-center p-2.5 sm:p-4"
                    >
                      <ImageWithSkeleton
                        src={getAssetUrl(allMedia[activeMediaIndex])}
                        alt={`${project.title} Preview ${activeMediaIndex + 1}`}
                        optimizeSource={false}
                        wrapperClassName="w-full h-full flex items-center justify-center"
                        className="max-h-full max-w-full object-contain object-center rounded-lg select-none group-hover:scale-[1.01] transition-transform duration-500 drop-shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
                        loading="eager"
                        decoding="async"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Left/Right Floating Glide Arrows */}
                  {allMedia.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                        }}
                        title="Previous Image"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/75 dark:bg-black/75 hover:bg-white dark:hover:bg-black backdrop-blur-xl border border-white/80 dark:border-white/20 text-stone-900 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
                        }}
                        title="Next Image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/75 dark:bg-black/75 hover:bg-white dark:hover:bg-black backdrop-blur-xl border border-white/80 dark:border-white/20 text-stone-900 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-md"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Minimal Expand Pill */}
                  <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xl border border-white/20 text-white text-[11px] font-sans font-medium shadow-md">
                      <Maximize2 className="w-3 h-3 text-[#E8C582]" />
                      <span>Expand</span>
                    </div>
                  </div>
                </div>

                {/* Compact Filmstrip Rail */}
                {allMedia.length > 1 && (
                  <div
                    ref={filmstripRef}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pt-1 px-1 no-scrollbar select-none"
                  >
                    {allMedia.map((mediaUrl, idx) => {
                      const isSelected = idx === activeMediaIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`relative shrink-0 w-12 sm:w-14 md:w-16 h-8 sm:h-9 md:h-10 rounded-md overflow-hidden border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-amber-700 dark:ring-[#E8C582] scale-105 opacity-100 shadow-sm'
                              : 'opacity-35 hover:opacity-80 hover:scale-100 border-stone-300/80 dark:border-white/10'
                          }`}
                        >
                          <img
                            src={getAssetUrl(mediaUrl)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </section>

        {/* ================= 2. ESSAY TREATISE ================= */}
        {project.content && project.content.length > 0 && (
          <section className="mb-20 sm:mb-28 pt-10 border-t border-stone-300/60 dark:border-white/10 max-w-4xl">
            <h2 className="font-serif italic text-2xl sm:text-3xl text-stone-950 dark:text-stone-100 font-light mb-6">
              About the Project
            </h2>

            {/* Seamless Cohesive Article Flow */}
            <div className="space-y-5 sm:space-y-6 text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-[1.8] font-light">
              {project.content.map((paragraph, idx) => (
                <p key={idx}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ================= 3. CONTINUUM OF WORKS (Typographic Bottom Links) ================= */}
        <nav className="pt-8 border-t border-stone-300/60 dark:border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            {/* Previous Work */}
            {prevProject ? (
              <a
                href={`/projects/${prevProject.id}`}
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onSelectProject(prevProject.id);
                  }
                }}
                className="group flex items-center gap-4 cursor-pointer no-underline text-inherit"
              >
                <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-stone-300/60 dark:border-white/10 shrink-0">
                  <img
                    src={getAssetUrl(prevProject.thumbnail)}
                    alt={prevProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-serif italic text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 group-hover:text-amber-800 dark:group-hover:text-[#E8C582] transition-colors">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Work ({prevProject.year})</span>
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-stone-950 dark:text-white truncate font-light pt-0.5 group-hover:underline">
                    {prevProject.title}
                  </h4>
                </div>
              </a>
            ) : <div />}

            {/* Next Work */}
            {nextProject && (
              <a
                href={`/projects/${nextProject.id}`}
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onSelectProject(nextProject.id);
                  }
                }}
                className="group flex items-center justify-end gap-4 cursor-pointer no-underline text-inherit text-right"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-serif italic text-xs text-stone-500 dark:text-stone-400 flex items-center justify-end gap-1 group-hover:text-amber-800 dark:group-hover:text-[#E8C582] transition-colors">
                    <span>Next Work ({nextProject.year})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-stone-950 dark:text-white truncate font-light pt-0.5 group-hover:underline">
                    {nextProject.title}
                  </h4>
                </div>
                <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-stone-300/60 dark:border-white/10 shrink-0">
                  <img
                    src={getAssetUrl(nextProject.thumbnail)}
                    alt={nextProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </a>
            )}
          </div>
        </nav>

      </article>

      {/* Editorial Page Footer (Consistent with Main Web Experience) */}
      <Footer />

      {/* Fullscreen Fluid Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 select-none">
            {/* Dark Ambient Backdrop */}
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
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between text-white mb-3 px-2">
                <span className="font-sans text-sm text-stone-300">
                  {project.title} - Image {lightboxIndex + 1} of {allMedia.length}
                </span>
                <button
                  onClick={closeLightbox}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer hover:scale-110"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Expanded Image */}
              <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 border border-white/10 p-2 sm:p-4">
                <img
                  src={getAssetUrl(allMedia[lightboxIndex])}
                  alt={`Image ${lightboxIndex + 1}`}
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

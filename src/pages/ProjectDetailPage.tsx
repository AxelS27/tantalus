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
    <div className="relative min-h-screen w-full text-white selection:bg-[#E8C582]/40 selection:text-white overflow-x-hidden">
      
      {/* Fixed Classical Artwork Background with Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/project-detail-bg.png"
          alt="Project Detail Background"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/35 pointer-events-none" />
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
          className="pointer-events-auto group inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-2xl border border-white/25 text-white text-xs sm:text-sm font-serif italic tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-200 cursor-pointer no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FFD88A] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Projects</span>
        </a>

        <div className="pointer-events-auto hidden sm:inline-flex items-center gap-2 font-serif italic text-xs text-stone-200/90 px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-xl border border-white/15">
          <span>{String(currentIndex + 1).padStart(2, '0')} / {String(allProjects.length).padStart(2, '0')}</span>
          <span className="w-1 h-1 rounded-full bg-[#E8C582]" />
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
              className="font-serif italic text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-light tracking-tight text-white leading-[1.15]"
              style={{
                textShadow: '0 2px 14px rgba(0,0,0,0.9), 0 6px 30px rgba(0,0,0,0.7)',
              }}
            >
              {project.title}
            </h1>

            {/* Editorial Metadata Ledger */}
            <div className="border-t border-b border-white/20 py-3 space-y-2 text-xs sm:text-sm font-serif italic">
              {project.role && (
                <div className="flex items-baseline justify-between text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  <span className="text-stone-300 font-light">Role</span>
                  <span className="text-[#FFD88A] font-medium">{project.role}</span>
                </div>
              )}
              {project.client && (
                <div className="flex items-baseline justify-between text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  <span className="text-stone-300 font-light">Client</span>
                  <span className="text-stone-200 font-light">{project.client}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-baseline justify-between text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  <span className="text-stone-300 font-light">Year</span>
                  <span className="font-mono text-xs font-semibold text-[#FFD88A]">{project.year}</span>
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
                  className="group inline-flex items-center gap-2 text-sm sm:text-base font-serif italic text-[#FFD88A] hover:text-[#FFEAB5] transition-colors no-underline"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                >
                  <span className="underline underline-offset-4 decoration-[#FFD88A]/60 font-medium">
                    {project.demoLabel || 'Live Demo'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200 text-[#FFD88A]" />
                </a>
              )}

              {/* Auxiliary Resource Links */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-serif italic text-stone-200" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#FFD88A] transition-colors no-underline"
                  >
                    <Github className="w-3.5 h-3.5 text-[#FFD88A]" />
                    <span className="underline underline-offset-4 decoration-white/30">GitHub</span>
                  </a>
                )}

                {project.presentationUrl && (
                  <a
                    href={project.presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#FFD88A] transition-colors no-underline"
                  >
                    <Presentation className="w-3.5 h-3.5 text-[#FFD88A]" />
                    <span className="underline underline-offset-4 decoration-white/30">{project.presentationLabel || 'Presentation'}</span>
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#FFD88A] transition-colors no-underline"
                  >
                    <Play className="w-3.5 h-3.5 text-[#FFD88A]" />
                    <span className="underline underline-offset-4 decoration-white/30">{project.videoLabel || 'Video Demo'}</span>
                  </a>
                )}

                {project.posterUrl && (
                  <a
                    href={project.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#FFD88A] transition-colors no-underline"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FFD88A]" />
                    <span className="underline underline-offset-4 decoration-white/30">{project.posterLabel || 'Poster'}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Fluid Technology Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8C582] block mb-1">
                  Technologies
                </span>
                <p className="font-serif italic text-xs sm:text-sm text-stone-200/90 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                  {project.tags.join('  •  ')}
                </p>
              </div>
            )}

          </div>

          {/* Right Side (6 cols on desktop): Compact & Proportionate Visual Stage */}
          <div className="lg:col-span-6">
            {allMedia.length > 0 && (
              <div className="space-y-2.5">
                {/* Main Visual Frame */}
                <div
                  onClick={() => openLightbox(activeMediaIndex)}
                  className="relative w-full h-[230px] sm:h-[280px] md:h-[320px] lg:h-[330px] rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/25 group cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:border-white/40 transition-colors duration-300"
                >
                  {/* Ambient Blur Backdrop */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={getAssetUrl(allMedia[activeMediaIndex])}
                      alt=""
                      className="w-full h-full object-cover blur-3xl opacity-30 scale-125 transition-all duration-700"
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
                        className="max-h-full max-w-full object-contain object-center rounded-lg select-none group-hover:scale-[1.01] transition-transform duration-500 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
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
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
                        }}
                        title="Next Image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-md"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Minimal Expand Pill */}
                  <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/25 text-white text-[11px] font-serif italic shadow-md">
                      <Maximize2 className="w-3 h-3 text-[#FFD88A]" />
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
                              ? 'ring-2 ring-[#FFD88A] scale-105 opacity-100 shadow-sm border-transparent'
                              : 'opacity-40 hover:opacity-85 hover:scale-100 border-white/20'
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
          <section className="mb-20 sm:mb-28 pt-10 border-t border-white/20 max-w-4xl">
            <h2
              className="font-serif italic text-2xl sm:text-3xl text-white font-light mb-6"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
            >
              About the Project
            </h2>

            {/* Seamless Cohesive Article Flow */}
            <div
              className="space-y-5 sm:space-y-6 text-base sm:text-lg text-stone-100/95 leading-[1.85] font-serif italic font-light"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.85)' }}
            >
              {project.content.map((paragraph, idx) => (
                <p key={idx}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ================= 3. CONTINUUM OF WORKS (Typographic Bottom Links) ================= */}
        <nav className="pt-8 border-t border-white/20">
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
                <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/40 border border-white/25 shrink-0 shadow-md">
                  <img
                    src={getAssetUrl(prevProject.thumbnail)}
                    alt={prevProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-serif italic text-xs text-stone-300 flex items-center gap-1 group-hover:text-[#FFD88A] transition-colors" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform text-[#FFD88A]" />
                    <span>Previous Project ({prevProject.year})</span>
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-white truncate font-light pt-0.5 group-hover:underline" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
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
                  <span className="font-serif italic text-xs text-stone-300 flex items-center justify-end gap-1 group-hover:text-[#FFD88A] transition-colors" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    <span>Next Project ({nextProject.year})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[#FFD88A]" />
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-white truncate font-light pt-0.5 group-hover:underline" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                    {nextProject.title}
                  </h4>
                </div>
                <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-black/40 border border-white/25 shrink-0 order-first sm:order-last shadow-md">
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

      {/* Editorial Page Footer */}
      <Footer className="bg-black/60 dark:bg-black/75 backdrop-blur-2xl border-t border-white/15 text-stone-200" />

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

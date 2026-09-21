import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Github,
  ExternalLink,
  Calendar,
  Tag,
  User,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Play,
  Image as ImageIcon,
  Compass,
  Sparkles,
  Maximize2,
  Layers,
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
        <h2 className="font-serif italic text-4xl mb-3">Document Not Found</h2>
        <p className="font-serif italic text-stone-600 dark:text-stone-400 mb-6">
          The requested archival entry could not be located in the codex.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-800 dark:bg-[#E8C582] text-white dark:text-stone-950 font-serif italic text-base hover:scale-105 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>Return to Canvas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 selection:bg-[#E8C582]/30 selection:text-amber-950 overflow-x-hidden">
      
      {/* Background Classical Radial Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[80vh] bg-gradient-to-b from-amber-200/25 dark:from-amber-900/15 via-transparent to-transparent blur-3xl opacity-70" />
      </div>

      {/* Floating Top Navigation Pill */}
      <header className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 md:px-16 pointer-events-none max-w-7xl mx-auto">
        <a
          href="/#projects"
          onClick={(e) => {
            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              onBack();
            }
          }}
          className="pointer-events-auto group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/75 dark:bg-[#1c1a18]/80 hover:bg-white dark:hover:bg-[#1c1a18] backdrop-blur-2xl backdrop-saturate-[180%] border border-white/80 dark:border-white/15 text-stone-900 dark:text-stone-100 font-serif italic text-sm tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer no-underline"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700 dark:text-[#E8C582] group-hover:-translate-x-1 transition-transform" />
          <span>Return to Canvas</span>
        </a>

        <div className="pointer-events-auto hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/50 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/10 text-xs font-serif italic text-stone-600 dark:text-stone-300 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582]" />
          <span>Codex Entry #{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-[#E8C582]" />
          <span>{project.year || '2026'}</span>
        </div>
      </header>

      {/* Main Editorial Article Flow */}
      <article className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 md:px-12 pt-28 sm:pt-36 pb-32">
        
        {/* ================= 1. HERO IDENTITY & EDITORIAL HEADLINE ================= */}
        <section className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16">
          
          {/* Metadata Capsule Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] backdrop-blur-xl border border-stone-200/80 dark:border-white/10 text-xs sm:text-sm font-serif italic text-stone-700 dark:text-stone-300 shadow-sm">
            {project.role && (
              <span className="text-amber-800 dark:text-[#FFD88A] font-medium">
                {project.role}
              </span>
            )}
            {project.role && project.client && <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-stone-500" />}
            {project.client && (
              <span className="text-stone-600 dark:text-stone-400">
                {project.client}
              </span>
            )}
            {project.year && <span className="w-1 h-1 rounded-full bg-stone-400 dark:bg-stone-500" />}
            {project.year && (
              <span className="font-mono text-[11px] font-semibold tracking-wider text-amber-700 dark:text-[#E8C582]">
                {project.year}
              </span>
            )}
          </div>

          {/* Colossal Greek Classical Title */}
          <h1
            className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-stone-950 dark:text-white leading-[1.12] max-w-4xl mx-auto"
            style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.06)',
            }}
          >
            {project.title}
          </h1>

          {/* Editorial Subtitle Synopsis */}
          <p className="font-serif italic text-lg sm:text-2xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto font-light leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack Aura Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-white/60 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/80 dark:border-white/10 text-stone-800 dark:text-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ================= 2. CINEMATIC ARTWORK STAGE & GALLERY ================= */}
        {allMedia.length > 0 && (
          <section className="mb-16 sm:mb-24">
            <div className="relative w-full rounded-3xl sm:rounded-[32px] overflow-hidden bg-white/40 dark:bg-stone-950/60 backdrop-blur-2xl border border-white/80 dark:border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.75)] p-3 sm:p-5">
              
              {/* Main Artwork Showcase Frame */}
              <div
                onClick={() => openLightbox(activeMediaIndex)}
                className="relative w-full h-[320px] sm:h-[440px] md:h-[520px] rounded-2xl sm:rounded-[24px] overflow-hidden bg-black/10 dark:bg-black/50 border border-stone-200/80 dark:border-white/10 group cursor-pointer"
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
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full relative z-10 flex items-center justify-center p-3 sm:p-6"
                  >
                    <ImageWithSkeleton
                      src={getAssetUrl(allMedia[activeMediaIndex])}
                      alt={`${project.title} Artifact ${activeMediaIndex + 1}`}
                      optimizeSource={false}
                      wrapperClassName="w-full h-full flex items-center justify-center"
                      className="max-h-full max-w-full object-contain object-center rounded-xl select-none group-hover:scale-[1.01] transition-transform duration-500 drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
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
                      title="Previous Artifact"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black backdrop-blur-2xl border border-white/80 dark:border-white/20 text-stone-900 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
                      }}
                      title="Next Artifact"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black backdrop-blur-2xl border border-white/80 dark:border-white/20 text-stone-900 dark:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer shadow-xl"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Fullscreen Trigger Overlay Pill */}
                <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/20 text-white text-xs font-serif italic shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5 text-[#E8C582]" />
                    <span>Expand Gallery View</span>
                  </div>
                </div>
              </div>

              {/* Floating Thumbnail Carousel Strip */}
              {allMedia.length > 1 && (
                <div
                  ref={filmstripRef}
                  className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pt-3 sm:pt-4 px-1 no-scrollbar select-none"
                >
                  {allMedia.map((mediaUrl, idx) => {
                    const isSelected = idx === activeMediaIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`relative shrink-0 w-16 sm:w-24 md:w-28 h-12 sm:h-16 md:h-18 rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-amber-700 dark:ring-[#E8C582] scale-105 opacity-100 shadow-md'
                            : 'opacity-40 hover:opacity-85 hover:scale-100 border-stone-300/80 dark:border-white/10'
                        }`}
                      >
                        <img
                          src={getAssetUrl(mediaUrl)}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-black/75 text-white">
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= 3. ARCHIVAL ESSAY & TECHNICAL DEEP-DIVE ================= */}
        <section className="mb-16 sm:mb-24 space-y-12">
          
          {/* Chapter Heading Banner */}
          <div className="flex items-center gap-4 border-b border-stone-200/80 dark:border-white/10 pb-4">
            <Sparkles className="w-5 h-5 text-amber-700 dark:text-[#E8C582]" />
            <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-stone-950 dark:text-stone-100 font-normal">
              Architectural Treatise & Methodology
            </h2>
          </div>

          {/* Editorial Content Flow */}
          {project.content && project.content.length > 0 && (
            <div className="space-y-6 sm:space-y-8">
              {project.content.map((paragraph, idx) => (
                <div key={idx} className="relative">
                  <p className="font-serif text-lg sm:text-xl md:text-[21px] leading-[1.8] text-stone-800 dark:text-stone-200 font-light tracking-[0.01em]">
                    {idx === 0 && (
                      <span className="float-left text-5xl sm:text-6xl font-serif italic text-amber-800 dark:text-[#E8C582] leading-none pr-3 pt-1 font-semibold">
                        {paragraph.charAt(0)}
                      </span>
                    )}
                    {idx === 0 ? paragraph.slice(1) : paragraph}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= 4. THE VAULT: ACTION ARTIFACTS & LINKS ================= */}
        <section className="mb-20 sm:mb-28">
          <div className="p-8 sm:p-10 rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-white/80 via-white/50 to-amber-50/40 dark:from-[#181614]/90 dark:via-[#151412]/80 dark:to-stone-950/90 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.1),0_25px_60px_rgba(0,0,0,0.7)] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-5">
              <div>
                <span className="font-serif italic text-xs uppercase tracking-widest text-amber-800 dark:text-[#FFD88A] font-medium">
                  Artifact Repository
                </span>
                <h3 className="font-serif italic text-xl sm:text-2xl text-stone-950 dark:text-stone-100 font-normal">
                  Source Codes & Live Deployments
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
                <Layers className="w-3.5 h-3.5 text-amber-700 dark:text-[#E8C582]" />
                <span>Verified Endpoints</span>
              </div>
            </div>

            {/* Action Grid Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 text-stone-900 dark:text-stone-100 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-stone-800 dark:text-stone-200 group-hover:text-amber-800 dark:group-hover:text-[#E8C582] transition-colors" />
                    <span className="font-serif italic text-sm sm:text-base font-medium">GitHub Repository</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-amber-800 dark:bg-[#E8C582] hover:bg-amber-900 dark:hover:bg-[#FFD88A] text-white dark:text-stone-950 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-serif italic text-sm sm:text-base font-semibold">
                      {project.demoLabel || 'Launch Live Demo'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {project.presentationUrl && (
                <a
                  href={project.presentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 text-stone-900 dark:text-stone-100 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Presentation className="w-5 h-5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="font-serif italic text-sm sm:text-base font-medium">
                      {project.presentationLabel || 'Presentation Deck'}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}

              {project.videoUrl && (
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 text-stone-900 dark:text-stone-100 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="font-serif italic text-sm sm:text-base font-medium">
                      {project.videoLabel || 'Video Demonstration'}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}

              {project.posterUrl && (
                <a
                  href={project.posterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 text-stone-900 dark:text-stone-100 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-amber-700 dark:text-[#E8C582]" />
                    <span className="font-serif italic text-sm sm:text-base font-medium">
                      {project.posterLabel || 'Project Poster'}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              )}
            </div>

          </div>
        </section>

        {/* ================= 5. THE CODEX HORIZON: PREVIOUS / NEXT WORKS ================= */}
        <nav className="pt-10 border-t border-stone-200/80 dark:border-white/10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="font-serif italic text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Continuum of Works
            </span>
            <a
              href="/#projects"
              onClick={(e) => {
                if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onBack();
                }
              }}
              className="text-xs font-serif italic text-amber-800 dark:text-[#E8C582] hover:underline cursor-pointer no-underline"
            >
              Back to Canvas Hub
            </a>
          </div>

          <div className={`grid gap-5 sm:gap-6 ${prevProject && nextProject ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Previous Work */}
            {prevProject && (
              <a
                href={`/projects/${prevProject.id}`}
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onSelectProject(prevProject.id);
                  }
                }}
                className="group p-5 rounded-3xl bg-white/60 dark:bg-[#161412]/80 hover:bg-white/95 dark:hover:bg-[#161412]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/15 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 transition-all duration-300 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 no-underline text-inherit"
              >
                <div className="w-18 h-14 sm:w-22 sm:h-16 rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200 dark:border-white/10 shrink-0">
                  <img
                    src={getAssetUrl(prevProject.thumbnail)}
                    alt={prevProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-serif italic text-xs text-amber-800 dark:text-[#E8C582] flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Work ({prevProject.year})</span>
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-stone-950 dark:text-white truncate font-medium pt-0.5">
                    {prevProject.title}
                  </h4>
                </div>
              </a>
            )}

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
                className="group p-5 rounded-3xl bg-white/60 dark:bg-[#161412]/80 hover:bg-white/95 dark:hover:bg-[#161412]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/15 hover:border-amber-700/40 dark:hover:border-[#E8C582]/40 transition-all duration-300 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 no-underline text-inherit"
              >
                <div className="min-w-0 flex-1 text-right sm:text-left">
                  <span className="font-serif italic text-xs text-amber-800 dark:text-[#E8C582] flex items-center justify-end sm:justify-start gap-1">
                    <span>Next Work ({nextProject.year})</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <h4 className="font-serif italic text-base sm:text-lg text-stone-950 dark:text-white truncate font-medium pt-0.5">
                    {nextProject.title}
                  </h4>
                </div>
                <div className="w-18 h-14 sm:w-22 sm:h-16 rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 border border-stone-200 dark:border-white/10 shrink-0 order-first sm:order-last">
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
                <span className="font-serif italic text-sm text-stone-300">
                  {project.title} - Artifact {lightboxIndex + 1} of {allMedia.length}
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
                  alt={`Artifact ${lightboxIndex + 1}`}
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

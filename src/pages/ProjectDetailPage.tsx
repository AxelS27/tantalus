import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback, memo } from 'react';
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
  const visualStageRef = useRef<HTMLDivElement>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Wheel listener to slide gallery images without scrolling the page
  useEffect(() => {
    const stageEl = visualStageRef.current;
    if (!stageEl || allMedia.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 200) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) > 10) {
        if (delta > 0) {
          setActiveMediaIndex((prev) => (prev + 1) % allMedia.length);
        } else {
          setActiveMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        }
        lastWheelTimeRef.current = now;
      }
    };

    stageEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      stageEl.removeEventListener('wheel', handleWheel);
    };
  }, [allMedia.length]);

  // Wheel listener to slide images inside Lightbox modal
  useEffect(() => {
    if (!isLightboxOpen || allMedia.length <= 1) return;

    const handleLightboxWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 200) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) > 10) {
        if (delta > 0) {
          setLightboxIndex((prev) => (prev + 1) % allMedia.length);
        } else {
          setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        }
        lastWheelTimeRef.current = now;
      }
    };

    window.addEventListener('wheel', handleLightboxWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleLightboxWheel);
    };
  }, [isLightboxOpen, allMedia.length]);

  // Eagerly pre-load and decode all gallery images on project change
  useEffect(() => {
    setActiveMediaIndex(0);
    if (typeof window !== 'undefined' && allMedia.length > 0) {
      allMedia.forEach((mediaPath) => {
        const url = getAssetUrl(mediaPath);
        if (url) {
          const img = new Image();
          img.decoding = 'async';
          img.src = url;
          img.decode?.().catch(() => {});
        }
      });
    }
  }, [allMedia]);

  const handleNavProject = useCallback((targetId: string) => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    onSelectProject(targetId);
  }, [onSelectProject]);

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 font-sans">
        <h2 className="text-3xl font-bold mb-3">Project Not Found</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
          The requested project could not be found.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-800 dark:bg-[#E8C582] text-white dark:text-stone-950 text-sm font-semibold hover:scale-105 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-white selection:bg-[#E8C582]/40 selection:text-white font-sans overflow-x-hidden">
      
      {/* Fixed Classical Artwork Background with Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/project-detail-bg.png"
          alt="Project Detail Background"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/45 pointer-events-none" />
      </div>

      {/* Centered Floating Apple Frosted Glass Navbar Capsule */}
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex items-center justify-center w-full px-4 sm:px-8 max-w-5xl">
        <div className="pointer-events-auto relative w-full h-11 sm:h-12 flex items-center justify-between p-1.5 rounded-full bg-[#141210]/85 hover:bg-[#141210]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/20 shadow-[inset_0_1px_1.5px_0_rgba(255,255,255,0.25),0_16px_40px_rgba(0,0,0,0.55)] transition-colors duration-200">
          
          {/* Left Segment: Back to Projects */}
          <a
            href="/#projects"
            onClick={(e) => {
              if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onBack();
              }
            }}
            className="group relative h-full flex items-center gap-2 px-4 sm:px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer no-underline shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFD88A] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Projects</span>
          </a>

          {/* Center Segment: Prominent Project Title */}
          <div className="flex-1 flex items-center justify-center px-3 sm:px-6 min-w-0 overflow-hidden">
            <span
              title={project.title}
              className="text-sm sm:text-base md:text-lg text-white font-serif italic truncate font-light tracking-wide text-center"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              {project.title}
            </span>
          </div>

          {/* Right Symmetric Spacer to keep Center Title perfectly balanced */}
          <div className="w-[120px] sm:w-[155px] hidden sm:block pointer-events-none" />

        </div>
      </header>

      {/* Main Center Editorial Canvas Panel (Darkened Translucent Frosted Glass) */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-16">
        <article className="relative w-full rounded-3xl sm:rounded-[36px] bg-black/65 backdrop-blur-2xl border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] p-6 sm:p-10 md:p-14 space-y-12 sm:space-y-16">
        
          {/* ================= 1. WIDE FLUID HERO SECTION (Visual Left + Specs/Actions Right) ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Side (6 cols on desktop): Compact & Proportionate Visual Stage */}
            <div className="lg:col-span-6">
              {allMedia.length > 0 && (
                <div className="space-y-2.5">
                  {/* Main Visual Frame */}
                  <div
                    ref={visualStageRef}
                    onClick={() => openLightbox(activeMediaIndex)}
                    className="relative w-full h-[230px] sm:h-[280px] md:h-[320px] lg:h-[330px] rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/25 group cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:border-white/40 transition-colors duration-200"
                  >
                    {/* Ambient Blur Backdrop */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={getAssetUrl(allMedia[activeMediaIndex])}
                        alt=""
                        className="w-full h-full object-cover blur-3xl opacity-30 scale-125 transition-opacity duration-200"
                      />
                    </div>

                    {/* Active Media Image (Instant 0ms Swap) */}
                    <div className="w-full h-full relative z-10 flex items-center justify-center p-2.5 sm:p-4">
                      <img
                        key={activeMediaIndex}
                        src={getAssetUrl(allMedia[activeMediaIndex])}
                        alt={`${project.title} Preview ${activeMediaIndex + 1}`}
                        className="max-h-full max-w-full object-contain object-center rounded-lg select-none group-hover:scale-[1.01] transition-transform duration-200 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                        loading="eager"
                        decoding="async"
                      />
                    </div>

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
                  </div>

                  {/* Media Stage Controls & Progress Indicator (Centered Dots) */}
                  {allMedia.length > 1 && (
                    <div className="relative flex items-center justify-between px-2 pt-2.5 text-xs text-stone-300 font-sans select-none">
                      {/* Left Balanced Spacer */}
                      <div className="w-16 hidden sm:block pointer-events-none" />

                      {/* Golden Indicator Dots (Dead Center) */}
                      <div className="flex items-center justify-center gap-1.5 flex-1 sm:flex-none">
                        {allMedia.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveMediaIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeMediaIndex
                                ? 'w-6 bg-[#FFD88A] shadow-sm'
                                : 'w-1.5 bg-white/25 hover:bg-white/50'
                            }`}
                            title={`Image ${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Image Counter (Right) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[#FFD88A] font-mono text-xs font-semibold">
                          {String(activeMediaIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="text-stone-500 font-mono text-xs">/</span>
                        <span className="text-stone-400 font-mono text-xs">
                          {String(allMedia.length).padStart(2, '0')}
                        </span>
                        <span className="text-stone-400 text-xs ml-0.5">Images</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side (6 cols on desktop): Fluid Typographic Ledger, Actions & Technologies */}
            <div className="lg:col-span-6 space-y-5 pt-0.5 font-sans">
              
              {/* Direct Metadata List (Clean Modern Sans Typography) */}
              <div className="space-y-2.5 pb-2">
                {project.role && (
                  <div className="flex items-baseline gap-2.5 text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    <span className="text-stone-400 font-medium text-xs sm:text-sm">Role:</span>
                    <span className="text-sm sm:text-base text-[#FFD88A] font-semibold">{project.role}</span>
                  </div>
                )}
                {project.client && (
                  <div className="flex items-baseline gap-2.5 text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    <span className="text-stone-400 font-medium text-xs sm:text-sm">Client:</span>
                    <span className="text-sm sm:text-base text-stone-100 font-normal">{project.client}</span>
                  </div>
                )}
                {(project.date || project.year) && (
                  <div className="flex items-baseline gap-2.5 text-stone-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    <span className="text-stone-400 font-medium text-xs sm:text-sm">Date:</span>
                    <span className="font-mono text-sm sm:text-base font-semibold text-[#FFD88A]">{project.date || project.year}</span>
                  </div>
                )}
              </div>

              {/* Split Section: Action Links on Left & Technologies on Right (Parallel 2-Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start pt-3">
                
                {/* Left Column: Action Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                    Links & Resources
                  </span>

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(217,119,6,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
                        <span className="truncate">{project.demoLabel || 'Live Demo / Paper'}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-950 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-[#24292e] hover:bg-[#2f363d] border border-white/20 text-white text-xs font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-3.5 h-3.5 text-white" />
                        <span>GitHub</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {project.presentationUrl && (
                    <a
                      href={project.presentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-[#00c4cc]/20 hover:bg-[#00c4cc]/30 border border-[#00c4cc]/50 text-[#5fe3e8] text-xs font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <Presentation className="w-3.5 h-3.5 text-[#00c4cc]" />
                        <span className="truncate">{project.presentationLabel || 'Presentation'}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                    </a>
                  )}

                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-[#ff0000]/20 hover:bg-[#ff0000]/30 border border-[#ff0000]/50 text-[#ff7070] text-xs font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-[#ff0000] fill-[#ff0000]" />
                        <span>{project.videoLabel || 'Video Demo'}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                    </a>
                  )}

                  {project.posterUrl && (
                    <a
                      href={project.posterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 text-indigo-300 text-xs font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{project.posterLabel || 'Poster'}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                    </a>
                  )}
                </div>

                {/* Right Column: Technologies */}
                {project.tags && project.tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                      Technologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/10 hover:bg-white/15 border border-white/20 text-stone-100 shadow-sm transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </section>

          {/* ================= 2. ESSAY TREATISE (Clean Sans-Serif Body for Effortless Reading) ================= */}
          {project.content && project.content.length > 0 && (
            <section className="pt-8 border-t border-white/20 max-w-4xl font-sans">
              <h2
                className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-5"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
              >
                About the Project
              </h2>

              {/* Seamless Cohesive Article Flow in Crisp Sans-Serif */}
              <div
                className="space-y-4 sm:space-y-5 text-sm sm:text-base text-stone-200 leading-relaxed font-normal"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
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
          <nav className="pt-8 border-t border-white/20 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
              {/* Previous Work */}
              {prevProject ? (
                <a
                  href={`/projects/${prevProject.id}`}
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      handleNavProject(prevProject.id);
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
                    <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 group-hover:text-[#FFD88A] transition-colors" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform text-[#FFD88A]" />
                      <span>Previous Project</span>
                    </span>
                    <h4 className="text-sm sm:text-base text-white truncate font-medium pt-0.5 group-hover:underline" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
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
                      handleNavProject(nextProject.id);
                    }
                  }}
                  className="group flex items-center justify-end gap-4 cursor-pointer no-underline text-inherit text-right"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-stone-400 flex items-center justify-end gap-1 group-hover:text-[#FFD88A] transition-colors" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                      <span>Next Project</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[#FFD88A]" />
                    </span>
                    <h4 className="text-sm sm:text-base text-white truncate font-medium pt-0.5 group-hover:underline" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
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
      </div>

      {/* Editorial Page Footer */}
      <Footer className="bg-black/60 dark:bg-black/75 backdrop-blur-2xl border-t border-white/15 text-stone-200" />

      {/* Fullscreen Fluid Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 select-none font-sans">
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
                <span className="text-sm text-stone-300 font-medium">
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

import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithSkeleton from './common/ImageWithSkeleton';
import StepCounter from './common/StepCounter';
import { allProjects, projectPages, cubeFaces, type ProjectCardItem } from '../data/projects';
import { getProjectCardImage, getProjectCardSrcSet } from '../lib/thumbnails';

export type { ProjectCardItem };

interface ProjectsGridProps {
  isActive?: boolean;
  onReachEnd?: () => void;
  onReachStart?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectsGrid = memo(function ProjectsGrid({
  isActive = true,
  onReachEnd,
  onReachStart,
  onSelectProject,
}: ProjectsGridProps) {
  const numFaces = cubeFaces.length;
  const angleStep = 360 / numFaces;
  const [currentPage, setCurrentPage] = useState(0);
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 10;
  const mobilePageCount = Math.ceil(allProjects.length / mobilePageSize);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [facingStep, setFacingStep] = useState(0);
  const [visibleFaceIndexes, setVisibleFaceIndexes] = useState<number[]>([0]);
  const [visitedFaceIndexes, setVisitedFaceIndexes] = useState<number[]>([0]);
  const rotationY = useMotionValue(0);
  const rotationX = useMotionValue(0);
  const rotationYRef = useRef(0);
  const rotationXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotY: 0, rotX: 0 });
  const hasDraggedRef = useRef(false);
  const pendingRotationRef = useRef({ y: 0, x: 0 });
  const animationSequenceRef = useRef(0);

  const lastWheelTimeRef = useRef<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState<number>(384);

  useEffect(() => {
    if (!stageRef.current) return;
    const updateRadius = () => {
      if (stageRef.current) {
        const width = stageRef.current.offsetWidth || 640;
        const calculated = (width / 2) / Math.tan(Math.PI / numFaces);
        setRadius(Math.round(calculated));
      }
    };
    updateRadius();
    const ro = new ResizeObserver(updateRadius);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [numFaces]);

  const settleToFace = useCallback((targetY: number) => {
    const sequence = ++animationSequenceRef.current;
    rotationY.stop();
    rotationX.stop();
    // Clamp target within [-(numFaces - 1) * angleStep, 0]
    const clampedY = Math.max(-(numFaces - 1) * angleStep, Math.min(0, targetY));
    const targetFace = Math.max(0, Math.min(numFaces - 1, Math.round(-clampedY / angleStep)));
    const currentFace = Math.max(0, Math.min(numFaces - 1, Math.round(-rotationY.get() / angleStep)));

    setVisibleFaceIndexes((faces) =>
      faces.includes(targetFace) && faces.includes(currentFace)
        ? faces
        : [currentFace, targetFace],
    );
    setVisitedFaceIndexes((visited) =>
      visited.includes(targetFace) ? visited : [...visited, targetFace],
    );
    setFacingStep(targetFace);
    setCurrentPage(targetFace);
    rotationYRef.current = clampedY;
    rotationXRef.current = 0;

    const yAnimation = animate(rotationY, clampedY, {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    });
    animate(rotationX, 0, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    });
    yAnimation.then(() => {
      if (animationSequenceRef.current === sequence) {
        setVisibleFaceIndexes([targetFace]);
      }
    });
  }, [angleStep, numFaces, rotationX, rotationY]);

  const handleNext = useCallback(() => {
    if (currentPage >= numFaces - 1) {
      onReachEnd?.();
    } else {
      const nextIndex = currentPage + 1;
      const nextY = -nextIndex * angleStep;
      settleToFace(nextY);
    }
  }, [angleStep, currentPage, numFaces, onReachEnd, settleToFace]);

  const handlePrev = useCallback(() => {
    if (currentPage <= 0) {
      onReachStart?.();
    } else {
      const prevIndex = currentPage - 1;
      const prevY = -prevIndex * angleStep;
      settleToFace(prevY);
    }
  }, [angleStep, currentPage, onReachStart, settleToFace]);

  const goToMobilePage = (page: number) => {
    setMobilePage(page);
    mobileScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCardClick = useCallback((projectId: string) => {
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      window.location.hash = `#projects/${projectId}`;
    }
  }, [onSelectProject]);

  // Global pointer up listener to prevent stuck drag state on gesture interruptions
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isPointerDownRef.current = false;
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        const snappedY = Math.round(pendingRotationRef.current.y / angleStep) * angleStep;
        settleToFace(snappedY);
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [angleStep, settleToFace]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || e.button !== 0) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotationY.get(),
      rotX: rotationX.get(),
    };
    pendingRotationRef.current = {
      y: rotationY.get(),
      x: rotationX.get(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (!hasDraggedRef.current && Math.hypot(dx, dy) > 5) {
      hasDraggedRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);
      animationSequenceRef.current += 1;
      rotationY.stop();
      rotationX.stop();
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }

    if (!isDraggingRef.current) return;

    let nextRotY = dragStartRef.current.rotY + dx * 0.35;
    const minRot = -(numFaces - 1) * angleStep;
    const maxRot = 0;

    // Elastic resistance beyond boundaries
    if (nextRotY > maxRot) {
      nextRotY = maxRot + (nextRotY - maxRot) * 0.25;
    } else if (nextRotY < minRot) {
      nextRotY = minRot + (nextRotY - minRot) * 0.25;
    }

    // Bounded subtle tilt on X axis
    const nextRotX = Math.max(-20, Math.min(20, dragStartRef.current.rotX - dy * 0.18));

    pendingRotationRef.current = { y: nextRotY, x: nextRotX };
    rotationYRef.current = nextRotY;
    rotationXRef.current = nextRotX;
    rotationY.set(nextRotY);
    rotationX.set(nextRotX);

    const continuousFace = Math.max(0, Math.min(numFaces - 1, -nextRotY / angleStep));
    const lowerFace = Math.max(0, Math.min(numFaces - 1, Math.floor(continuousFace)));
    const upperFace = Math.max(0, Math.min(numFaces - 1, Math.ceil(continuousFace)));
    const nextFaces = lowerFace === upperFace ? [lowerFace] : [lowerFace, upperFace];
    setVisibleFaceIndexes((faces) =>
      faces.length === nextFaces.length && faces.every((face, index) => face === nextFaces[index])
        ? faces
        : nextFaces,
    );

    const nearestFace = Math.max(0, Math.min(numFaces - 1, Math.round(continuousFace)));
    setVisitedFaceIndexes((visited) =>
      nextFaces.some((f) => !visited.includes(f))
        ? Array.from(new Set([...visited, ...nextFaces]))
        : visited,
    );
    setFacingStep((current) => current === nearestFace ? current : nearestFace);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      // Snap using the latest pointer position.
      const snappedY = Math.round(pendingRotationRef.current.y / angleStep) * angleStep;
      settleToFace(snappedY);
    }
  };

  // Mousewheel listener for rotating Cube & Section Handoff
  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive || window.matchMedia('(max-width: 767px)').matches) return;
    e.stopPropagation();
    const now = Date.now();

    if (now - lastWheelTimeRef.current < 600) return;

    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

    if (Math.abs(delta) > 10) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastWheelTimeRef.current = now;
    }
  };

  return (
    <div
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full flex flex-col items-center justify-center z-20 px-4 py-4 overflow-hidden ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Mobile gallery matches the Repertoire and Watchlist reading flow. */}
      <div ref={mobileScrollRef} className="archive-gallery-scroll-container md:hidden absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-[calc(8rem+env(safe-area-inset-bottom))]">
          <header className="mb-6 text-center">
            <h1 className="font-serif italic font-light text-5xl tracking-tight text-white select-text" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 8px 36px rgba(0,0,0,0.7)' }}>
              Projects
            </h1>
          </header>

          <div className="grid grid-cols-2 gap-3">
            {allProjects.slice((mobilePage - 1) * mobilePageSize, mobilePage * mobilePageSize).map((project) => (
              <motion.a
                key={project.id}
                href={`/projects/${project.id}`}
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    handleCardClick(project.id);
                  }
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.18 }}
                className="glass-surface group relative min-w-0 flex flex-col p-1.5 rounded-xl bg-white/45 dark:bg-[#161412]/60 hover:bg-white/65 dark:hover:bg-[#161412]/75 backdrop-blur-xl border border-white/60 dark:border-white/20 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9),0_8px_24px_-4px_rgba(40,30,20,0.14)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.65)] transition-colors cursor-pointer overflow-hidden no-underline"
              >
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/20 border border-white/40 dark:border-white/15">
                  <ImageWithSkeleton
                    src={getProjectCardImage(project.id, project.image)}
                    srcSet={getProjectCardSrcSet(project.id)}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover object-center pointer-events-none select-none"
                    skeletonClassName="bg-white/10 dark:bg-black/40"
                  />
                </div>
                <div className="w-full min-h-12 flex items-center justify-center text-center px-1 py-1.5 select-text">
                  <h2 title={project.title} className="w-full line-clamp-2 font-sans text-[11px] leading-snug font-semibold text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors">
                    {project.title}
                  </h2>
                </div>
              </motion.a>
            ))}
          </div>

          {mobilePageCount > 1 && (
            <nav aria-label="Project pages" className="flex items-center justify-center gap-1.5 mt-10">
              <button type="button" onClick={() => goToMobilePage(mobilePage - 1)} disabled={mobilePage === 1} aria-label="Previous page" className="group flex h-11 w-11 items-center justify-center rounded-full text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 border border-white/30 backdrop-blur-xl group-hover:bg-black/55">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </button>
              {Array.from({ length: mobilePageCount }, (_, index) => index + 1).map((number) => (
                <button key={number} type="button" onClick={() => goToMobilePage(number)} aria-label={`Page ${number}`} aria-current={mobilePage === number ? 'page' : undefined} className="group flex h-11 w-11 items-center justify-center rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-white">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold backdrop-blur-xl transition-colors ${mobilePage === number ? 'bg-white/80 border-white/80 text-stone-950 dark:bg-stone-900/85 dark:text-amber-200' : 'bg-black/35 border-white/30 text-white group-hover:bg-black/55'}`}>
                    {number}
                  </span>
                </button>
              ))}
              <button type="button" onClick={() => goToMobilePage(mobilePage + 1)} disabled={mobilePage === mobilePageCount} aria-label="Next page" className="group flex h-11 w-11 items-center justify-center rounded-full text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 border border-white/30 backdrop-blur-xl group-hover:bg-black/55">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Desktop: 3D cube with side navigation. */}
      <div className="relative hidden md:flex w-full items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-14">
        
        {/* Left Arrow Slot (Hidden on newest / Page 0) */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          {currentPage > 0 ? (
            <button
              onClick={handlePrev}
              title="Previous Page"
              className="glass-surface p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
        </div>

        {/* 3D Perspective Stage */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ perspective: '1200px' }}
          className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[310px] sm:h-[340px] md:h-[365px] flex items-center justify-center flex-shrink-0 touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Rotating 3D Cube Rig */}
          <motion.div
            style={{
              rotateY: rotationY,
              rotateX: rotationX,
              z: -radius,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full"
          >
            {cubeFaces.map((face) => {
              if (!visitedFaceIndexes.includes(face.faceIdx)) return null;
              const isFaceActive = facingStep === face.faceIdx;
              const isFaceVisible = visibleFaceIndexes.includes(face.faceIdx);

              return (
                <div
                  key={face.faceIdx}
                  style={{
                    transform: `rotateY(${face.faceIdx * angleStep}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  className={`absolute inset-0 w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 ${
                    isFaceActive
                      ? 'opacity-100 pointer-events-auto filter-none'
                      : isFaceVisible
                        ? 'opacity-85 pointer-events-none brightness-75'
                        : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {face.items.map((project) => (
                    <motion.a
                      key={`${face.faceIdx}-${project.id}`}
                      href={`/projects/${project.id}`}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onClick={(e) => {
                        // For normal left-click without modifier keys, use client-side navigation
                        if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!hasDraggedRef.current && isFaceActive) {
                            handleCardClick(project.id);
                          }
                        }
                      }}
                      whileHover={{
                        scale: !isDragging && isFaceActive ? 1.09 : 1,
                        y: !isDragging && isFaceActive ? -5 : 0,
                        transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="glass-surface group relative flex flex-col justify-start p-1.5 sm:p-2 rounded-xl bg-white/45 dark:bg-[#161412]/60 hover:bg-white/65 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 hover:border-white/95 dark:hover:border-white/40 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9),0_8px_24px_-4px_rgba(40,30,20,0.14)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,1),0_16px_40px_-4px_rgba(40,30,20,0.22)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_18px_44px_-4px_rgba(0,0,0,0.85)] z-10 hover:z-40 transition-colors duration-150 cursor-pointer no-underline text-inherit overflow-hidden"
                    >
                      {/* Specular Top Light Accent */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150 rounded-t-xl" />

                      {/* Ambient Glass Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl" />

                      {/* 16:9 Thumbnail Image with Skeleton Shimmer */}
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-black/10 dark:bg-black/40 border border-white/40 dark:border-white/15 mb-1 flex-shrink-0 z-10">
                        <ImageWithSkeleton
                          src={getProjectCardImage(project.id, project.image)}
                          srcSet={getProjectCardSrcSet(project.id)}
                          alt={project.title}
                          loading={face.faceIdx === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover object-center pointer-events-none select-none"
                          skeletonClassName="bg-white/10 dark:bg-black/40"
                        />
                      </div>

                      {/* Clean Single-Line High-Legibility Title */}
                      <div className="w-full flex-1 flex items-center justify-center text-center px-1 py-1 overflow-hidden z-10 select-text">
                        <h3
                          title={project.title}
                          className="font-sans text-[11px] sm:text-[12px] font-semibold leading-normal tracking-normal text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors w-full truncate whitespace-nowrap drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                        >
                          {project.title}
                        </h3>
                      </div>
                    </motion.a>
                  ))}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Arrow Slot (Hidden on oldest / last page) */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          {currentPage < numFaces - 1 ? (
            <button
              onClick={handleNext}
              title="Next Page"
              className="glass-surface p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
        </div>

      </div>

      <div className="hidden md:contents">
        <StepCounter current={currentPage + 1} total={numFaces} label="Project page" />
      </div>

      {/* Face Indicator Dots */}
      <div className="hidden md:flex items-center justify-center gap-2.5 pt-4 select-none z-30">
        {cubeFaces.map((face) => (
          <button
            key={face.faceIdx}
            onClick={() => {
              settleToFace(-face.faceIdx * angleStep);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              facingStep === face.faceIdx
                ? 'w-7 bg-amber-700 dark:bg-[#FFD88A] shadow-sm'
                : 'w-2 bg-stone-400/50 dark:bg-white/25 hover:bg-stone-500 dark:hover:bg-white/40'
            }`}
            title={`Page ${face.faceIdx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

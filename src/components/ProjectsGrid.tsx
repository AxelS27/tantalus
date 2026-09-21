import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithSkeleton from './common/ImageWithSkeleton';
import { projectPages, cubeFaces, type ProjectCardItem } from '../data/projects';

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
  const [facingStep, setFacingStep] = useState(0);
  const [visibleFaceIndexes, setVisibleFaceIndexes] = useState<number[]>([0]);
  const [visitedFaceIndexes, setVisitedFaceIndexes] = useState<number[]>([0]);
  const rotationY = useMotionValue(0);
  const rotationX = useMotionValue(0);
  const rotationYRef = useRef(0);
  const rotationXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
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
    const currentFace = ((-Math.round(rotationY.get() / angleStep)) % numFaces + numFaces) % numFaces;
    const targetFace = ((-Math.round(targetY / angleStep)) % numFaces + numFaces) % numFaces;
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
    rotationYRef.current = targetY;
    rotationXRef.current = 0;

    const yAnimation = animate(rotationY, targetY, {
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
    const nextY = Math.round(rotationYRef.current / angleStep) * angleStep - angleStep;
    settleToFace(nextY);
  }, [angleStep, settleToFace]);

  const handlePrev = useCallback(() => {
    const prevY = Math.round(rotationYRef.current / angleStep) * angleStep + angleStep;
    settleToFace(prevY);
  }, [angleStep, settleToFace]);

  const handleCardClick = useCallback((projectId: string) => {
    if (hasDraggedRef.current) return;
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      window.location.hash = `#projects/${projectId}`;
    }
  }, [onSelectProject]);

  // Pointer drag controls for holding & rotating freely
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || e.button !== 0) return;
    isDraggingRef.current = true;
    animationSequenceRef.current += 1;
    rotationY.stop();
    rotationX.stop();
    setIsDragging(true);
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
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 4) {
      hasDraggedRef.current = true;
    }

    const nextRotY = dragStartRef.current.rotY + dx * 0.35;
    // Bounded subtle tilt on X axis
    const nextRotX = Math.max(-20, Math.min(20, dragStartRef.current.rotX - dy * 0.18));

    pendingRotationRef.current = { y: nextRotY, x: nextRotX };
    rotationYRef.current = nextRotY;
    rotationXRef.current = nextRotX;
    rotationY.set(nextRotY);
    rotationX.set(nextRotX);

    const continuousFace = -nextRotY / angleStep;
    const lowerFace = ((Math.floor(continuousFace) % numFaces) + numFaces) % numFaces;
    const upperFace = ((Math.ceil(continuousFace) % numFaces) + numFaces) % numFaces;
    const nextFaces = lowerFace === upperFace ? [lowerFace] : [lowerFace, upperFace];
    setVisibleFaceIndexes((faces) =>
      faces.length === nextFaces.length && faces.every((face, index) => face === nextFaces[index])
        ? faces
        : nextFaces,
    );

    const nearestFace = ((Math.round(continuousFace) % numFaces) + numFaces) % numFaces;
    setVisitedFaceIndexes((visited) =>
      nextFaces.some((f) => !visited.includes(f))
        ? Array.from(new Set([...visited, ...nextFaces]))
        : visited,
    );
    setFacingStep((current) => current === nearestFace ? current : nearestFace);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // fallback
    }

    // Snap using the latest pointer position.
    const snappedY = Math.round(pendingRotationRef.current.y / angleStep) * angleStep;
    settleToFace(snappedY);
  };

  // Mousewheel listener for rotating Cube & Section Handoff
  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
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
      className={`relative w-full h-full flex flex-col items-center justify-center z-20 px-4 py-4 overflow-hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* 3D Cube Container with Non-Overlapping Flex Flanks */}
      <div className="relative w-full flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-14">
        
        {/* Left Arrow Slot */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          <button
            onClick={handlePrev}
            title="Rotate Cube Left"
            className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 3D Perspective Stage */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ perspective: '1200px' }}
          className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[380px] sm:h-[415px] md:h-[445px] flex items-center justify-center flex-shrink-0 touch-none select-none ${
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
                  className={`absolute inset-0 w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 transition-all duration-700 ease-out ${
                    isFaceActive
                      ? 'opacity-100 pointer-events-auto filter-none'
                      : isFaceVisible
                        ? 'opacity-85 pointer-events-none brightness-75'
                        : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {face.items.map((project) => (
                    <motion.div
                      key={`${face.faceIdx}-${project.id}`}
                      onClick={() => !isDragging && isFaceActive && handleCardClick(project.id)}
                      whileHover={{
                        scale: !isDragging && isFaceActive ? 1.09 : 1,
                        y: !isDragging && isFaceActive ? -5 : 0,
                        transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="group relative flex flex-col justify-start p-1.5 sm:p-2 rounded-xl bg-white/40 dark:bg-[#121110]/80 hover:bg-white/60 dark:hover:bg-[#121110]/95 backdrop-blur-xl backdrop-saturate-[165%] border border-white/60 dark:border-white/15 hover:border-white/95 dark:hover:border-white/35 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),0_8px_24px_-4px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.95),0_16px_40px_-4px_rgba(0,0,0,0.28)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2),0_18px_44px_-4px_rgba(0,0,0,0.85)] z-10 hover:z-40 transition-colors duration-200 cursor-pointer"
                    >
                      {/* Specular Top Light Accent */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/35 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150 rounded-t-xl" />

                      {/* 16:9 Thumbnail Image with Skeleton Shimmer */}
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-black/10 dark:bg-black/40 border border-white/40 dark:border-white/15 mb-1 flex-shrink-0">
                        <ImageWithSkeleton
                          src={project.image}
                          alt={project.title}
                          loading={face.faceIdx === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover object-center pointer-events-none select-none"
                          skeletonClassName="bg-white/10 dark:bg-black/40"
                        />
                      </div>

                      {/* Clean Single-Line High-Legibility Title */}
                      <div className="w-full flex items-center justify-center text-center px-1 pt-0.5 pb-0.5 min-h-[22px] overflow-hidden">
                        <h3
                          title={project.title}
                          className="font-sans text-[11px] sm:text-[12px] font-semibold leading-normal tracking-normal text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors w-full truncate whitespace-nowrap drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                        >
                          {project.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Arrow Slot */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          <button
            onClick={handleNext}
            title="Rotate Cube Right"
            className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>

      {/* Face Indicator Dots */}
      <div className="flex items-center justify-center gap-2.5 pt-4 select-none z-30">
        {cubeFaces.map((face) => (
          <button
            key={face.faceIdx}
            onClick={() => {
              const currentRot = rotationYRef.current;
              const currentF = ((-Math.round(currentRot / angleStep)) % numFaces + numFaces) % numFaces;
              let diff = face.faceIdx - currentF;
              if (diff > numFaces / 2) diff -= numFaces;
              if (diff < -numFaces / 2) diff += numFaces;
              const targetY = Math.round(currentRot / angleStep) * angleStep - diff * angleStep;
              settleToFace(targetY);
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

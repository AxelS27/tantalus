import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProjectCardItem {
  id: string;
  title: string;
  image: string;
}

// Batch 1 (Page 01 - 12 Items)
const page1Projects: ProjectCardItem[] = [
  {
    id: 'comp-bio',
    title: 'Biomarker Discovery for Cancer',
    image: 'https://media.liemaxels.com/images/career-trace/binus-anggrek.webp',
  },
  {
    id: 'railroad-cv',
    title: 'Railroad Safety System',
    image: 'https://media.liemaxels.com/images/career-trace/madiun-office.webp',
  },
  {
    id: 'tantalus-spatial',
    title: 'Tantalus 2D Spatial Canvas',
    image: '/projects.png',
  },
  {
    id: 'apple-spatial',
    title: 'Spatial Audio & Vision',
    image: 'https://media.liemaxels.com/images/career-trace/apple-academy.webp',
  },
  {
    id: 'liem-monorepo',
    title: 'Liem Distributed Monorepo',
    image: 'https://media.liemaxels.com/images/career-trace/online-tutoring.webp',
  },
  {
    id: 'neural-nlp',
    title: 'Lexical Intent Classifier',
    image: 'https://media.liemaxels.com/images/career-trace/binus-malang.webp',
  },
  {
    id: 'webgl-renderer',
    title: 'Raymarched 3D Shaders',
    image: '/statue.png',
  },
  {
    id: 'autonomous-nav',
    title: 'Stereo Depth Odometry',
    image: '/bridge.png',
  },
  {
    id: 'ai-code-reviewer',
    title: 'Static Analyzer AI Agent',
    image: '/certificates.png',
  },
  {
    id: 'distributed-queue',
    title: 'Zero-Allocation Stream',
    image: '/timeline.png',
  },
  {
    id: 'biometric-auth',
    title: 'Facial Anti-Spoofing',
    image: '/home.png',
  },
  {
    id: 'cloud-orchestration',
    title: 'Self-Healing Mesh',
    image: '/projects.png',
  },
];

// Batch 2 (Page 02 - 12 Items)
const page2Projects: ProjectCardItem[] = [
  {
    id: 'quantum-sim',
    title: 'Qubit State Simulator',
    image: 'https://media.liemaxels.com/images/career-trace/binus-malang.webp',
  },
  {
    id: 'swift-neural',
    title: 'CoreML Neural Style',
    image: 'https://media.liemaxels.com/images/career-trace/apple-academy.webp',
  },
  {
    id: 'audio-dsp',
    title: 'Real-time Synthesizer',
    image: '/home.png',
  },
  {
    id: 'edge-inference',
    title: 'FPGA DL Accelerator',
    image: '/timeline.png',
  },
  {
    id: 'graph-rag',
    title: 'Knowledge Graph RAG',
    image: 'https://media.liemaxels.com/images/career-trace/binus-anggrek.webp',
  },
  {
    id: 'astronomy-cv',
    title: 'Exoplanet Curve AI',
    image: '/statue.png',
  },
  {
    id: 'p2p-sync',
    title: 'CRDT Decentralized Sync',
    image: '/bridge.png',
  },
  {
    id: 'micro-compiler',
    title: 'LLVM Bytecode JIT',
    image: '/certificates.png',
  },
  {
    id: 'vision-pose',
    title: '3D Kinematic Tracker',
    image: 'https://media.liemaxels.com/images/career-trace/madiun-office.webp',
  },
  {
    id: 'semantic-search',
    title: 'HNSW Vector Index',
    image: 'https://media.liemaxels.com/images/career-trace/online-tutoring.webp',
  },
  {
    id: 'gpu-particles',
    title: 'Million-Body Physics',
    image: '/projects.png',
  },
  {
    id: 'kernel-driver',
    title: 'Zero-Copy Packet Filter',
    image: '/home.png',
  },
];

const projectPages = [page1Projects, page2Projects];

const cubeFaces = [
  { faceIdx: 0, pageIdx: 0, items: page1Projects },
  { faceIdx: 1, pageIdx: 1, items: page2Projects },
  { faceIdx: 2, pageIdx: 0, items: page1Projects },
  { faceIdx: 3, pageIdx: 1, items: page2Projects },
];

interface ProjectsGridProps {
  onReachEnd?: () => void;
  onReachStart?: () => void;
}

export function ProjectsGrid({ onReachEnd, onReachStart }: ProjectsGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotY: 0, rotX: 0 });
  const hasDraggedRef = useRef(false);

  const lastWheelTimeRef = useRef<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState<number>(384);

  useEffect(() => {
    if (!stageRef.current) return;
    const updateRadius = () => {
      if (stageRef.current) {
        setRadius(stageRef.current.offsetWidth / 2);
      }
    };
    updateRadius();
    const ro = new ResizeObserver(updateRadius);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const handleNext = useCallback(() => {
    if (currentPage >= projectPages.length - 1) {
      onReachEnd?.();
    } else {
      const nextY = Math.round(rotationY / 90) * 90 - 90;
      setRotationY(nextY);
      setRotationX(0);
      const facingStep = ((-Math.round(nextY / 90)) % 4 + 4) % 4;
      setCurrentPage(facingStep % 2);
    }
  }, [currentPage, rotationY, onReachEnd]);

  const handlePrev = useCallback(() => {
    if (currentPage <= 0) {
      onReachStart?.();
    } else {
      const prevY = Math.round(rotationY / 90) * 90 + 90;
      setRotationY(prevY);
      setRotationX(0);
      const facingStep = ((-Math.round(prevY / 90)) % 4 + 4) % 4;
      setCurrentPage(facingStep % 2);
    }
  }, [currentPage, rotationY, onReachStart]);

  // Pointer drag controls for holding & rotating freely
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotationY,
      rotX: rotationX,
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

    setRotationY(nextRotY);
    setRotationX(nextRotX);
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

    // Snap smoothly to nearest 90-degree face
    const snappedY = Math.round(rotationY / 90) * 90;
    setRotationY(snappedY);
    setRotationX(0);

    const facingStep = ((-Math.round(snappedY / 90)) % 4 + 4) % 4;
    setCurrentPage(facingStep % 2);
  };

  // Mousewheel listener for rotating Cube & Section Handoff
  const handleWheel = (e: React.WheelEvent) => {
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
      onWheel={handleWheel}
      className="relative w-full h-full flex flex-col items-center justify-center z-20 pointer-events-auto px-4 py-4 overflow-hidden"
    >
      {/* 3D Cube Container with Non-Overlapping Flex Flanks */}
      <div className="relative w-full flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-14">
        
        {/* Left Arrow Slot */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          {currentPage > 0 ? (
            <button
              onClick={handlePrev}
              title="Rotate Cube Left"
              className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
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
          className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[380px] sm:h-[415px] md:h-[445px] flex items-center justify-center flex-shrink-0 touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Rotating 3D Cube Rig */}
          <motion.div
            animate={{
              rotateY: rotationY,
              rotateX: rotationX,
              z: -radius,
            }}
            transition={
              isDragging
                ? { type: 'tween', duration: 0 }
                : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            }
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full"
          >
            {cubeFaces.map((face) => {
              const facingStep = ((-Math.round(rotationY / 90)) % 4 + 4) % 4;
              const isFaceActive = facingStep === face.faceIdx;

              return (
                <div
                  key={face.faceIdx}
                  style={{
                    transform: `rotateY(${face.faceIdx * 90}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  className={`absolute inset-0 w-full h-full grid grid-cols-4 gap-2 sm:gap-2.5 transition-all duration-700 ease-out ${
                    isFaceActive
                      ? 'opacity-100 pointer-events-auto filter-none'
                      : 'opacity-85 pointer-events-none brightness-75'
                  }`}
                >
                  {face.items.map((project) => (
                    <motion.div
                      key={`${face.faceIdx}-${project.id}`}
                      whileHover={{
                        scale: !isDragging && isFaceActive ? 1.09 : 1,
                        y: !isDragging && isFaceActive ? -5 : 0,
                        transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="group relative flex flex-col justify-start p-1.5 sm:p-2 rounded-xl bg-white/40 dark:bg-[#121110]/80 hover:bg-white/60 dark:hover:bg-[#121110]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/15 hover:border-white/95 dark:hover:border-white/35 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),0_8px_24px_-4px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_12px_32px_-4px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.95),0_16px_40px_-4px_rgba(0,0,0,0.28)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2),0_18px_44px_-4px_rgba(0,0,0,0.85)] z-10 hover:z-40 transition-colors duration-200 cursor-pointer"
                    >
                      {/* Specular Top Light Accent */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/35 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150 rounded-t-xl" />

                      {/* 16:9 Thumbnail Image */}
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-black/10 dark:bg-black/40 border border-white/40 dark:border-white/15 mb-1 flex-shrink-0">
                        <img
                          src={project.image}
                          alt={project.title}
                          draggable={false}
                          className="w-full h-full object-cover object-center pointer-events-none select-none"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = '/projects.png';
                          }}
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
          {currentPage < projectPages.length - 1 ? (
            <button
              onClick={handleNext}
              title="Rotate Cube Right"
              className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_4px_18px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(0,0,0,0.4)]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}

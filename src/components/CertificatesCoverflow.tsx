import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { certificatesData, type CertificateItem } from '../data/certificates';

export interface CertificatesCoverflowProps {
  onReachTop?: () => void;
  onReachRight?: () => void;
}

export function CertificatesCoverflow({ onReachTop, onReachRight }: CertificatesCoverflowProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastWheelTimeRef = useRef<number>(0);

  const handleNext = useCallback(() => {
    if (selectedIndex >= certificatesData.length - 1) {
      onReachRight?.();
    } else {
      const next = selectedIndex + 1;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
      setVirtualIndex(next);
    }
  }, [selectedIndex, onReachRight]);

  const handlePrev = useCallback(() => {
    if (selectedIndex <= 0) {
      onReachTop?.();
    } else {
      const prev = selectedIndex - 1;
      selectedIndexRef.current = prev;
      setSelectedIndex(prev);
      setVirtualIndex(prev);
    }
  }, [selectedIndex, onReachTop]);

  // Pointer drag controls: 1:1 continuous dragging with elastic resistance (matching TimelineRoller UX)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartIndexRef.current = virtualIndex;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;

    if (Math.abs(dx) > 4) {
      hasDraggedRef.current = true;
    }

    // Dragging left (dx < 0) pulls right cards forward (increases index)
    // Dragging right (dx > 0) pulls left cards forward (decreases index)
    const rawIndex = dragStartIndexRef.current - dx / 220;
    const maxIdx = certificatesData.length - 1;

    // Soft elastic resistance beyond boundaries
    let boundedIndex = rawIndex;
    if (rawIndex < 0) {
      boundedIndex = rawIndex * 0.25;
    } else if (rawIndex > maxIdx) {
      boundedIndex = maxIdx + (rawIndex - maxIdx) * 0.25;
    }

    setVirtualIndex(boundedIndex);

    // Update active selection in real time while dragging
    const nearestIndex = Math.max(0, Math.min(maxIdx, Math.round(boundedIndex)));
    if (nearestIndex !== selectedIndexRef.current) {
      selectedIndexRef.current = nearestIndex;
      setSelectedIndex(nearestIndex);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Snap smoothly to nearest item with weighted mechanical inertia
    const targetIndex = Math.max(0, Math.min(certificatesData.length - 1, Math.round(virtualIndex)));
    selectedIndexRef.current = targetIndex;
    setSelectedIndex(targetIndex);
    setVirtualIndex(targetIndex);
  };

  // Weighted wheel listener with deliberate mechanical interval (matching TimelineRoller UX)
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const now = Date.now();

    if (now - lastWheelTimeRef.current < 160) return;

    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    if (Math.abs(delta) > 10) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastWheelTimeRef.current = now;
    }
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Click handler: opens official credential link if center, or rotates to center if flank
  const handleCardClick = (cert: CertificateItem, index: number, isCenter: boolean) => {
    if (hasDraggedRef.current) return;
    if (isCenter) {
      window.open(cert.credentialUrl, '_blank', 'noopener,noreferrer');
    } else {
      selectedIndexRef.current = index;
      setSelectedIndex(index);
      setVirtualIndex(index);
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-auto px-4 sm:px-8 py-6 z-20 overflow-hidden"
    >
      {/* ================= 3D COVERFLOW CLUSTER WITH FLANKING ARROWS ================= */}
      <div className="relative w-full max-w-6xl flex items-center justify-center gap-2 sm:gap-6 md:gap-8">
        
        {/* Left Arrow Slot (Positioned on the Left Flank, visible when not at start) */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          {selectedIndex > 0 ? (
            <button
              onClick={handlePrev}
              title="Previous Certificate"
              className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
        </div>

        {/* 3D Perspective Stage */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ perspective: '1200px' }}
          className={`relative w-full max-w-5xl h-[380px] sm:h-[420px] md:h-[450px] flex items-center justify-center touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {certificatesData.map((cert, index) => {
            const currentPos = isDragging ? virtualIndex : selectedIndex;
            const offset = index - currentPos;
            const absOffset = Math.abs(offset);
            const isCenter = absOffset < 0.45;

            // Continuous 3D Spatial Geometry matching TimelineRoller kinematics
            let translateX = 0;
            let rotateY = 0;
            let translateZ = 0;
            let scale = 1;
            let opacity = 1;

            if (absOffset < 0.05) {
              translateX = 0;
              rotateY = 0;
              translateZ = 80;
              scale = 1;
              opacity = 1;
            } else if (offset < 0) {
              // Left Flank
              translateX = offset * 210 - 100;
              rotateY = Math.min(34, Math.max(0, -offset * 28));
              translateZ = -120 - (absOffset - 1) * 50;
              scale = Math.max(0.55, 0.78 - (absOffset - 1) * 0.14);
              opacity = Math.max(0.15, 0.48 - (absOffset - 1) * 0.25);
            } else {
              // Right Flank
              translateX = offset * 210 + 100;
              rotateY = Math.max(-34, Math.min(0, -offset * 28));
              translateZ = -120 - (absOffset - 1) * 50;
              scale = Math.max(0.55, 0.78 - (absOffset - 1) * 0.14);
              opacity = Math.max(0.15, 0.48 - (absOffset - 1) * 0.25);
            }

            const zIndex = Math.round(30 - absOffset * 10);
            const isClickable = absOffset <= 2.2;

            return (
              <motion.div
                key={cert.id}
                onClick={() => handleCardClick(cert, index, isCenter)}
                animate={{
                  x: translateX,
                  rotateY,
                  z: translateZ,
                  scale,
                  opacity,
                }}
                transition={
                  isDragging
                    ? { type: 'tween', duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 130,
                        damping: 24,
                        mass: 1.25,
                      }
                }
                style={{
                  zIndex,
                  transformStyle: 'preserve-3d',
                  pointerEvents: isClickable ? 'auto' : 'none',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
                className="group absolute w-[310px] sm:w-[380px] md:w-[430px] h-[300px] sm:h-[340px] md:h-[370px] rounded-3xl p-2.5 sm:p-3 transition-colors cursor-pointer select-none"
              >
                {/* Apple Frosted Glass Frame with Crisp Razor-Sharp Typography */}
                <div
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className={`w-full h-full rounded-2xl flex flex-col justify-between p-3.5 sm:p-4.5 border transition-all duration-300 ${
                    isCenter
                      ? 'bg-[#FAF8F5]/85 dark:bg-[#161412]/85 backdrop-blur-2xl border-white/80 dark:border-white/25 shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),0_24px_50px_-10px_rgba(0,0,0,0.35)] group-hover:border-amber-700/60 dark:group-hover:border-amber-400/50 group-hover:shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,1),0_28px_60px_-10px_rgba(0,0,0,0.45)]'
                      : 'bg-[#FAF8F5]/60 dark:bg-[#161412]/60 backdrop-blur-xl border-white/50 dark:border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:border-white/80'
                  }`}
                >
                  {/* Certificate Document Thumbnail Preview */}
                  <div className="relative w-full h-40 sm:h-48 md:h-52 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-stone-200/50 dark:border-white/10 mb-2 flex-shrink-0">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-500 group-hover:scale-103"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Certificate Header: Issuer Badge & Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-white/10 pb-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-sans font-semibold border ${cert.issuerBadgeColor} drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[190px]">{cert.issuer}</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-sans font-semibold text-stone-900 dark:text-stone-100 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A] flex-shrink-0" />
                      <span>{cert.issueDate}</span>
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <div className="py-1">
                    <h3
                      title={cert.title}
                      className="font-sans text-xs sm:text-sm md:text-base font-semibold text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors leading-snug line-clamp-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                    >
                      {cert.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Arrow Slot (Positioned on the Right Flank, visible when not at end) */}
        <div className="w-10 sm:w-12 md:w-14 flex items-center justify-center flex-shrink-0 z-40">
          {selectedIndex < certificatesData.length - 1 ? (
            <button
              onClick={handleNext}
              title="Next Certificate"
              className="p-2.5 sm:p-3 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : null}
        </div>

      </div>

      {/* ================= STEP INDICATOR COUNTER ================= */}
      <div className="absolute bottom-6 sm:bottom-8 z-30 flex items-center gap-3 font-serif italic text-sm sm:text-base text-white tracking-widest">
        <span
          style={{
            textShadow: '0 1px 6px rgba(0,0,0,0.85)',
          }}
        >
          0{selectedIndex + 1}
        </span>
        <span className="w-12 h-[1px] bg-white/40 shadow-sm" />
        <span
          style={{
            textShadow: '0 1px 6px rgba(0,0,0,0.85)',
          }}
        >
          0{certificatesData.length}
        </span>
      </div>
    </div>
  );
}

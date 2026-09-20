import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, MapPin, Calendar, Sparkles } from 'lucide-react';
import { getAssetUrl } from '../lib/assets';
import { timelineData, type TimelineItem } from '../data/timeline';
import ImageWithSkeleton from './common/ImageWithSkeleton';

export type { TimelineItem };

interface TimelineRollerProps {
  isActive?: boolean;
  onReachEnd?: () => void;
  onReachStart?: () => void;
}

export function TimelineRoller({ isActive = true, onReachEnd, onReachStart }: TimelineRollerProps) {
  // Initialize on Apple Developer Academy (index 0)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastWheelTimeRef = useRef<number>(0);

  const activeItem = timelineData[selectedIndex] || timelineData[0];

  const handleNext = useCallback(() => {
    if (selectedIndex >= timelineData.length - 1) {
      onReachEnd?.();
    } else {
      const next = selectedIndex + 1;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
      setVirtualIndex(next);
    }
  }, [selectedIndex, onReachEnd]);

  const handlePrev = useCallback(() => {
    if (selectedIndex <= 0) {
      onReachStart?.();
    } else {
      const prev = selectedIndex - 1;
      selectedIndexRef.current = prev;
      setSelectedIndex(prev);
      setVirtualIndex(prev);
    }
  }, [selectedIndex, onReachStart]);

  // Pointer drag controls for holding & rolling freely
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartYRef.current = e.clientY;
    dragStartIndexRef.current = virtualIndex;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dy = e.clientY - dragStartYRef.current;

    if (Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }

    // Dragging down (dy > 0) pulls upper cards down (decreases index)
    // Dragging up (dy < 0) pulls lower cards up (increases index)
    const rawIndex = dragStartIndexRef.current - dy / 118;
    const maxIdx = timelineData.length - 1;

    // Soft elastic resistance beyond boundaries
    let boundedIndex = rawIndex;
    if (rawIndex < 0) {
      boundedIndex = rawIndex * 0.25;
    } else if (rawIndex > maxIdx) {
      boundedIndex = maxIdx + (rawIndex - maxIdx) * 0.25;
    }

    setVirtualIndex(boundedIndex);

    // Update left detail text & active selection in real time while still holding & dragging
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
    } catch {
      // fallback
    }

    // Snap smoothly to nearest item
    const targetIndex = Math.max(0, Math.min(timelineData.length - 1, Math.round(virtualIndex)));
    selectedIndexRef.current = targetIndex;
    setSelectedIndex(targetIndex);
    setVirtualIndex(targetIndex);
  };

  // Weighted wheel listener with deliberate mechanical interval
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const now = Date.now();

    if (now - lastWheelTimeRef.current < 160) return;

    if (Math.abs(e.deltaY) > 10) {
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastWheelTimeRef.current = now;
    }
  };

  if (!isActive) return null;

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full flex items-center justify-center z-20 pointer-events-auto px-6 sm:px-12 md:px-16"
    >
      {/* Centered Enlarged Snug Cluster */}
      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-10 sm:gap-14 lg:gap-18">
        
        {/* LEFT: Detail Content */}
        <div className="flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-center justify-center text-center z-20">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center justify-center space-y-3 sm:space-y-3.5"
          >
            {/* Role Title */}
            <h2
              className="font-serif italic text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light leading-tight tracking-tight whitespace-nowrap"
              style={{
                textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 8px 40px rgba(0,0,0,0.65)',
              }}
            >
              {activeItem.role}
            </h2>

            {/* Grouped Location & Date in Frosted Glass Capsule */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-black/35 dark:bg-black/60 backdrop-blur-xl border border-white/25 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0.5px_rgba(255,255,255,0.4)] text-sm sm:text-base md:text-lg font-serif italic tracking-wide">
              {/* Company / Location */}
              <div className="flex items-center gap-1.5 text-[#FFD88A] font-medium">
                <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FFD88A]" />
                <span>{activeItem.company}</span>
              </div>

              {/* Separator Dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />

              {/* Date / Year */}
              <div className="flex items-center gap-1.5 text-white font-medium">
                <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FFD88A]" />
                <span>{activeItem.year}</span>
              </div>

              {/* Upcoming Badge */}
              {activeItem.isUpcoming && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-300/40 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-amber-200 font-medium ml-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Upcoming</span>
                </span>
              )}
            </div>

            {/* Description */}
            <p
              className="font-serif italic text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-[1.65] font-normal tracking-[0.015em] pt-1 max-w-xl"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 6px 28px rgba(0,0,0,0.65)',
              }}
            >
              {activeItem.description}
            </p>

            {/* Step counter */}
            <div
              className="flex items-center justify-center gap-3.5 pt-1.5 text-sm sm:text-base font-serif italic text-stone-200/90 tracking-widest font-light"
              style={{
                textShadow: '0 1px 6px rgba(0,0,0,0.7)',
              }}
            >
              <span>0{selectedIndex + 1}</span>
              <span className="w-14 h-[1px] bg-white/30" />
              <span>0{timelineData.length}</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Cylindrical Roller Wheel */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center z-30">
          
          {/* Scroll Up Button Indicator (Only visible when not at top) */}
          <div className="h-10 flex items-center justify-center mb-2.5">
            {selectedIndex > 0 ? (
              <button
                onClick={handlePrev}
                title="Previous Experience"
                className="p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Roller Wheel Chamber */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
            }}
            className={`relative h-[440px] sm:h-[500px] w-[280px] sm:w-[330px] md:w-[370px] flex items-center justify-center perspective-[1200px] overflow-visible py-4 touch-none select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {timelineData.map((item, index) => {
              const currentPos = isDragging ? virtualIndex : selectedIndex;
              const offset = index - currentPos;
              const absOffset = Math.abs(offset);
              const isCenter = absOffset < 0.5;

              // Gentle cylindrical wheel calculations
              const translateY = offset * 118;
              const scale = Math.max(0.68, 1 - absOffset * 0.14);
              const opacity =
                absOffset <= 1
                  ? Math.max(0, 1 - absOffset * 0.45)
                  : Math.max(0, 0.55 - (absOffset - 1) * 0.3);
              const rotateX = Math.max(-25, Math.min(25, offset * -9));
              const zIndex = Math.round(30 - Math.min(25, absOffset * 10));
              const isInteractive = absOffset <= 2.2;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (hasDraggedRef.current) return;
                    if (isInteractive) {
                      selectedIndexRef.current = index;
                      setSelectedIndex(index);
                      setVirtualIndex(index);
                    }
                  }}
                  animate={{
                    y: translateY,
                    scale,
                    opacity,
                    rotateX,
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
                    pointerEvents: isInteractive ? 'auto' : 'none',
                  }}
                  className={`absolute w-full p-2.5 sm:p-3 rounded-2xl transition-colors duration-300 cursor-pointer ${
                    isCenter
                      ? 'bg-white/[0.18] dark:bg-black/55 backdrop-blur-2xl border border-white/40 dark:border-white/20'
                      : 'bg-black/20 dark:bg-black/45 backdrop-blur-md border border-white/10 dark:border-white/5 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Media Thumbnail with Skeleton Loader */}
                    <div
                      className={`relative overflow-hidden rounded-xl border border-white/25 flex-shrink-0 transition-all duration-300 ${
                        isCenter
                          ? 'w-26 h-18 sm:w-30 sm:h-20'
                          : 'w-18 h-12 sm:w-22 sm:h-15'
                      }`}
                    >
                      <ImageWithSkeleton
                        src={item.image}
                        alt={item.company}
                        wrapperClassName="w-full h-full"
                        className="w-full h-full object-cover object-center pointer-events-none select-none"
                        skeletonClassName="bg-white/10 dark:bg-black/40"
                      />
                    </div>

                    {/* Compact Card Typography */}
                    <div className="flex-1 min-w-0 text-left space-y-0.5">
                      <p
                        className="text-[11px] sm:text-xs font-serif italic text-[#FFD88A] truncate font-medium"
                        style={{
                          textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                        }}
                      >
                        {item.year}
                      </p>
                      <h3
                        className={`font-serif italic text-white font-normal truncate ${
                          isCenter ? 'text-sm sm:text-base font-medium' : 'text-xs'
                        }`}
                        style={{
                          textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                        }}
                      >
                        {item.role}
                      </h3>
                      <p
                        className="text-[11px] sm:text-xs font-serif italic text-stone-200/90 truncate"
                        style={{
                          textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                        }}
                      >
                        {item.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll Down Button Indicator (Only visible when not at bottom) */}
          <div className="h-10 flex items-center justify-center mt-2.5">
            {selectedIndex < timelineData.length - 1 ? (
              <button
                onClick={handleNext}
                title="Next Experience"
                className="p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}

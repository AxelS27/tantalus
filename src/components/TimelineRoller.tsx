import { memo, useState, useRef, useCallback } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ChevronUp, ChevronDown, MapPin, Calendar, Sparkles } from 'lucide-react';
import { getAssetUrl } from '../lib/assets';
import { timelineData, type TimelineItem } from '../data/timeline';
import ImageWithSkeleton from './common/ImageWithSkeleton';
import StepCounter from './common/StepCounter';

export type { TimelineItem };

interface TimelineRollerProps {
  isActive?: boolean;
  onReachEnd?: () => void;
  onReachStart?: () => void;
}

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  position: MotionValue<number>;
  selectedIndex: number;
  isDragging: boolean;
  horizontal?: boolean;
  onSelect: (index: number) => void;
}

const TimelineCard = memo(function TimelineCard({
  item,
  index,
  position,
  selectedIndex,
  isDragging,
  horizontal = false,
  onSelect,
}: TimelineCardProps) {
  const x = useTransform(position, (current) => horizontal ? (index - current) * 230 : 0);
  const y = useTransform(position, (current) => horizontal ? 0 : (index - current) * 118);
  const scale = useTransform(position, (current) =>
    Math.max(0.68, 1 - Math.abs(index - current) * (horizontal ? 0.1 : 0.14)),
  );
  const opacity = useTransform(position, (current) => {
    const distance = Math.abs(index - current);
    return distance <= 1
      ? Math.max(0, 1 - distance * (horizontal ? 0.3 : 0.45))
      : Math.max(0, (horizontal ? 0.7 : 0.55) - (distance - 1) * 0.3);
  });
  const rotateX = useTransform(position, (current) =>
    horizontal ? 0 : Math.max(-25, Math.min(25, (index - current) * -9)),
  );
  const rotateY = useTransform(position, (current) =>
    horizontal ? Math.max(-18, Math.min(18, (index - current) * -12)) : 0,
  );
  const zIndex = useTransform(position, (current) =>
    Math.round(30 - Math.min(25, Math.abs(index - current) * 10)),
  );

  const offset = index - selectedIndex;
  const isCenter = offset === 0;
  const isInteractive = Math.abs(offset) <= 2;

  return (
    <motion.div
      onClick={() => isInteractive && (horizontal || !window.getSelection()?.toString()) && onSelect(index)}
      style={{
        x,
        y,
        scale,
        opacity,
        rotateX,
        rotateY,
        zIndex,
        transformStyle: 'preserve-3d',
        pointerEvents: isInteractive ? 'auto' : 'none',
      }}
      className={`glass-surface absolute ${horizontal ? 'w-[min(66vw,210px)] h-[76px] p-2' : 'w-full p-2.5 sm:p-3'} rounded-2xl cursor-pointer overflow-hidden transform-gpu will-change-transform ${
        isCenter
          ? 'bg-white/45 dark:bg-[#161412]/60 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/75 dark:border-white/20 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]'
          : 'bg-white/25 dark:bg-[#161412]/40 backdrop-blur-xl backdrop-saturate-[160%] border border-white/40 dark:border-white/10 hover:opacity-85'
      } ${horizontal || isDragging ? 'select-none' : ''}`}
    >
      {/* Specular Top Light Accent */}
      {isCenter && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150 rounded-t-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/10 via-transparent to-transparent opacity-50 pointer-events-none rounded-2xl" />
        </>
      )}

      <div className={`flex ${horizontal ? 'h-full items-center gap-2.5' : 'items-center gap-2.5 md:gap-3.5'} relative z-10`}>
        <div
          className={`relative overflow-hidden rounded-xl border border-white/25 flex-shrink-0 transition-all duration-300 ${
            horizontal ? 'w-14 h-14' : isCenter ? 'w-20 h-16 md:w-30 md:h-20' : 'w-16 h-12 md:w-22 md:h-15'
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

        <div data-timeline-text className={`flex-1 min-w-0 w-full text-left space-y-0.5 ${horizontal ? 'flex flex-col justify-center select-none cursor-grab' : 'select-text cursor-text'}`}>
          <p
            className={`${horizontal ? 'hidden' : ''} text-[11px] sm:text-xs font-serif italic text-amber-900 dark:text-[#FFD88A] truncate font-medium dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.95)]`}
          >
            {item.year}
          </p>
          <h3
            className={`font-serif italic text-stone-950 dark:text-white font-normal dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.95)] ${
              horizontal ? 'text-[12px] font-medium line-clamp-2 leading-tight' : isCenter ? 'text-sm md:text-base font-medium max-md:line-clamp-2' : 'text-xs truncate'
            }`}
          >
            {item.role}
          </h3>
          <p
            className={`text-[11px] md:text-xs font-serif italic text-stone-800 dark:text-stone-200/90 dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.95)] ${horizontal ? 'truncate' : isCenter ? 'max-md:line-clamp-2 md:truncate' : 'truncate'}`}
          >
            {item.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

export const TimelineRoller = memo(function TimelineRoller({
  isActive = true,
  onReachEnd,
  onReachStart,
}: TimelineRollerProps) {
  // Initialize on Apple Developer Academy (index 0)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  const position = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartXRef = useRef(0);
  const isHorizontalDragRef = useRef(false);
  const dragStartIndexRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastWheelTimeRef = useRef<number>(0);

  const activeItem = timelineData[selectedIndex] || timelineData[0];

  const animateToIndex = useCallback((index: number) => {
    position.stop();
    animate(position, index, {
      type: 'spring',
      stiffness: 130,
      damping: 24,
      mass: 1.25,
    });
  }, [position]);

  const handleNext = useCallback(() => {
    if (selectedIndex >= timelineData.length - 1) {
      onReachEnd?.();
    } else {
      const next = selectedIndex + 1;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
      animateToIndex(next);
    }
  }, [selectedIndex, onReachEnd, animateToIndex]);

  const handlePrev = useCallback(() => {
    if (selectedIndex <= 0) {
      onReachStart?.();
    } else {
      const prev = selectedIndex - 1;
      selectedIndexRef.current = prev;
      setSelectedIndex(prev);
      animateToIndex(prev);
    }
  }, [selectedIndex, onReachStart, animateToIndex]);

  // Pointer drag controls for holding & rolling freely
  const handlePointerDown = (e: React.PointerEvent, horizontal = false) => {
    if (!isActive || e.button !== 0) return;
    // Let mouse users select card labels; dragging from the image or card surface still rolls.
    if (!horizontal && e.pointerType === 'mouse' && (e.target as HTMLElement).closest('[data-timeline-text]')) return;
    isHorizontalDragRef.current = horizontal;
    isDraggingRef.current = true;
    position.stop();
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartYRef.current = e.clientY;
    dragStartXRef.current = e.clientX;
    dragStartIndexRef.current = position.get();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = isHorizontalDragRef.current
      ? e.clientX - dragStartXRef.current
      : e.clientY - dragStartYRef.current;

    if (Math.abs(delta) > 4) {
      hasDraggedRef.current = true;
    }

    // Drag left on mobile or up on desktop to move forward through experiences.
    const rawIndex = dragStartIndexRef.current - delta / (isHorizontalDragRef.current ? 230 : 118);
    const maxIdx = timelineData.length - 1;

    // Soft elastic resistance beyond boundaries
    let boundedIndex = rawIndex;
    if (rawIndex < 0) {
      boundedIndex = rawIndex * 0.25;
    } else if (rawIndex > maxIdx) {
      boundedIndex = maxIdx + (rawIndex - maxIdx) * 0.25;
    }

    position.set(boundedIndex);

    // React only updates when the selected item changes. Card transforms bypass React.
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

    const targetIndex = Math.max(
      0,
      Math.min(timelineData.length - 1, Math.round(position.get())),
    );
    selectedIndexRef.current = targetIndex;
    setSelectedIndex(targetIndex);
    animateToIndex(targetIndex);
  };

  const handleSelect = useCallback((nextIndex: number) => {
    if (hasDraggedRef.current) return;
    selectedIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
    animateToIndex(nextIndex);
  }, [animateToIndex]);

  // Weighted wheel listener with deliberate mechanical interval
  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
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

  return (
    <div
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full flex items-center justify-center z-20 md:px-16 transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <StepCounter current={selectedIndex + 1} total={timelineData.length} label="Experience" />

      {/* Centered Enlarged Snug Cluster */}
      <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-14 lg:gap-18 max-md:absolute max-md:inset-x-0 max-md:top-2 max-md:bottom-[calc(8.75rem+env(safe-area-inset-bottom))] max-md:justify-between max-md:overflow-y-auto max-md:overscroll-contain max-md:px-5 max-md:py-4">
        
        {/* LEFT: Detail Content */}
        <div className="w-full max-md:flex-1 md:w-auto md:flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-center justify-center max-md:justify-end max-md:pb-20 text-center select-text z-20">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center justify-center space-y-2.5 md:space-y-3.5"
          >
            {/* Role Title */}
            <h2
              className="font-serif italic text-[clamp(1.8rem,8vw,2.5rem)] md:text-5xl lg:text-6xl text-white font-light leading-[1.1] md:leading-tight tracking-tight md:whitespace-nowrap"
              style={{
                textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 8px 40px rgba(0,0,0,0.65)',
              }}
            >
              {activeItem.role}
            </h2>

            {/* Grouped Location & Date in Frosted Glass Capsule */}
            <div className="glass-surface inline-flex max-w-full flex-col md:flex-row md:flex-wrap items-center justify-center gap-1 md:gap-3 px-3 md:px-5 py-2 rounded-2xl md:rounded-full bg-white/55 dark:bg-[#161412]/60 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] text-xs md:text-lg font-serif italic tracking-wide">
              <div className="flex w-full min-w-0 items-center gap-1.5 md:contents">
                {/* Company / Location */}
                <div className="flex min-w-0 items-center gap-1 text-amber-800 dark:text-[#FFD88A] font-semibold dark:font-medium md:gap-1.5" title={activeItem.company}>
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0 text-amber-700 dark:text-[#FFD88A]" />
                  <span className="truncate md:overflow-visible md:whitespace-normal md:text-clip">{activeItem.company}</span>
                </div>

                {/* Separator Dot */}
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 shrink-0 rounded-full bg-stone-400/70 dark:bg-white/40" />

                {/* Date / Year */}
                <div className="flex shrink-0 items-center gap-1 text-stone-900 dark:text-white font-semibold dark:font-medium md:gap-1.5">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 shrink-0 text-amber-700 dark:text-[#FFD88A]" />
                  <span className="whitespace-nowrap">{activeItem.year}</span>
                </div>
              </div>

              {/* Upcoming Badge */}
              {activeItem.isUpcoming && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 dark:bg-amber-500/30 border border-amber-600/40 dark:border-amber-300/40 text-xs uppercase tracking-[0.18em] text-amber-900 dark:text-amber-200 font-medium md:ml-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Upcoming</span>
                </span>
              )}
            </div>

            {/* Description */}
            <p
              className="w-[calc(100vw-4.5rem)] max-w-[21rem] md:w-auto md:max-w-xl font-serif italic text-[17px] md:text-xl lg:text-2xl text-white leading-[1.5] md:leading-[1.65] font-normal tracking-[0.015em] pt-1"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 6px 28px rgba(0,0,0,0.65)',
              }}
            >
              {activeItem.description}
            </p>

          </motion.div>
        </div>

        {/* Desktop: vertical cylindrical roller */}
        <div className="hidden md:flex flex-shrink-0 flex-col items-center justify-center z-30">
          
          {/* Scroll Up Button Indicator (Only visible when not at top) */}
          <div className="h-11 md:h-10 flex items-center justify-center mb-1 md:mb-2.5">
            {selectedIndex > 0 ? (
              <button
                onClick={handlePrev}
                title="Previous Experience"
                className="glass-surface min-w-11 min-h-11 md:min-w-0 md:min-h-0 p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
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
            className={`relative h-[500px] w-[370px] flex items-center justify-center perspective-[1200px] overflow-visible py-4 touch-none ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
          >
            {timelineData.map((item, index) => (
              <TimelineCard
                key={item.id}
                item={item}
                index={index}
                position={position}
                selectedIndex={selectedIndex}
                isDragging={isDragging}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Scroll Down Button Indicator (Only visible when not at bottom) */}
          <div className="h-11 md:h-10 flex items-center justify-center mt-1 md:mt-2.5">
            {selectedIndex < timelineData.length - 1 ? (
              <button
                onClick={handleNext}
                title="Next Experience"
                className="glass-surface min-w-11 min-h-11 md:min-w-0 md:min-h-0 p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 dark:active:bg-[#161412]/95 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/70 dark:border-white/20 hover:border-white dark:hover:border-white/40 text-stone-900 dark:text-stone-100 hover:text-black dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile: swipeable horizontal coverflow beneath the active story. */}
        <div className="md:hidden w-full flex-shrink-0 flex flex-col items-center z-30">
          <div
            onPointerDown={(event) => handlePointerDown(event, true)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            }}
            className={`relative flex h-[104px] w-full max-w-[400px] items-center justify-center overflow-hidden perspective-[1200px] touch-pan-y ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
          >
            {timelineData.map((item, index) => (
              <TimelineCard
                key={item.id}
                item={item}
                index={index}
                position={position}
                selectedIndex={selectedIndex}
                isDragging={isDragging}
                horizontal
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, MapPin, Calendar, Sparkles } from 'lucide-react';

export interface TimelineItem {
  id: string;
  year: string;
  role: string;
  company: string;
  description: string;
  image: string;
  isUpcoming?: boolean;
}

export const timelineData: TimelineItem[] = [
  {
    id: 'apple-academy',
    year: 'MAR 2027 - DEC 2027',
    role: 'Apple Developer Academy Learner',
    company: 'Apple Developer Academy @Tangerang',
    description:
      'Accepted into the prestigious Apple Developer Academy 2027 Cohort. Intensive 10-month journey mastering iOS app architecture, Swift, SwiftUI, spatial computing, and human-centered design.',
    image: 'https://media.liemaxels.com/images/career-trace/apple-academy.webp',
    isUpcoming: true,
  },
  {
    id: 'binus-jakarta',
    year: 'FEB 2026 - PRESENT',
    role: 'Intelligent Systems Mobility Student',
    company: 'BINUS University @Kemanggisan',
    description:
      'Continuing CS degree through a cross-campus mobility program in Jakarta. Specializing in Intelligent Systems with a deep focus on Natural Language Processing, Computer Vision, and Deep Learning.',
    image: 'https://media.liemaxels.com/images/career-trace/binus-anggrek.webp',
  },
  {
    id: 'coding-educator',
    year: 'JUN 2025 - PRESENT',
    role: 'Online Private Coding Educator',
    company: 'Freelance @Online',
    description:
      'Providing 1-on-1 online programming mentorship as an independent educator. Mentoring students in algorithmic logic, data structures, and interactive full-stack projects.',
    image: 'https://media.liemaxels.com/images/career-trace/online-tutoring.webp',
  },
  {
    id: 'kode-kiddo',
    year: 'JUN 2025 - SEP 2025',
    role: 'Computer Science Instructor',
    company: 'KODE KIDDO @Madiun',
    description:
      'Taught coding classes for young minds, facilitating foundational programming concepts, algorithmic thinking, and problem-solving through interactive software creations.',
    image: 'https://media.liemaxels.com/images/career-trace/madiun-office.webp',
  },
  {
    id: 'binus-malang',
    year: 'AUG 2024 - FEB 2026',
    role: 'Undergraduate Computer Science Student',
    company: 'BINUS University @Malang',
    description:
      'Built a rigorous academic foundation in algorithms, software engineering, database management, and mathematical foundations of computing at Binus Malang.',
    image: 'https://media.liemaxels.com/images/career-trace/binus-malang.webp',
  },
];

interface TimelineRollerProps {
  onReachEnd?: () => void;   // Triggered when scrolling past the last item -> go to Projects
  onReachStart?: () => void; // Triggered when scrolling before the first item -> go to Home
}

export function TimelineRoller({ onReachEnd, onReachStart }: TimelineRollerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastWheelTimeRef = useRef<number>(0);

  const activeItem = timelineData[selectedIndex] || timelineData[0];

  const handleNext = useCallback(() => {
    if (selectedIndex >= timelineData.length - 1) {
      onReachEnd?.();
    } else {
      setSelectedIndex((prev) => prev + 1);
    }
  }, [selectedIndex, onReachEnd]);

  const handlePrev = useCallback(() => {
    if (selectedIndex <= 0) {
      onReachStart?.();
    } else {
      setSelectedIndex((prev) => prev - 1);
    }
  }, [selectedIndex, onReachStart]);

  // Wheel listener with boundary handoff to global section navigation
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

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full flex items-center justify-center select-none z-20 pointer-events-auto px-6 sm:px-12 md:px-16"
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
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-black/35 backdrop-blur-xl border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0.5px_rgba(255,255,255,0.4)] text-sm sm:text-base md:text-lg font-serif italic tracking-wide">
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
          
          {/* Scroll Up Button Indicator */}
          <button
            onClick={handlePrev}
            title={selectedIndex === 0 ? 'Back to Home' : 'Previous Experience'}
            className="p-2.5 rounded-full backdrop-blur-md border border-white/25 text-white mb-2.5 transition-all duration-300 cursor-pointer bg-black/30 hover:bg-black/50 hover:scale-110 active:scale-95"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Roller Wheel Chamber */}
          <div
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
            }}
            className="relative h-[440px] sm:h-[500px] w-[280px] sm:w-[330px] md:w-[370px] flex items-center justify-center perspective-[1200px] overflow-visible py-4"
          >
            {timelineData.map((item, index) => {
              const offset = index - selectedIndex;
              const absOffset = Math.abs(offset);
              const isCenter = offset === 0;
              const isNear = absOffset === 1;
              const isFar = absOffset === 2;

              // Gentle cylindrical wheel calculations
              const translateY = offset * 118;
              const scale = isCenter ? 1 : isNear ? 0.86 : 0.72;
              const opacity = isCenter ? 1 : isNear ? 0.55 : 0.25;
              const rotateX = Math.max(-25, Math.min(25, offset * -9));
              const zIndex = 30 - Math.abs(offset) * 10;
              const isInteractive = absOffset <= 2;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => isInteractive && setSelectedIndex(index)}
                  animate={{
                    y: translateY,
                    scale,
                    opacity,
                    rotateX,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 130, // Heavier, graceful pull
                    damping: 24,    // Silky cushioned stop
                    mass: 1.25,     // Weighted mechanical inertia
                  }}
                  style={{
                    zIndex,
                    transformStyle: 'preserve-3d',
                    pointerEvents: isInteractive ? 'auto' : 'none',
                  }}
                  className={`absolute w-full p-2.5 sm:p-3 rounded-2xl transition-colors duration-300 cursor-pointer ${
                    isCenter
                      ? 'bg-white/[0.18] backdrop-blur-2xl border border-white/40 ring-1 ring-white/20'
                      : 'bg-black/20 backdrop-blur-md border border-white/10 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Media Thumbnail */}
                    <div
                      className={`relative overflow-hidden rounded-xl border border-white/25 flex-shrink-0 transition-all duration-300 ${
                        isCenter
                          ? 'w-26 h-18 sm:w-30 sm:h-20'
                          : 'w-18 h-12 sm:w-22 sm:h-15'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.company}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = '/timeline.png';
                        }}
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

          {/* Scroll Down Button Indicator */}
          <button
            onClick={handleNext}
            title={selectedIndex === timelineData.length - 1 ? 'Continue to Projects' : 'Next Experience'}
            className="p-2.5 rounded-full backdrop-blur-md border border-white/25 text-white mt-2.5 transition-all duration-300 cursor-pointer bg-black/30 hover:bg-black/50 hover:scale-110 active:scale-95"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

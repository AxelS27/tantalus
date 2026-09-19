import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { getAssetUrl } from '../lib/assets';

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issuerBadgeColor: string;
  issueDate: string;
  credentialUrl: string;
  image: string;
  description: string;
}

export const certificatesData: CertificateItem[] = [
  {
    id: 'nvidia-deep-learning',
    title: 'Fundamentals of Deep Learning',
    issuer: 'NVIDIA Deep Learning Institute',
    issuerBadgeColor: 'bg-[#76B900]/15 text-[#4D7C0F] dark:text-[#84CC16] border-[#76B900]/30',
    issueDate: 'OCT 2024',
    credentialUrl: 'https://learn.nvidia.com/certificates?id=wnSF-zEPRmuMGkEWrq1h4A',
    image: getAssetUrl('/images/certificates/fundamental-of-deeplearning.webp'),
    description:
      'Foundational deep learning network design, computer vision feature representations, and transfer learning workflows.',
  },
  {
    id: 'ms-azure-ai-fundamentals',
    title: 'Microsoft Azure AI Fundamentals (AI-900)',
    issuer: 'Microsoft x BINUS University',
    issuerBadgeColor: 'bg-[#0078D4]/15 text-[#0078D4] dark:text-[#60A5FA] border-[#0078D4]/30',
    issueDate: 'FEB 2026',
    credentialUrl: 'https://drive.google.com/file/d/1EBukOExRhI2w0Lir1uJlHs5avyDDEgUV/view?usp=drive_link',
    image: getAssetUrl('/images/certificates/microsoft-eleveate-ai-training.webp'),
    description:
      'Artificial intelligence workloads, cognitive vision & NLP services, and responsible AI principles in cloud environments.',
  },
  {
    id: 'bncc-lnt-c-programming',
    title: 'BNCC LNT C Programming',
    issuer: 'Bina Nusantara Computer Club',
    issuerBadgeColor: 'bg-[#0056D2]/15 text-[#0056D2] dark:text-[#5B96F7] border-[#0056D2]/30',
    issueDate: 'AUG 2025',
    credentialUrl: 'https://drive.google.com/file/d/1dJoY8GTQCdgxZApqdUdXIyGXEuTSBmWL/view',
    image: getAssetUrl('/images/certificates/lnt-c-programming.webp'),
    description:
      'Low-level systems programming, manual pointer arithmetic, dynamic memory allocation, and algorithmic problem solving.',
  },
  {
    id: 'ai-career-readiness',
    title: 'AI Career Readiness Certificate',
    issuer: 'ASEAN Foundation',
    issuerBadgeColor: 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FCD34D] border-[#D97706]/30',
    issueDate: 'SEP 2026',
    credentialUrl: 'https://drive.google.com/file/d/1W441eL0WyWvlMBlyDY0ElU-Djaq_gsvq/view',
    image: getAssetUrl('/images/certificates/ai-career-readiness.webp'),
    description:
      'Applied artificial intelligence competence, digital stewardship, and machine learning industrial readiness.',
  },
  {
    id: 'dean-list-binus',
    title: "Dean's List Certificate of Academic Excellence",
    issuer: 'BINUS University',
    issuerBadgeColor: 'bg-[#B91C1C]/15 text-[#B91C1C] dark:text-[#F87171] border-[#B91C1C]/30',
    issueDate: 'DEC 2025',
    credentialUrl: 'https://drive.google.com/file/d/1GdgwtUW11Zn-PcgFVgBObksK-sERQpDQ/view?usp=sharing',
    image: getAssetUrl('/images/certificates/dean-list-2025.webp'),
    description:
      'Academic honor awarded for exceptional scholastic performance, research dedication, and highest GPA honors.',
  },
];

interface CertificatesCoverflowProps {
  onReachTop?: () => void;
  onReachRight?: () => void;
}

export function CertificatesCoverflow({ onReachTop, onReachRight }: CertificatesCoverflowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < certificatesData.length - 1 ? prev + 1 : prev));
  }, []);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Pointer drag controls for dragging the coverflow deck
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const dx = e.clientX - dragStartXRef.current;
    if (dx < -40) {
      handleNext();
    } else if (dx > 40) {
      handlePrev();
    }
  };

  // Mouse wheel listener with edge section handoff
  const lastWheelTimeRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 450) return;

    const deltaX = e.deltaX;
    const deltaY = e.deltaY;

    // Boundary handoff when user wheels past ends
    if (deltaY < -35 && activeIndex === 0) {
      lastWheelTimeRef.current = now;
      onReachTop?.();
      return;
    }
    if ((deltaY > 35 || deltaX > 35) && activeIndex === certificatesData.length - 1) {
      lastWheelTimeRef.current = now;
      onReachRight?.();
      return;
    }

    if (deltaX > 25 || deltaY > 25) {
      lastWheelTimeRef.current = now;
      handleNext();
    } else if (deltaX < -25 || deltaY < -25) {
      lastWheelTimeRef.current = now;
      handlePrev();
    }
  };

  // Click handler: opens official credential link if center, or rotates to center if flank
  const handleCardClick = (cert: CertificateItem, index: number, isCenter: boolean) => {
    if (hasDraggedRef.current) return;
    if (isCenter) {
      window.open(cert.credentialUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-auto px-4 sm:px-8 py-6 z-20 overflow-hidden"
    >
      {/* ================= 1. SPATIAL COVERFLOW CAROUSEL STAGE ================= */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ perspective: '1200px' }}
        className="relative w-full max-w-6xl h-[440px] sm:h-[480px] md:h-[510px] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
      >
        {certificatesData.map((cert, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;

          // 3D Spatial Geometry: Center spotlight is at natural 1:1 scale (no pixel stretching/blur)
          let translateX = 0;
          let rotateY = 0;
          let translateZ = 0;
          let scale = 1;
          let opacity = 1;

          if (isCenter) {
            translateX = 0;
            rotateY = 0;
            translateZ = 80;
            scale = 1;
            opacity = 1;
          } else if (offset < 0) {
            // Left Flank (Pushed back, rotated, visibly smaller)
            translateX = offset * 210 - 100;
            rotateY = 32;
            translateZ = -120 - (absOffset - 1) * 50;
            scale = Math.max(0.55, 0.76 - (absOffset - 1) * 0.14);
            opacity = Math.max(0.15, 0.48 - (absOffset - 1) * 0.25);
          } else {
            // Right Flank (Pushed back, rotated, visibly smaller)
            translateX = offset * 210 + 100;
            rotateY = -32;
            translateZ = -120 - (absOffset - 1) * 50;
            scale = Math.max(0.55, 0.76 - (absOffset - 1) * 0.14);
            opacity = Math.max(0.15, 0.48 - (absOffset - 1) * 0.25);
          }

          const zIndex = Math.round(30 - absOffset * 10);
          const isClickable = absOffset <= 2;

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
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 24,
                mass: 1.1,
              }}
              style={{
                zIndex,
                transformStyle: 'preserve-3d',
                pointerEvents: isClickable ? 'auto' : 'none',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
              className="group absolute w-[320px] sm:w-[390px] md:w-[440px] h-[330px] sm:h-[370px] md:h-[400px] rounded-3xl p-2.5 sm:p-3 transition-all cursor-pointer select-none"
            >
              {/* Apple Frosted Glass Frame with Classical Gold Specular Accent */}
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
                <div className="relative w-full h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 border border-stone-200/50 dark:border-white/10 mb-2 flex-shrink-0">
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

                {/* Certificate Title (Razor-Sharp High-Legibility Typography) */}
                <div className="py-1">
                  <h3
                    title={cert.title}
                    className="font-sans text-xs sm:text-sm md:text-base font-semibold text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors leading-snug line-clamp-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                  >
                    {cert.title}
                  </h3>
                </div>

                {/* Bottom Action Footer: Click to Open Official Credential (Button removed, clean indicator) */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-sans font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-[#FFD88A] transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A] flex-shrink-0" />
                    <span>Official Credential</span>
                  </div>

                  {isCenter ? (
                    <div className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-amber-900 dark:text-[#FFD88A] group-hover:translate-x-0.5 transition-transform drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-sans font-medium text-stone-500 dark:text-stone-400">
                      Focus
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================= 2. NAVIGATION CONTROLS & STEP COUNTER ================= */}
      <div className="absolute bottom-6 sm:bottom-8 z-30 flex items-center gap-5">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          title="Previous Certificate"
          className="p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 backdrop-blur-2xl border border-white/70 dark:border-white/20 text-stone-900 dark:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 font-serif italic text-sm sm:text-base text-white tracking-widest">
          <span
            style={{
              textShadow: '0 1px 6px rgba(0,0,0,0.85)',
            }}
          >
            0{activeIndex + 1}
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

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={activeIndex === certificatesData.length - 1}
          title="Next Certificate"
          className="p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 backdrop-blur-2xl border border-white/70 dark:border-white/20 text-stone-900 dark:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  X,
  Sparkles,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';

export type CertificateCategory = 'all' | 'ai' | 'systems' | 'cloud';

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issuerBadgeColor: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  category: 'ai' | 'systems' | 'cloud';
  skills: string[];
  accentColor: string;
  description: string;
}

export const certificatesData: CertificateItem[] = [
  {
    id: 'deep-learning-specialization',
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI & Coursera',
    issuerBadgeColor: 'bg-[#0056D2]/15 text-[#0056D2] dark:text-[#5B96F7] border-[#0056D2]/30',
    issueDate: 'Oct 2024',
    credentialId: 'DLS-849204-AXEL',
    credentialUrl: 'https://coursera.org/verify/specialization/DLS-AXEL',
    category: 'ai',
    skills: ['PyTorch', 'Transformers', 'CNNs & ResNets', 'Optimization'],
    accentColor: '#3B82F6',
    description:
      'Mastery of foundational deep learning architectures, convolutional neural networks, sequence models, and multi-GPU hyperparameter tuning.',
  },
  {
    id: 'stanford-nlp-transformers',
    title: 'Natural Language Processing & LLMs',
    issuer: 'Stanford Online',
    issuerBadgeColor: 'bg-[#8C1515]/15 text-[#8C1515] dark:text-[#FF7D7D] border-[#8C1515]/30',
    issueDate: 'Jan 2025',
    credentialId: 'STAN-NLP-99214',
    credentialUrl: 'https://online.stanford.edu/verify/STAN-NLP-99214',
    category: 'ai',
    skills: ['Attention Mechanisms', 'BERT & GPT', 'Hugging Face', 'RLHF'],
    accentColor: '#EF4444',
    description:
      'Advanced semantic understanding, multi-head self-attention mechanics, transformer pre-training, and reinforcement learning from human feedback.',
  },
  {
    id: 'aws-ml-specialty',
    title: 'AWS Certified Machine Learning Specialty',
    issuer: 'Amazon Web Services',
    issuerBadgeColor: 'bg-[#FF9900]/15 text-[#D97706] dark:text-[#FBBF24] border-[#FF9900]/30',
    issueDate: 'Aug 2024',
    credentialId: 'AWS-MLS-49102X',
    credentialUrl: 'https://aws.amazon.com/verification/AWS-MLS-49102X',
    category: 'cloud',
    skills: ['SageMaker', 'Distributed Training', 'Feature Store', 'Model Monitor'],
    accentColor: '#F59E0B',
    description:
      'Production-grade cloud machine learning pipelines, scalable model training, endpoint latency optimization, and automated drift detection.',
  },
  {
    id: 'nvidia-cuda-parallel',
    title: 'Accelerated Computing with CUDA C/C++',
    issuer: 'NVIDIA Deep Learning Institute',
    issuerBadgeColor: 'bg-[#76B900]/15 text-[#4D7C0F] dark:text-[#84CC16] border-[#76B900]/30',
    issueDate: 'May 2024',
    credentialId: 'NV-DLI-77319A',
    credentialUrl: 'https://learn.nvidia.com/certificates/NV-DLI-77319A',
    category: 'systems',
    skills: ['CUDA Kernels', 'Shared Memory', 'NCCL', 'Parallel Reduction'],
    accentColor: '#10B981',
    description:
      'Hardware-level GPU acceleration, thread block tiling, memory coalescing, and inter-GPU communication primitives for massive parallel workloads.',
  },
  {
    id: 'apple-spatial-vision',
    title: 'Spatial Computing & CoreML Systems',
    issuer: 'Apple Developer Academy',
    issuerBadgeColor: 'bg-stone-800/10 dark:bg-white/10 text-stone-900 dark:text-stone-100 border-stone-400/30',
    issueDate: 'Nov 2024',
    credentialId: 'ADA-VISIONOS-2024',
    credentialUrl: 'https://developer.apple.com/academies/verify/ADA-VISIONOS-2024',
    category: 'systems',
    skills: ['VisionOS', 'CoreML Quantization', 'Metal Shaders', '3D Pose Tracking'],
    accentColor: '#8B5CF6',
    description:
      'Immersive spatial computing architectures, on-device neural engine inference, custom Metal compute pipelines, and real-time kinematic tracking.',
  },
  {
    id: 'scholarly-research-ai',
    title: 'Distinction in Artificial Intelligence Research',
    issuer: 'Binus University & IEEE Student Branch',
    issuerBadgeColor: 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FCD34D] border-[#D97706]/30',
    issueDate: 'Dec 2024',
    credentialId: 'BINUS-RES-AI-2024',
    credentialUrl: 'https://binus.ac.id/research/verify/BINUS-RES-AI-2024',
    category: 'ai',
    skills: ['Academic Research', 'Bioinformatics', 'Peer Review', 'Algorithmic Optimization'],
    accentColor: '#D97706',
    description:
      'Scholarly recognition for research contributions in computational genomics, deep biomarker classification, and high-performance biomedical modeling.',
  },
];

interface CertificatesCoverflowProps {
  onReachTop?: () => void;
  onReachRight?: () => void;
}

export function CertificatesCoverflow({ onReachTop, onReachRight }: CertificatesCoverflowProps) {
  const [selectedCategory, setSelectedCategory] = useState<CertificateCategory>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspectItem, setInspectItem] = useState<CertificateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered dataset
  const filteredCerts = certificatesData.filter((cert) =>
    selectedCategory === 'all' ? true : cert.category === selectedCategory
  );

  // Keep active index in range when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  const activeCert = filteredCerts[activeIndex] || filteredCerts[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < filteredCerts.length - 1 ? prev + 1 : prev));
  }, [filteredCerts.length]);

  // Keyboard arrow listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectItem) {
        if (e.key === 'Escape') setInspectItem(null);
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, inspectItem]);

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

    // Horizontal wheel or vertical wheel
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;

    // Boundary handoff when user wheels past ends
    if (deltaY < -35 && activeIndex === 0) {
      lastWheelTimeRef.current = now;
      onReachTop?.();
      return;
    }
    if ((deltaY > 35 || deltaX > 35) && activeIndex === filteredCerts.length - 1) {
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

  const handleCopyId = (idText: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-full flex flex-col items-center justify-center select-none pointer-events-auto px-4 sm:px-8 py-6 z-20 overflow-hidden"
    >
      {/* ================= 1. CATEGORY FILTER PILLS ================= */}
      <div className="absolute top-6 sm:top-8 z-30 flex items-center justify-center">
        <div className="flex items-center p-1 rounded-full bg-white/40 dark:bg-[#161412]/60 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_8px_32px_-6px_rgba(40,30,20,0.1)] gap-1">
          {[
            { id: 'all', label: 'All Credentials' },
            { id: 'ai', label: 'AI & Research' },
            { id: 'systems', label: 'Systems & CUDA' },
            { id: 'cloud', label: 'Cloud' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CertificateCategory)}
                className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition-colors cursor-pointer ${
                  isActive
                    ? 'text-stone-950 dark:text-stone-100 font-semibold'
                    : 'text-stone-700/80 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCertFilterPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                    className="absolute inset-0 rounded-full bg-white/70 dark:bg-white/20 border border-white/80 dark:border-white/25 shadow-sm"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 2. SPATIAL COVERFLOW CAROUSEL STAGE ================= */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ perspective: '1200px' }}
        className="relative w-full max-w-5xl h-[380px] sm:h-[430px] md:h-[460px] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
      >
        {filteredCerts.map((cert, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;

          // 3D Spatial Geometry
          let translateX = 0;
          let rotateY = 0;
          let translateZ = 0;
          let scale = 1;
          let opacity = 1;

          if (isCenter) {
            translateX = 0;
            rotateY = 0;
            translateZ = 60;
            scale = 1;
            opacity = 1;
          } else if (offset < 0) {
            // Left Flank
            translateX = offset * 180 - 70;
            rotateY = 28;
            translateZ = -90 - absOffset * 40;
            scale = Math.max(0.68, 1 - absOffset * 0.12);
            opacity = Math.max(0.2, 1 - absOffset * 0.35);
          } else {
            // Right Flank
            translateX = offset * 180 + 70;
            rotateY = -28;
            translateZ = -90 - absOffset * 40;
            scale = Math.max(0.68, 1 - absOffset * 0.12);
            opacity = Math.max(0.2, 1 - absOffset * 0.35);
          }

          const zIndex = Math.round(30 - absOffset * 10);
          const isClickable = absOffset <= 2;

          return (
            <motion.div
              key={cert.id}
              onClick={() => {
                if (hasDraggedRef.current) return;
                if (isCenter) {
                  setInspectItem(cert);
                } else if (isClickable) {
                  setActiveIndex(index);
                }
              }}
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
              }}
              className="absolute w-[290px] sm:w-[350px] md:w-[410px] h-[250px] sm:h-[280px] md:h-[310px] rounded-3xl p-3 sm:p-4 transition-colors cursor-pointer select-none"
            >
              {/* Apple Frosted Glass Frame with Classical Gold Specular Accent */}
              <div
                className={`w-full h-full rounded-2xl flex flex-col justify-between p-3.5 sm:p-4.5 border transition-all duration-300 ${
                  isCenter
                    ? 'bg-[#FAF8F5]/85 dark:bg-[#161412]/85 backdrop-blur-2xl border-white/80 dark:border-white/25 shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.9),0_24px_50px_-10px_rgba(0,0,0,0.35)]'
                    : 'bg-[#FAF8F5]/60 dark:bg-[#161412]/60 backdrop-blur-xl border-white/50 dark:border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:border-white/80'
                }`}
              >
                {/* Certificate Header: Issuer Badge & Date */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-white/10 pb-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-semibold border ${cert.issuerBadgeColor}`}
                  >
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[170px]">{cert.issuer}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-serif italic text-stone-600 dark:text-stone-400">
                    <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                    <span>{cert.issueDate}</span>
                  </div>
                </div>

                {/* Certificate Title & Description */}
                <div className="space-y-1.5 py-1">
                  <h3
                    className="font-serif italic text-base sm:text-lg md:text-xl font-semibold text-stone-950 dark:text-stone-100 line-clamp-2 leading-snug"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {cert.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-sans text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cert.skills.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] sm:text-[10.5px] font-sans text-stone-800 dark:text-stone-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {cert.skills.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-sans text-stone-500 dark:text-stone-400">
                      +{cert.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Bottom Footer: Verification Link & QuickLook hint */}
                <div className="pt-2.5 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                    <span>ID:</span>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">{cert.credentialId}</span>
                  </div>

                  {isCenter ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(cert);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-800 dark:bg-amber-700 hover:bg-amber-900 text-white text-[11px] font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>Inspect</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-serif italic text-stone-500 dark:text-stone-400">
                      Click to focus
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ================= 3. NAVIGATION CONTROLS & STEP COUNTER ================= */}
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
            0{filteredCerts.length}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={activeIndex === filteredCerts.length - 1}
          title="Next Certificate"
          className="p-2.5 rounded-full bg-white/50 dark:bg-[#161412]/60 hover:bg-white/75 dark:hover:bg-[#161412]/80 active:bg-white/90 backdrop-blur-2xl border border-white/70 dark:border-white/20 text-stone-900 dark:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ================= 4. QUICKLOOK INSPECT MODAL (macOS Style) ================= */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-text">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F5]/95 dark:bg-[#1A1816]/95 backdrop-blur-2xl border border-white/80 dark:border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 z-10"
            >
              {/* Header Titlebar */}
              <div className="h-12 px-5 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 bg-white/40 dark:bg-stone-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>

                <div className="flex items-center gap-2 font-serif italic text-sm font-semibold">
                  <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Credential Inspector</span>
                </div>

                <button
                  onClick={() => setInspectItem(null)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Title & Issuer */}
                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold border ${inspectItem.issuerBadgeColor}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{inspectItem.issuer}</span>
                  </span>
                  <h2 className="font-serif italic text-2xl sm:text-3xl font-semibold leading-tight text-stone-950 dark:text-stone-100">
                    {inspectItem.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-sans text-stone-600 dark:text-stone-400 leading-relaxed pt-1">
                    {inspectItem.description}
                  </p>
                </div>

                {/* Skills Grid */}
                <div className="space-y-2 border-t border-stone-200/60 dark:border-stone-800 pt-4">
                  <label className="text-xs font-sans uppercase tracking-widest text-stone-500 font-semibold">
                    Competencies & Tooling
                  </label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {inspectItem.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-sans font-medium text-stone-900 dark:text-stone-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Credential Verification Bar */}
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                      Credential Identification
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                        {inspectItem.credentialId}
                      </span>
                      <button
                        onClick={() => handleCopyId(inspectItem.credentialId)}
                        title="Copy ID"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 transition-colors cursor-pointer"
                      >
                        {copiedId === inspectItem.credentialId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <a
                    href={inspectItem.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-xs font-sans font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

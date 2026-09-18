import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Compass } from 'lucide-react';

export default function App() {
  const [isImmersive, setIsImmersive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Mouse tilt physics for organic Framer-like feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 140, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-16, 16]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ['20%', '80%']);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ['20%', '80%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) - 0.5;
    const y = (e.clientY / innerHeight) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Synthesized Greek harp / ambient water drone via Web Audio API (Zero external file dependencies)
  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
          setIsAudioPlaying(false);
        }, 500);
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Harmonic chords (Root F# pentatonic ancient Greek Dorian resonance)
      const freqs = [185.0, 220.0, 277.18, 370.0, 440.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle organic vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.18 + idx * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setIsAudioPlaying(true);
    } catch {
      // AudioContext fallback if blocked
      setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full bg-[#F7F5F0] text-[#1C1917] overflow-hidden flex flex-col justify-between selection:bg-[#1C1917] selection:text-[#F7F5F0]"
    >
      {/* Background Greek Marble Subtle Texture & Vignette */}
      <div className="pointer-events-none absolute inset-0 greek-canvas-grain opacity-60 z-0" />
      
      {/* Soft Ambient Golden Light Radiating from Artwork */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-tr from-[#A68042]/10 via-[#7D8F69]/10 to-transparent blur-3xl rounded-full z-0" />

      {/* Top Header - Ultra Clean & Minimal */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <span className="font-classic text-xs tracking-[0.35em] text-[#1C1917] font-semibold">
            TANTALIZE
          </span>
          <span className="text-[10px] tracking-[0.2em] text-[#78716C] uppercase hidden sm:inline-block">
            / Vol. I
          </span>
        </motion.div>

        {/* Center Pill - Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1C1917]/10 bg-[#FFFFFF]/60 backdrop-blur-md text-[11px] tracking-[0.18em] text-[#57534E]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#94723E] animate-pulse" />
          <span>MT. SIPYLUS - THE ETERNAL REACH</span>
        </motion.div>

        {/* Right Controls - Minimal Actions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <button
            onClick={toggleAudio}
            title={isAudioPlaying ? 'Mute ambient resonance' : 'Play ambient resonance'}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1C1917]/10 bg-[#FFFFFF]/50 hover:bg-[#FFFFFF] hover:border-[#1C1917]/25 transition-all text-xs tracking-[0.15em] text-[#1C1917]"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#94723E]" />
                <span className="hidden sm:inline text-[10px] uppercase font-medium">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#78716C]" />
                <span className="hidden sm:inline text-[10px] uppercase font-medium">Sound Off</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsImmersive(!isImmersive)}
            title={isImmersive ? 'Framed Gallery View' : 'Full Canvas View'}
            className="p-2 rounded-full border border-[#1C1917]/10 bg-[#FFFFFF]/50 hover:bg-[#FFFFFF] hover:border-[#1C1917]/25 transition-all text-[#1C1917]"
          >
            {isImmersive ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </motion.div>
      </header>

      {/* Main Canvas Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-2">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Subtle Poetic Header Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-6 pointer-events-none select-none"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78716C] mb-2">
              Greek Mythology
            </p>
            <h1 className="font-serif italic text-4xl sm:text-6xl md:text-7xl font-light text-[#1C1917] tracking-tight leading-none">
              The Agony of Tantalus
            </h1>
          </motion.div>

          {/* Interactive Artwork Frame with 3D Mouse Parallax & Breathing Movement */}
          <div
            className="relative perspective-[1200px]"
            onMouseEnter={() => setIsHovered(true)}
          >
            {/* Smooth Floating Container */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateZ: [0, 0.3, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
              style={{
                rotateX: isImmersive ? 0 : rotateX,
                rotateY: isImmersive ? 0 : rotateY,
                x: isImmersive ? 0 : translateX,
                y: isImmersive ? 0 : translateY,
                transformStyle: 'preserve-3d',
              }}
              className={`relative transition-all duration-700 ease-out cursor-grab active:cursor-grabbing ${
                isImmersive
                  ? 'fixed inset-4 sm:inset-12 z-50 flex items-center justify-center'
                  : 'w-[90vw] sm:w-[620px] md:w-[740px] aspect-[4/3] max-h-[64vh]'
              }`}
            >
              {/* Card Canvas */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_24px_64px_-16px_rgba(44,38,30,0.18)] border border-[#1C1917]/10 bg-[#FAF9F5] group">
                
                {/* The Tantalus Masterpiece Image */}
                <motion.img
                  src="/tantalus.png"
                  alt="Tantalus reaching for fruit in water"
                  className="w-full h-full object-cover object-center select-none pointer-events-none transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Subtle Lighting Glare Follower on Mouse Move */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay"
                  style={{
                    background: `radial-gradient(circle 360px at ${glareX} ${glareY}, rgba(255,255,255,0.7), transparent 80%)`,
                  }}
                />

                {/* Floating Interactive Focal Point: The Fruit out of reach */}
                <div className="absolute top-[18%] right-[36%] pointer-events-auto">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="relative flex items-center group/point"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF9F5] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FAF9F5]/90 border border-[#1C1917]/30 shadow-sm" />
                    </span>
                    <div className="ml-2.5 px-2.5 py-1 rounded-full bg-[#FAF9F5]/90 backdrop-blur-md border border-[#1C1917]/10 opacity-0 group-hover/point:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover/point:translate-x-0 shadow-sm whitespace-nowrap">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#1C1917]">
                        Unreachable Desires
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Minimalist Corner Badge */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3 py-1.5 rounded-lg bg-[#FAF9F5]/85 backdrop-blur-md border border-[#1C1917]/10 text-[10px] tracking-[0.2em] text-[#1C1917] font-classic select-none">
                  ATHENS - C. 1890
                </div>

                {/* Exit button when in immersive mode */}
                {isImmersive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImmersive(false);
                    }}
                    className="absolute top-6 right-6 p-3 rounded-full bg-[#FAF9F5]/90 border border-[#1C1917]/15 text-[#1C1917] hover:bg-[#FFFFFF] transition-all shadow-lg"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Under-canvas Caption & Perspective hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center select-none"
          >
            <p className="font-serif italic text-base sm:text-lg text-[#57534E]">
              "Within sight, forever out of grasp."
            </p>
            <span className="hidden sm:inline text-[#D6D3D1]">-</span>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#78716C]">
              <Compass className="w-3 h-3 text-[#94723E]" />
              <span>Shift cursor to rotate perspective</span>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Bottom Bar - Editorial Clean Typography */}
      <footer className="relative z-20 w-full px-6 sm:px-12 py-6 border-t border-[#1C1917]/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-[0.25em] uppercase text-[#78716C]">
        <div>
          <span>tantalize / noun & verb</span>
        </div>
        
        <div className="text-center font-normal lowercase tracking-[0.08em] text-[11px] text-[#57534E] max-w-md normal-case">
          to torment with the sight of something desired but constantly kept just beyond reach.
        </div>

        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#94723E]" />
          <span>Designed with Framer Motion</span>
        </div>
      </footer>
    </div>
  );
}

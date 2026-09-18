import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Mouse parallax motion physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax shifts for background image
  const imgX = useTransform(smoothX, [-0.5, 0.5], [24, -24]);
  const imgY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const imgRotate = useTransform(smoothX, [-0.5, 0.5], [-0.8, 0.8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Minimal ambient sound generator (Web Audio API - Greek lyre & gentle water resonance)
  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.6);
        setTimeout(() => setIsAudioPlaying(false), 600);
      }
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 1.5);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Ancient Dorian warm harmonic drone (D, A, E)
      const freqs = [146.83, 220.0, 329.63, 440.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + idx * 0.04, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.07 / freqs.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setIsAudioPlaying(true);
    } catch {
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
      className="relative h-screen w-screen bg-[#F7F5F0] text-[#1C1917] overflow-hidden select-none p-3 sm:p-5 flex flex-col justify-between"
    >
      {/* Background Frame / Greek Canvas Container */}
      <div className="absolute inset-3 sm:inset-5 rounded-2xl overflow-hidden shadow-[0_16px_50px_-12px_rgba(40,32,20,0.14)] border border-[#1C1917]/10 bg-[#FAF9F5]">
        
        {/* Living Background Image with Ambient Breathing & Smooth Parallax */}
        <motion.div
          animate={{
            scale: [1.05, 1.08, 1.05],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          style={{
            x: imgX,
            y: imgY,
            rotate: imgRotate,
          }}
          className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)] pointer-events-none"
        >
          <img
            src="/new.png"
            alt="Tantalize"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Ultra Soft Warm Vignette & Sunlight Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1917]/35 via-transparent to-[#1C1917]/25" />
        <div className="pointer-events-none absolute inset-0 bg-[#F7F5F0]/10 mix-blend-soft-light" />
      </div>

      {/* Top Header - Ultra Minimal */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <span className="font-classic text-xs tracking-[0.4em] uppercase text-white drop-shadow-sm font-medium">
            TANTALIZE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
        >
          <button
            onClick={toggleAudio}
            title={isAudioPlaying ? 'Mute ambience' : 'Play ambience'}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/35 backdrop-blur-md border border-white/15 text-white transition-all text-[10px] tracking-[0.2em] uppercase"
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Mute</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/70" />
                <span className="hidden sm:inline">Sound</span>
              </>
            )}
          </button>
        </motion.div>
      </header>

      {/* Center - Quiet & Unobstructed */}
      <main className="relative z-10 flex-1 pointer-events-none" />

      {/* Bottom Footer - Single Line Minimal Whisper */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-end justify-between text-white/80 text-[10px] tracking-[0.3em] uppercase drop-shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          <p className="font-serif italic lowercase tracking-[0.05em] text-sm sm:text-base text-white/90">
            forever out of reach
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="text-right text-white/60 tracking-[0.25em]"
        >
          <span>38°36'N 27°26'E</span>
        </motion.div>
      </footer>
    </div>
  );
}

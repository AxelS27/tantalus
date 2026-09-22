import { memo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  MessageCircle,
  ArrowUpRight,
  MapPin,
  Clock,
  Check,
} from 'lucide-react';
import Footer from './common/Footer';

const XIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
  </svg>
);

interface SocialChannel {
  name: string;
  icon: any;
  url: string;
  handle: string;
  category: string;
  brandColor: string;
}

const socialChannels: SocialChannel[] = [
  {
    name: 'Email',
    icon: Mail,
    url: 'mailto:farrellaxel2006@gmail.com',
    handle: 'farrellaxel2006@gmail.com',
    category: 'Direct Mail',
    brandColor: 'hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-[#FFD88A]',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://www.linkedin.com/in/axels27',
    handle: 'in/axels27',
    category: 'Professional',
    brandColor: 'hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400',
  },
  {
    name: 'GitHub',
    icon: Github,
    url: 'https://github.com/AxelS27',
    handle: '@AxelS27',
    category: 'Code & Repos',
    brandColor: 'hover:border-stone-500/50 hover:text-stone-950 dark:hover:text-white',
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://wa.me/liemaxels',
    handle: '@liemaxels',
    category: 'Instant Chat',
    brandColor: 'hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/liemaxels',
    handle: '@liemaxels',
    category: 'Visual & Life',
    brandColor: 'hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-400',
  },
  {
    name: 'X',
    icon: XIcon,
    url: 'https://x.com/liemaxels',
    handle: '@liemaxels',
    category: 'Thoughts & Tech',
    brandColor: 'hover:border-stone-500/50 hover:text-stone-950 dark:hover:text-white',
  },
];

interface ConnectHubProps {
  isActive?: boolean;
  onReachTop?: () => void;
}

export const ConnectHub = memo(function ConnectHub({
  isActive = true,
  onReachTop,
}: ConnectHubProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef<boolean>(true);
  const arrivedAtTopTimeRef = useRef<number>(Date.now());
  const lastHandoffTimeRef = useRef<number>(0);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [wibTime, setWibTime] = useState<string>('');

  // Live ticking Jakarta / WIB time (UTC+7)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setWibTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChannelClick = (
    e: React.MouseEvent,
    channel: SocialChannel,
  ) => {
    e.preventDefault();

    // Copy handle / email to clipboard
    const textToCopy = channel.name === 'Email' ? channel.handle : channel.url;
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedName(channel.name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch {}

    // Open target
    if (channel.name === 'Email') {
      window.location.href = channel.url;
    } else {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop <= 2) {
      if (!isAtTopRef.current) {
        isAtTopRef.current = true;
        arrivedAtTopTimeRef.current = Date.now();
      }
    } else {
      isAtTopRef.current = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop <= 2 && e.deltaY < -30) {
      const now = Date.now();
      if (now - arrivedAtTopTimeRef.current < 500) return;
      if (now - lastHandoffTimeRef.current > 1200) {
        lastHandoffTimeRef.current = now;
        onReachTop?.();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full overflow-y-auto overflow-x-hidden select-text scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* ================= 1. CONNECT HERO VIEWPORT (Full Screen) ================= */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-16 select-none">
        {/* Fluid Floating Content Rig (No Outer Card) */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl sm:max-w-3xl flex flex-col items-center justify-center space-y-5 sm:space-y-7"
        >
          {/* Header Block: Editorial Title */}
          <div className="text-center max-w-xl mx-auto">
            <h2
              className="font-serif italic text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white"
              style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 8px 40px rgba(0,0,0,0.65)' }}
            >
              Connect With Me
            </h2>
          </div>

          {/* 2x3 Grid of Floating Frosted Glass Social Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
            {socialChannels.map((channel) => {
              const isCopied = copiedName === channel.name;
              const Icon = channel.icon;

              return (
                <motion.a
                  key={channel.name}
                  href={channel.url}
                  onClick={(e) => handleChannelClick(e, channel)}
                  whileHover={{
                    scale: 1.08,
                    y: -5,
                    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                  }}
                  whileTap={{
                    scale: 0.96,
                    y: 0,
                    transition: { duration: 0.1 },
                  }}
                  className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/45 dark:bg-[#161412]/60 hover:bg-white/65 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 hover:border-white/95 dark:hover:border-white/40 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9),0_8px_32px_-4px_rgba(40,30,20,0.14)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,1),0_16px_40px_-4px_rgba(40,30,20,0.22)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_18px_44px_-4px_rgba(0,0,0,0.85)] cursor-pointer no-underline text-stone-900 dark:text-white transition-colors duration-150 overflow-hidden z-10 hover:z-30"
                >
                  {/* Specular Top Light Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150 rounded-t-2xl" />

                  {/* Ambient Glass Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl" />

                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-white/80 dark:border-white/20 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 group-hover:border-amber-700/60 dark:group-hover:border-[#FFD88A]/60 transition-all text-amber-800 dark:text-[#FFD88A]">
                      <Icon size={19} className="shrink-0" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs sm:text-sm font-sans font-bold text-stone-950 dark:text-white leading-tight">
                        {channel.name}
                      </span>
                      <span
                        className="text-[11px] sm:text-xs font-mono text-stone-700 dark:text-stone-300 truncate pt-0.5"
                      >
                        {isCopied ? 'Copied to Clipboard!' : channel.handle}
                      </span>
                    </div>
                  </div>

                  {/* Right: Feedback or Arrow */}
                  <div className="shrink-0 ml-2 relative z-10">
                    {isCopied ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/40">
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-stone-500 dark:text-stone-300 group-hover:text-amber-800 dark:group-hover:text-[#FFD88A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-70 group-hover:opacity-100" />
                    )}
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Bottom: Location & Timezone Clean Text */}
          <div
            className="pt-2 flex items-center justify-center gap-3 text-xs sm:text-sm font-serif italic text-stone-200/90"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95)' }}
          >
            <div className="flex items-center gap-1.5 text-[#FFD88A] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#FFD88A]" />
              <span>Indonesia, Jakarta</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Clock className="w-3.5 h-3.5 text-[#FFD88A]" />
              <span className="font-mono">{wibTime ? `${wibTime} (GMT+7)` : 'GMT+7'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= 2. EDITORIAL PAGE FOOTER ================= */}
      <Footer />
    </div>
  );
});

export default ConnectHub;

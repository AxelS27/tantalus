import { memo, useState, useEffect } from 'react';
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
    name: 'X (Twitter)',
    icon: XIcon,
    url: 'https://x.com/liemaxels',
    handle: '@liemaxels',
    category: 'Thoughts & Tech',
    brandColor: 'hover:border-stone-500/50 hover:text-stone-950 dark:hover:text-white',
  },
];

interface ConnectHubProps {
  isActive?: boolean;
}

export const ConnectHub = memo(function ConnectHub({
  isActive = true,
}: ConnectHubProps) {
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

  return (
    <div
      aria-hidden={!isActive}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none px-4 sm:px-6 md:px-8 py-10 z-20 overflow-hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Centered Apple Frosted Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl sm:max-w-3xl rounded-3xl sm:rounded-[36px] bg-white/50 dark:bg-[#141210]/80 backdrop-blur-3xl backdrop-saturate-[180%] border border-white/75 dark:border-white/20 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.95),0_24px_80px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_24px_80px_rgba(0,0,0,0.65)] p-6 sm:p-10 md:p-12 space-y-8 text-stone-900 dark:text-stone-100 overflow-hidden"
      >
        {/* Specular Top Light Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 dark:via-white/35 to-transparent opacity-80 rounded-t-3xl sm:rounded-t-[36px]" />

        {/* Header Block: Editorial Title & Identity */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h2
            className="font-serif italic text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-950 dark:text-white"
            style={{ textShadow: '0 1px 4px rgba(255,255,255,0.8), 0 2px 14px rgba(0,0,0,0.06)' }}
          >
            Connect With Me
          </h2>
          <p className="font-sans text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
            Open for AI research inquiries, software engineering collaborations, and professional discussions.
          </p>

          {/* Location & Timezone Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-sans text-xs font-medium text-stone-700 dark:text-stone-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/15 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A]" />
              <span>Indonesia</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/15 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-[#FFD88A]" />
              <span className="font-mono">{wibTime || 'WIB (UTC+7)'}</span>
            </div>
          </div>
        </div>

        {/* 2x3 Grid of Social & Messaging Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {socialChannels.map((channel, index) => {
            const isCopied = copiedName === channel.name;
            const Icon = channel.icon;

            return (
              <motion.a
                key={channel.name}
                href={channel.url}
                onClick={(e) => handleChannelClick(e, channel)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/45 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-xl border border-white/65 dark:border-white/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none cursor-pointer no-underline text-inherit transition-all duration-200 ${channel.brandColor}`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={19} className="shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 leading-none mb-1">
                      {channel.category}
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {isCopied ? 'Copied to Clipboard!' : channel.handle}
                    </span>
                  </div>
                </div>

                {/* Right: Feedback or Arrow */}
                <div className="shrink-0 ml-2">
                  {isCopied ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-60 group-hover:opacity-100" />
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
});

export default ConnectHub;

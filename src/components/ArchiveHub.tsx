import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Music,
  Film,
  BookOpen,
  Settings,
  Share2,
  ArrowUpRight,
  Palette,
  Volume2,
  Sliders,
  Info,
  X,
  Minus,
  Check,
  ChevronUp,
  ChevronDown,
  SkipForward,
} from 'lucide-react';
import Footer from './common/Footer';
import { MUSIC_TRACKS, type MusicTrackId } from '../lib/music';
import type { MusicStatus } from '../hooks/useBackgroundMusic';
import {
  type PortfolioSettings,
  DEFAULT_SETTINGS,
  getSavedSettings,
} from '../lib/settings';
import { getPrefetchProps, type PrefetchSectionKey } from '../lib/prefetch';

export type { PortfolioSettings };
export { DEFAULT_SETTINGS, getSavedSettings };

// macOS Genie Effect 10-point polygon:
// In the open state, all points align with the rectangular window bounds.
const GENIE_REST_POLYGON =
  'polygon(0% 0%, 100% 0%, 100% 25%, 100% 60%, 100% 85%, 100% 100%, 0% 100%, 0% 85%, 0% 60%, 0% 25%)';

// In the minimized / shrunken state, the bottom tapers smoothly into a 1% nozzle,
// creating the authentic macOS curved liquid funnel without any fade in or fade out.
const GENIE_SHRUNK_POLYGON =
  'polygon(16% 0%, 84% 0%, 74% 25%, 62% 60%, 54% 85%, 50.5% 100%, 49.5% 100%, 46% 85%, 38% 60%, 26% 25%)';

export type ArchiveAppId =
  | 'certificates'
  | 'repertoire'
  | 'watchlist'
  | 'storybook'
  | 'connect'
  | 'settings';

interface ArchiveAppItem {
  id: ArchiveAppId;
  name: string;
  route: string;
  icon: typeof Award;
}

const launchpadApps: ArchiveAppItem[] = [
  {
    id: 'certificates',
    name: 'Certificates',
    route: '#certificates',
    icon: Award,
  },
  {
    id: 'repertoire',
    name: 'Repertoire',
    route: '#archive/repertoire',
    icon: Music,
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    route: '#archive/watchlist',
    icon: Film,
  },
  {
    id: 'storybook',
    name: 'Story Book',
    route: '#archive/storybook',
    icon: BookOpen,
  },
  {
    id: 'connect',
    name: 'Connect',
    route: '#connect',
    icon: Share2,
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '#archive/settings',
    icon: Settings,
  },
];

interface ArchiveHubProps {
  isActive?: boolean;
  onReachStart?: () => void;
  onAppSelect?: (appId: ArchiveAppId) => void;
  settings?: PortfolioSettings;
  onUpdateSettings?: (newSettings: Partial<PortfolioSettings>) => void;
  musicStatus?: MusicStatus;
  currentTrackId?: MusicTrackId | null;
  onSkipTrack?: () => void;
  onRetryPlayback?: () => void;
}

export const ArchiveHub = memo(function ArchiveHub({
  isActive = true,
  onReachStart,
  onAppSelect,
  settings: externalSettings,
  onUpdateSettings,
  musicStatus = 'off',
  currentTrackId = null,
  onSkipTrack,
  onRetryPlayback,
}: ArchiveHubProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef<boolean>(true);
  const arrivedAtTopTimeRef = useRef<number>(Date.now());
  const lastHandoffTimeRef = useRef<number>(0);

  // Settings State Management (Fallback to local if not provided by App)
  const [internalSettings, setInternalSettings] = useState<PortfolioSettings>(getSavedSettings);
  const activeSettings = externalSettings ?? internalSettings;

  const handleSettingChange = (patch: Partial<PortfolioSettings>) => {
    if (onUpdateSettings) {
      onUpdateSettings(patch);
    } else {
      setInternalSettings((prev) => {
        const updated = { ...prev, ...patch };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tantalize_portfolio_settings', JSON.stringify(updated));
          } catch {}
          if (patch.theme) {
            document.documentElement.classList.toggle('dark', patch.theme === 'dark');
          }
        }
        return updated;
      });
    }
  };

  const moveTrack = (index: number, direction: -1 | 1) => {
    const order = [...activeSettings.musicOrder];
    const destination = index + direction;
    if (destination < 0 || destination >= order.length) return;
    [order[index], order[destination]] = [order[destination], order[index]];
    handleSettingChange({ musicOrder: order });
  };

  // GitHub Commit Info for About Tab
  const [githubInfo, setGithubInfo] = useState<{
    date: string;
    sha: string;
    message: string;
    url: string;
  } | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const hasRequestedGithubRef = useRef(false);

  useEffect(() => {
    if (!isActive || hasRequestedGithubRef.current) return;

    try {
      const cached = sessionStorage.getItem('tantalize_latest_commit');
      if (cached) {
        setGithubInfo(JSON.parse(cached));
        hasRequestedGithubRef.current = true;
        return;
      }
    } catch {
      // Fetch normally when storage is unavailable or invalid.
    }

    hasRequestedGithubRef.current = true;
    let isMounted = true;
    let requestSettled = false;
    setIsLoadingGithub(true);
    fetch('https://api.github.com/repos/AxelS27/tantalus/commits?per_page=1')
      .then((res) => {
        if (!res.ok) throw new Error('GitHub API response not ok');
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !Array.isArray(data) || !data[0]) return;
        const commit = data[0];
        const rawDate = commit.commit?.committer?.date || commit.commit?.author?.date;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Sep 18, 2026';
        const info = {
          date: formattedDate,
          sha: commit.sha ? commit.sha.slice(0, 7) : '6394653',
          message: commit.commit?.message?.split('\n')[0] || 'feat: add interactive 3D cube projects grid',
          url: commit.html_url || 'https://github.com/AxelS27/tantalus',
        };
        setGithubInfo(info);
        try {
          sessionStorage.setItem('tantalize_latest_commit', JSON.stringify(info));
        } catch {}
      })
      .catch(() => {
        if (!isMounted) return;
        const fallbackInfo = {
          date: 'Sep 18, 2026',
          sha: '6394653',
          message: 'feat: add interactive 3D cube projects grid, frosted glass cards, and timeline enhancements',
          url: 'https://github.com/AxelS27/tantalus',
        };
        setGithubInfo(fallbackInfo);
        try {
          sessionStorage.setItem('tantalize_latest_commit', JSON.stringify(fallbackInfo));
        } catch {}
      })
      .finally(() => {
        requestSettled = true;
        if (isMounted) setIsLoadingGithub(false);
      });

    return () => {
      isMounted = false;
      if (!requestSettled) hasRequestedGithubRef.current = false;
    };
  }, [isActive]);

  // Settings Modal State (Local popover, zero routing)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [suctionY, setSuctionY] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const isSm = window.innerWidth >= 640;
      const modalHeight = isSm ? 580 : 520;
      return window.innerHeight / 2 - modalHeight / 2 + 15;
    }
    return 280;
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState<'appearance' | 'audio' | 'motion' | 'about'>('about');

  // Anchor suction nozzle directly at the absolute bottom edge of the screen (bener-bener bawah screen)
  const updateSuctionPosition = () => {
    if (typeof window === 'undefined') return;
    const isSm = window.innerWidth >= 640;
    const modalHeight = isSm ? 580 : 520;
    // Window bottom at rest: (window.innerHeight / 2) + (modalHeight / 2)
    // To reach the absolute bottom edge of the screen:
    // deltaY = window.innerHeight - (window.innerHeight / 2 + modalHeight / 2) = window.innerHeight / 2 - modalHeight / 2
    const calculated = window.innerHeight / 2 - modalHeight / 2 + 15;
    setSuctionY(calculated);
  };

  const closeSettings = () => {
    updateSuctionPosition();
    setIsSettingsOpen(false);
    if (window.location.hash.includes('settings')) {
      window.history.replaceState(null, '', '#archive');
    }
  };

  // Sync suction coordinate on resize and scroll
  useEffect(() => {
    if (!isActive) return;

    updateSuctionPosition();
    window.addEventListener('resize', updateSuctionPosition);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateSuctionPosition, { passive: true });
    }
    return () => {
      window.removeEventListener('resize', updateSuctionPosition);
      if (container) {
        container.removeEventListener('scroll', updateSuctionPosition);
      }
    };
  }, [isActive]);

  // Check if hash has settings or keyboard shortcut Cmd+,
  useEffect(() => {
    if (!isActive) return;

    if (typeof window !== 'undefined' && window.location.hash.includes('settings')) {
      updateSuctionPosition();
      setIsSettingsOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
      }
      // Standard macOS Settings shortcut (Cmd+, or Ctrl+,)
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        updateSuctionPosition();
        setIsSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isSettingsOpen]);

  const handleAppClick = (app: ArchiveAppItem) => {
    // Settings opens as a local macOS System Settings window without routing!
    if (app.id === 'settings') {
      updateSuctionPosition();
      setIsSettingsOpen(true);
      return;
    }

    if (onAppSelect) {
      onAppSelect(app.id);
      return;
    }

    window.location.hash = app.route;
  };

  // Track when the user arrives at the top so momentum from scrolling up doesn't accidentally trigger section handoff
  const handleScroll = () => {
    updateSuctionPosition();
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

  // Dedicated wheel listener: allows normal vertical page scroll.
  // Requires user to truly rest at the top before an intentional second scroll-up triggers handoff to Projects.
  const handleWheel = (e: React.WheelEvent) => {
    if (isSettingsOpen) return;
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop <= 2 && e.deltaY < -30) {
      const now = Date.now();

      // Buffer time: if user just arrived at the top within 500ms, ignore momentum
      if (now - arrivedAtTopTimeRef.current < 500) {
        return;
      }

      // Safe cooldown between section transitions
      if (now - lastHandoffTimeRef.current > 1200) {
        lastHandoffTimeRef.current = now;
        onReachStart?.();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onWheel={isActive ? handleWheel : undefined}
      aria-hidden={!isActive}
      className={`relative w-full h-full ${isSettingsOpen ? 'overflow-y-hidden' : 'overflow-y-auto'} overflow-x-hidden select-text scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-opacity duration-300 ${
        isActive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* ================= 1. LAUNCHPAD HERO VIEWPORT (Full Screen) ================= */}
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] md:py-16 select-none">
        {/* Compact phone launchpad; keep the wider desktop grid unchanged. */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-x-2 md:gap-x-8 gap-y-5 md:gap-y-7 justify-items-center w-full max-w-[340px] md:max-w-2xl">
          {launchpadApps.map((app, index) => {
            const IconComponent = app.icon;
            const colIndex = index % 4;
            const isLeftHalf = colIndex < 2; // Columns 1 & 2 part to the left!

            const partedX = isLeftHalf ? -190 : 190;
            const partedRotate = isLeftHalf ? -9 : 9;
            const prefetchProps =
              app.id === 'certificates' || app.id === 'connect' || app.id === 'repertoire' || app.id === 'watchlist'
                ? getPrefetchProps(app.id as PrefetchSectionKey)
                : {};

            return (
              <motion.div
                key={app.id}
                className="flex flex-col items-center"
                animate={{
                  x: isSettingsOpen ? partedX : 0,
                  y: isSettingsOpen ? 36 : 0,
                  rotate: isSettingsOpen ? partedRotate : 0,
                  opacity: isSettingsOpen ? 0.2 : 1,
                  scale: isSettingsOpen ? 0.88 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 24,
                  mass: 0.9,
                }}
              >
                {/* macOS Squircle Pure Apple VisionOS Frosted Glassmorphism Icon */}
                <motion.button
                  onClick={() => handleAppClick(app)}
                  {...prefetchProps}
                  disabled={isSettingsOpen}
                  whileHover={
                    activeSettings.interactiveTilt && !isSettingsOpen
                      ? {
                          scale: 1.10,
                          y: -5,
                          transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
                        }
                      : { scale: 1.02 }
                  }
                  whileTap={
                    activeSettings.interactiveTilt && !isSettingsOpen
                      ? { scale: 0.94, y: 0, transition: { duration: 0.1 } }
                      : { scale: 0.98 }
                  }
                  className="glass-surface group relative w-16 h-16 md:w-22 md:h-22 rounded-[20px] md:rounded-[26px] bg-white/45 dark:bg-[#161412]/60 hover:bg-white/65 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/60 dark:border-white/20 hover:border-white/95 dark:hover:border-white/40 shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,0.9),0_8px_24px_-4px_rgba(40,30,20,0.14)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1.5px_1.5px_0_rgba(255,255,255,1),0_16px_40px_-4px_rgba(40,30,20,0.22)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_18px_44px_-4px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 select-none overflow-hidden"
                >
                  {/* Specular Top Light Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-150" />

                  {/* Subtle Ambient Glass Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                  {/* Centered App Icon with Crisp Drop-Shadow */}
                  <IconComponent className="relative z-10 w-7 h-7 md:w-10 md:h-10 text-stone-950 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 group-hover:scale-105 transition-all duration-150 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                </motion.button>

                {/* macOS Launchpad Icon Label (Selectable & Copyable) */}
                <span
                  className="mt-2 font-sans text-[11px] md:text-[13px] font-semibold text-white tracking-wide text-center select-none md:select-text cursor-default md:cursor-text pointer-events-auto"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85)',
                  }}
                >
                  {app.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ================= 2. EDITORIAL PAGE FOOTER (Normal Document Flow) ================= */}
      <Footer />

      {/* ================= 3. macOS SYSTEM SETTINGS FLOATING WINDOW ================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isSettingsOpen && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none"
                onWheel={(event) => event.stopPropagation()}
              >
                {/* Soft Ambient Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  onClick={closeSettings}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* macOS System Settings Window with Genuine Genie Tapered Shrink Effect (Solid, Zero Fade, Slower & Smoother) */}
                <motion.div
                  initial={{
                    y: suctionY,
                    scaleX: 0.55,
                    scaleY: 0.03,
                    clipPath: GENIE_SHRUNK_POLYGON,
                  }}
                  animate={{
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    clipPath: GENIE_REST_POLYGON,
                    transition: {
                      duration: 0.72,
                      ease: [0.16, 1, 0.3, 1], // Apple spring deceleration
                    },
                  }}
                  exit={{
                    y: suctionY,
                    scaleX: 0.55,
                    scaleY: 0.03,
                    clipPath: GENIE_SHRUNK_POLYGON,
                    transition: {
                      duration: 0.72, // Symmetrical 0.72s duration with enter
                      ease: [0.35, 0, 0.25, 1], // Silky smooth deceleration into suction point
                    },
                  }}
                  style={{
                    transformOrigin: '50% 100%',
                    willChange: 'transform, clip-path',
                  }}
                  className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl h-[520px] sm:h-[580px] max-h-[calc(100dvh-2rem)] rounded-2xl sm:rounded-3xl bg-[#FAF8F5]/92 dark:bg-[#1A1816]/95 hover:bg-[#FAF8F5]/96 dark:hover:bg-[#1A1816]/98 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/80 dark:border-stone-700/80 shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,1),0_28px_70px_-10px_rgba(0,0,0,0.38)] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100"
                >
                  {/* Window Titlebar */}
                  <div className="h-13 px-5 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 bg-white/40 dark:bg-stone-900/60 backdrop-blur-md flex-shrink-0">
                    {/* Left: 3 macOS Window Traffic Light Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={closeSettings}
                        title="Close (Esc)"
                        className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-85 active:scale-90 transition-transform cursor-pointer flex items-center justify-center group"
                      >
                        <X className="w-2 h-2 text-[#7F1D1D] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        onClick={closeSettings}
                        title="Minimize"
                        className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-85 active:scale-90 transition-transform cursor-pointer flex items-center justify-center group"
                      >
                        <Minus className="w-2 h-2 text-[#78350F] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div
                        title="Expand"
                        className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"
                      />
                    </div>

                    {/* Center: Window Title */}
                    <div className="flex items-center gap-2 font-serif italic text-sm font-semibold text-stone-900 dark:text-stone-100">
                      <Settings className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      <span>System Settings</span>
                    </div>

                    {/* Right: Empty spacer to keep center title balanced */}
                    <div className="w-14" />
                  </div>

                  {/* Main Body: Sidebar + Detail Pane */}
                  <div className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-full sm:w-52 flex sm:block gap-1 sm:space-y-1.5 border-b sm:border-b-0 sm:border-r border-stone-200/60 dark:border-stone-800 p-2 sm:p-3 bg-black/[0.02] dark:bg-stone-950/20 flex-shrink-0">
                      {[
                        { id: 'about', label: 'About', icon: Info },
                        { id: 'appearance', label: 'Appearance', icon: Palette },
                        { id: 'audio', label: 'Ambience', icon: Volume2 },
                        { id: 'motion', label: 'Motion', icon: Sliders },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeSettingsTab === tab.id;

                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSettingsTab(tab.id as typeof activeSettingsTab)}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={tab.label}
                            className={`group relative isolate w-full min-w-0 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 px-1 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl border border-transparent text-[10px] sm:text-[13px] font-sans font-medium text-left cursor-pointer ${
                              isActive
                                ? 'text-stone-950 dark:text-white font-semibold'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                            }`}
                          >
                            {isActive ? (
                              <span key="selected" className="absolute inset-0 -z-10 rounded-xl bg-white/75 dark:bg-white/12 border border-white/80 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(40,30,20,0.08)] pointer-events-none" />
                            ) : (
                              <span key="hover" className="absolute inset-0 -z-10 rounded-xl bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />
                            )}
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-800 dark:text-amber-400' : 'text-stone-500 dark:text-stone-400 group-hover:text-amber-800 dark:group-hover:text-amber-400'}`} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Content Pane */}
                    <div className="settings-content-scroll flex-1 min-w-0 min-h-0 p-4 sm:p-7 overflow-y-auto overscroll-contain space-y-5">
                      {/* Appearance */}
                      {activeSettingsTab === 'appearance' && (
                        <div className="space-y-5">
                          <div>
                            <h4 className="font-serif italic text-lg font-semibold text-stone-950 dark:text-stone-100">
                              Interface Appearance
                            </h4>
                            <p className="text-xs font-sans text-stone-600 dark:text-stone-400">
                              Choose between Antique Glass and Obsidian Frosted Glass UI.
                            </p>
                          </div>

                          {/* 2 Theme Selector Cards: Light & Dark */}
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              {
                                id: 'light',
                                name: 'Light Glass',
                                subtitle: 'Antique Paper & Gold',
                                previewBg: 'bg-[#FAF8F5]',
                                titlebarBg: 'bg-[#EDE8E1]',
                                cardBg: 'bg-white',
                                borderColor: 'border-amber-900/20',
                              },
                              {
                                id: 'dark',
                                name: 'Dark Glass',
                                subtitle: 'Obsidian Frosted Glass',
                                previewBg: 'bg-[#141210]',
                                titlebarBg: 'bg-[#221F1C]',
                                cardBg: 'bg-[#1C1A18]',
                                borderColor: 'border-stone-700',
                              },
                            ].map((mode) => {
                              const isSelected = activeSettings.theme === mode.id;
                              return (
                                <button
                                  key={mode.id}
                                  onClick={() => handleSettingChange({ theme: mode.id as 'light' | 'dark' })}
                                  className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-white/80 dark:bg-white/10 border-amber-800/80 dark:border-amber-500/80 ring-2 ring-amber-800/20 shadow-md'
                                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {/* macOS Mini Preview Window */}
                                  <div className={`w-full h-24 rounded-xl ${mode.previewBg} border ${mode.borderColor} shadow-inner flex flex-col overflow-hidden p-2`}>
                                    <div className={`h-3 w-full rounded-md ${mode.titlebarBg} flex items-center px-1.5 gap-1 mb-2`}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                                    </div>
                                    <div className="flex-1 flex gap-1.5">
                                      <div className={`w-1/3 h-full rounded ${mode.cardBg} opacity-80`} />
                                      <div className={`flex-1 h-full rounded ${mode.cardBg} opacity-60 flex items-center justify-center`}>
                                        {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-xs font-sans font-semibold text-stone-900 dark:text-stone-100">
                                      {mode.name}
                                    </span>
                                    <span className="text-[11px] font-sans text-stone-500 dark:text-stone-400">
                                      {mode.subtitle}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <label htmlFor="glass-opacity" className="text-sm font-sans font-medium text-stone-900 dark:text-stone-100">
                                Glass opacity
                              </label>
                              <output htmlFor="glass-opacity" className="text-sm font-mono text-amber-900 dark:text-amber-300">
                                {activeSettings.glassOpacity}%
                              </output>
                            </div>
                            <div
                              aria-label="Glass opacity preview"
                              className={`relative h-28 rounded-xl overflow-hidden border border-stone-300/40 dark:border-white/15 flex items-center justify-center ${
                                activeSettings.theme === 'dark'
                                  ? 'bg-[linear-gradient(135deg,#302821,#715737_50%,#211b19)]'
                                  : 'bg-[linear-gradient(135deg,#b69a77,#e9d3a8_50%,#8b7056)]'
                              }`}
                            >
                              <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_46px,rgba(255,255,255,0.28)_47px,transparent_49px)]" />
                              <div className="glass-surface relative w-3/4 max-w-64 rounded-xl border border-white/60 dark:border-white/20 p-3 backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.2)] text-stone-950 dark:text-stone-100">
                                <span className="block font-serif italic text-lg leading-tight">Tantalus Galleria</span>
                                <span className="block text-[11px] font-sans">A preview of your glass panels</span>
                              </div>
                            </div>
                            <input
                              id="glass-opacity"
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={activeSettings.glassOpacity}
                              onChange={(e) => handleSettingChange({ glassOpacity: Number(e.target.value) })}
                              className="w-full accent-amber-800 dark:accent-amber-400 cursor-pointer"
                            />
                            <p className="text-xs font-sans text-stone-600 dark:text-stone-400">
                              Adjust glass transparency.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Audio & Ambience */}
                      {activeSettingsTab === 'audio' && (
                        <div className="space-y-5">
                          <div>
                            <h4 className="font-serif italic text-lg font-semibold text-stone-950 dark:text-stone-100">
                              Acoustic Atmosphere
                            </h4>
                            <p className="text-xs font-sans text-stone-600 dark:text-stone-400">
                              A continuous collection of five piano pieces.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100">Background Music</span>
                                <p className="text-xs font-sans text-stone-500 dark:text-stone-400">Piano pieces that continue as you explore</p>
                              </div>
                              <button
                                onClick={() => handleSettingChange({ isAudioEnabled: !activeSettings.isAudioEnabled })}
                                aria-label="Background music"
                                aria-pressed={activeSettings.isAudioEnabled}
                                className={`w-12 h-6.5 shrink-0 rounded-full p-0.5 transition-colors cursor-pointer ${
                                  activeSettings.isAudioEnabled ? 'bg-amber-800 dark:bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                                }`}
                              >
                                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${activeSettings.isAudioEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                              </button>
                            </div>

                            <div className="pt-3 border-t border-stone-200/50 dark:border-stone-800 space-y-1">
                              <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest font-sans text-stone-500 dark:text-stone-400">
                                <span>Now Playing</span>
                                {activeSettings.isAudioEnabled && <span role="status">{musicStatus === 'playing' ? 'Playing' : musicStatus === 'loading' ? 'Loading' : musicStatus === 'blocked' ? 'Paused by browser' : 'Unavailable'}</span>}
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-sans font-medium text-stone-900 dark:text-stone-100 truncate">
                                  {activeSettings.isAudioEnabled && currentTrackId
                                    ? MUSIC_TRACKS.find((track) => track.id === currentTrackId)?.title
                                    : activeSettings.isAudioEnabled ? 'Preparing playlist...' : 'Music is off'}
                                </span>
                                <button
                                  type="button"
                                  onClick={onSkipTrack}
                                  disabled={!activeSettings.isAudioEnabled || !onSkipTrack}
                                  aria-label="Next track"
                                  title="Next track"
                                  className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <SkipForward className="w-4 h-4" />
                                </button>
                              </div>
                              {activeSettings.isAudioEnabled && musicStatus === 'blocked' && (
                                <button type="button" onClick={onRetryPlayback} className="text-xs text-amber-800 dark:text-amber-400 underline cursor-pointer">
                                  Tap to start music
                                </button>
                              )}
                              {activeSettings.isAudioEnabled && musicStatus === 'error' && (
                                <p role="alert" className="text-xs text-red-700 dark:text-red-400">Music could not be played. Check your connection or try the next track.</p>
                              )}
                            </div>
                            <div className="space-y-2 pt-3 border-t border-stone-200/50 dark:border-stone-800">
                              <div className="flex items-center justify-between text-xs font-sans text-stone-600 dark:text-stone-400">
                                <label htmlFor="music-volume">Music Volume</label>
                                <span>{activeSettings.volume}%</span>
                              </div>
                              <input
                                id="music-volume"
                                type="range"
                                min="0"
                                max="100"
                                value={activeSettings.volume}
                                onChange={(e) => handleSettingChange({ volume: Number(e.target.value) })}
                                className="w-full h-2 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-800 dark:accent-amber-600"
                              />
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm space-y-3">
                            <div>
                              <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100">Play Order</span>
                              <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                                {activeSettings.playbackMode === 'shuffle'
                                  ? 'All five songs play once before reshuffling.'
                                  : 'Arrange the order they play in.'}
                              </p>
                            </div>
                            <div className="flex gap-1 p-1 rounded-xl bg-stone-200/60 dark:bg-stone-900/70" role="group" aria-label="Play order">
                              {(['shuffle', 'sequential'] as const).map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  aria-pressed={activeSettings.playbackMode === mode}
                                  onClick={() => handleSettingChange({ playbackMode: mode })}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-medium cursor-pointer transition-colors ${activeSettings.playbackMode === mode ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-white shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
                                >
                                  {mode === 'shuffle' ? 'Shuffle' : 'In Order'}
                                </button>
                              ))}
                            </div>
                            {activeSettings.playbackMode === 'sequential' && (
                              <ol className="space-y-1" aria-label="Music playlist">
                                {activeSettings.musicOrder.map((id, index) => {
                                  const track = MUSIC_TRACKS.find((item) => item.id === id);
                                  return (
                                    <li key={id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-sans ${currentTrackId === id && activeSettings.isAudioEnabled ? 'bg-amber-100/70 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300' : 'text-stone-700 dark:text-stone-300'}`}>
                                      <span className="w-4 shrink-0 text-stone-400 tabular-nums">{index + 1}.</span>
                                      <span className="flex-1 truncate" title={track?.title}>{track?.title}</span>
                                      <button type="button" onClick={() => moveTrack(index, -1)} disabled={index === 0} aria-label={`Move ${track?.title} up`} className="p-1 rounded hover:bg-stone-200 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><ChevronUp className="w-3.5 h-3.5" /></button>
                                      <button type="button" onClick={() => moveTrack(index, 1)} disabled={index === activeSettings.musicOrder.length - 1} aria-label={`Move ${track?.title} down`} className="p-1 rounded hover:bg-stone-200 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><ChevronDown className="w-3.5 h-3.5" /></button>
                                    </li>
                                  );
                                })}
                              </ol>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Motion (Functional Toggles) */}
                      {activeSettingsTab === 'motion' && (
                        <div className="space-y-5">
                          <div>
                            <h4 className="font-serif italic text-lg font-semibold text-stone-950 dark:text-stone-100">
                              Motion Engine & Physics
                            </h4>
                            <p className="text-xs font-sans text-stone-600 dark:text-stone-400">
                              Configure camera gliding speed, 3D interaction physics, and living canvas parallax.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {/* Living Art Parallax */}
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100">
                                  Living Art Parallax
                                </span>
                                <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                                  Subtle living breathing scale on Renaissance paintings (22s loop)
                                </p>
                              </div>
                              <button
                                onClick={() => handleSettingChange({ ambientParallax: !activeSettings.ambientParallax })}
                                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                  activeSettings.ambientParallax ? 'bg-amber-800 dark:bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                                }`}
                              >
                                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${activeSettings.ambientParallax ? 'translate-x-5.5' : 'translate-x-0'}`} />
                              </button>
                            </div>

                            {/* 3D Interactive Tilt & Elevate */}
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100">
                                  3D Hover Elevation
                                </span>
                                <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                                  Hardware-accelerated 3D icon lifts and spring tap dynamics
                                </p>
                              </div>
                              <button
                                onClick={() => handleSettingChange({ interactiveTilt: !activeSettings.interactiveTilt })}
                                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                  activeSettings.interactiveTilt ? 'bg-amber-800 dark:bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                                }`}
                              >
                                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${activeSettings.interactiveTilt ? 'translate-x-5.5' : 'translate-x-0'}`} />
                              </button>
                            </div>

                            {/* Reduced Motion */}
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900 dark:text-stone-100">
                                  Reduced Motion
                                </span>
                                <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                                  Snap camera glides (0.25s) and minimize spatial displacements
                                </p>
                              </div>
                              <button
                                onClick={() => handleSettingChange({ reducedMotion: !activeSettings.reducedMotion })}
                                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                  activeSettings.reducedMotion ? 'bg-amber-800 dark:bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                                }`}
                              >
                                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${activeSettings.reducedMotion ? 'translate-x-5.5' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* About (Author: AxelS27 & Last Updated from GitHub) */}
                      {activeSettingsTab === 'about' && (
                        <div className="space-y-5">
                          <div className="flex items-center gap-3.5 pb-1 border-b border-stone-200/60 dark:border-stone-800">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-stone-300/80 dark:border-white/20 shadow-md flex items-center justify-center p-1 flex-shrink-0">
                              <img
                                src="/favicon.png"
                                alt="Tantalize OS Icon"
                                className="w-full h-full object-contain rounded-xl select-none pointer-events-none"
                              />
                            </div>
                            <div>
                              <h4 className="font-serif italic text-xl font-semibold text-stone-950 dark:text-stone-100 leading-tight">
                                Tantalize OS
                              </h4>
                              <p className="text-xs font-sans text-stone-500 dark:text-stone-400">
                                Tantalus Galleria, Inspired by Classical European Art
                              </p>
                            </div>
                          </div>

                          <div className="p-4.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm space-y-3 text-xs sm:text-[13px] font-sans">
                            {/* Author: AxelS27 */}
                            <div className="flex justify-between items-center py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                              <span className="text-stone-500 dark:text-stone-400 font-medium">Author</span>
                              <a
                                href="https://github.com/AxelS27"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                              >
                                <span>AxelS27</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                              </a>
                            </div>

                            {/* Last Updated (Directly from GitHub) */}
                            <div className="flex justify-between items-center py-1.5 border-b border-stone-200/60 dark:border-stone-800">
                              <span className="text-stone-500 dark:text-stone-400 font-medium">Last Updated</span>
                              {isLoadingGithub ? (
                                <span className="font-mono text-[11px] text-stone-400 animate-pulse">
                                  Fetching from GitHub...
                                </span>
                              ) : githubInfo ? (
                                <a
                                  href={githubInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={githubInfo.message}
                                  className="inline-flex items-center gap-1.5 font-mono text-xs text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                                >
                                  <span>{githubInfo.date}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-stone-500 dark:text-stone-400 font-normal">
                                    {githubInfo.sha}
                                  </span>
                                  <ArrowUpRight className="w-3 h-3 text-stone-400" />
                                </a>
                              ) : (
                                <span className="font-mono text-xs text-stone-800 dark:text-stone-200">
                                  Sep 18, 2026
                                </span>
                              )}
                            </div>

                            {/* Repository */}
                            <div className="flex justify-between items-center py-1.5">
                              <span className="text-stone-500 dark:text-stone-400 font-medium">Repository</span>
                              <a
                                href="https://github.com/AxelS27/tantalus"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                              >
                                <span>AxelS27/tantalus</span>
                                <ArrowUpRight className="w-3 h-3 text-stone-400" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
});

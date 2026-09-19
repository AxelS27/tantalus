import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Music,
  Film,
  BookOpen,
  Share2,
  Settings,
  ChevronRight,
} from 'lucide-react';

export type NavItem = 'home' | 'timeline' | 'projects' | 'archive' | 'certificates';

interface NavbarProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
  onSubAppSelect?: (appId: string) => void;
}

const navItems: { id: NavItem; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'projects', label: 'Projects' },
  { id: 'archive', label: 'Archive' },
];

const archiveSubApps = [
  { id: 'certificates', shortLabel: 'Certs', fullLabel: 'Certificates', icon: Award },
  { id: 'repertoire', shortLabel: 'Music', fullLabel: 'Repertoire', icon: Music },
  { id: 'watchlist', shortLabel: 'Films', fullLabel: 'Watchlist', icon: Film },
  { id: 'storybook', shortLabel: 'Story', fullLabel: 'Story Book', icon: BookOpen },
  { id: 'connect', shortLabel: 'Connect', fullLabel: 'Connect', icon: Share2 },
  { id: 'settings', shortLabel: 'Settings', fullLabel: 'Settings', icon: Settings },
];

export function Navbar({ activeTab = 'home', onTabChange, onSubAppSelect }: NavbarProps) {
  const handleSelect = (id: NavItem) => {
    onTabChange?.(id);
  };

  const isArchiveFamily = activeTab === 'archive' || activeTab === 'certificates';
  const activeSubApp = activeTab === 'certificates' ? 'certificates' : undefined;

  return (
    <header className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex flex-col items-center">
      <motion.nav
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-auto transform-gpu flex flex-col items-center w-auto max-w-[95vw]"
      >
        {/* Tier 1: Main Apple Frosted Glass Capsule */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative flex items-center p-1 rounded-full bg-[#FAF8F5]/50 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/50 dark:border-stone-700/60 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_8px_32px_-6px_rgba(40,30,20,0.08)] transition-colors duration-300"
        >
          {navItems.map((item) => {
            const isItemActive =
              item.id === 'archive'
                ? activeTab === 'archive' || activeTab === 'certificates'
                : activeTab === item.id;

            // When in certificates sub-page, morph the archive pill into a breadcrumb!
            if (item.id === 'archive' && activeTab === 'certificates') {
              return (
                <div key={item.id} className="relative flex items-center pl-3 sm:pl-4 pr-1 py-1">
                  <button
                    onClick={() => handleSelect('archive')}
                    className="text-[11px] sm:text-xs tracking-[0.14em] uppercase font-sans text-stone-700/80 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Archive
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 mx-1.5 flex-shrink-0" />

                  <div className="relative px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs tracking-[0.14em] uppercase font-sans font-medium text-stone-950 dark:text-stone-100">
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                        mass: 0.8,
                      }}
                      className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.75)]"
                    />
                    <span className="relative z-10 block pointer-events-none">Certificates</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-[0.14em] uppercase cursor-pointer focus:outline-none rounded-full transition-colors duration-200 ${
                  isItemActive
                    ? 'text-stone-950 dark:text-stone-100 font-medium'
                    : 'text-stone-800/70 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                {/* Active Lens Indicator with Butter-Smooth Spring */}
                {isItemActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.75)]"
                  />
                )}

                {/* Smooth Non-glitching Hover Background */}
                {!isItemActive && (
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/25 dark:group-hover:bg-white/10 border border-transparent group-hover:border-white/30 dark:group-hover:border-white/15 transition-all duration-250 ease-out" />
                )}

                {/* Text Label */}
                <span className="relative z-10 block pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Tier 2: Horizontal Sub-Dock (Spanning from under Home to under Archive) */}
        <AnimatePresence>
          {isArchiveFamily && (
            <motion.div
              key="archiveSubDock"
              initial={{ opacity: 0, y: -8, scaleY: 0.85, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scaleY: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scaleY: 0.85, filter: 'blur(4px)' }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 30,
                mass: 0.85,
              }}
              className="w-full mt-1.5 flex items-center justify-between p-1 rounded-full bg-[#FAF8F5]/55 dark:bg-[#161412]/65 hover:bg-[#FAF8F5]/65 dark:hover:bg-[#161412]/80 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/55 dark:border-stone-700/65 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_8px_24px_-6px_rgba(40,30,20,0.1)] gap-1 overflow-x-auto no-scrollbar"
            >
              {archiveSubApps.map((subApp) => {
                const SubIcon = subApp.icon;
                const isSubActive = activeSubApp === subApp.id;

                return (
                  <button
                    key={subApp.id}
                    onClick={() => onSubAppSelect?.(subApp.id)}
                    title={subApp.fullLabel}
                    className={`group relative flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10.5px] sm:text-[11.5px] tracking-wide font-sans transition-colors cursor-pointer select-none ${
                      isSubActive
                        ? 'text-stone-950 dark:text-stone-100 font-semibold'
                        : 'text-stone-700/80 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                    }`}
                  >
                    {/* Active Lens Pill */}
                    {isSubActive && (
                      <motion.div
                        layoutId="activeSubDockPill"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                          mass: 0.8,
                        }}
                        className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.8)]"
                      />
                    )}

                    {!isSubActive && (
                      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/25 dark:group-hover:bg-white/10 border border-transparent group-hover:border-white/30 dark:group-hover:border-white/15 transition-all duration-200" />
                    )}

                    <SubIcon className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="relative z-10 hidden sm:inline truncate">
                      {subApp.fullLabel}
                    </span>
                    <span className="relative z-10 inline sm:hidden truncate">
                      {subApp.shortLabel}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { getPrefetchProps, type PrefetchSectionKey } from '../lib/prefetch';

export type NavItem = 'home' | 'storybook' | 'timeline' | 'projects' | 'archive' | 'certificates' | 'connect';

interface NavbarProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

const mainNavItems: { id: 'home' | 'timeline' | 'projects'; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'projects', label: 'Projects' },
];

// Unified calm spring physics matching page transition tempo
const navbarSpring = {
  type: 'spring' as const,
  stiffness: 140,
  damping: 24,
  mass: 1.1,
};

export function Navbar({ activeTab = 'home', onTabChange }: NavbarProps) {
  const handleSelect = (id: NavItem) => {
    onTabChange?.(id);
  };

  const isSubApp = activeTab === 'certificates' || activeTab === 'connect' || activeTab === 'storybook';
  const subAppLabel =
    activeTab === 'certificates'
      ? 'Certificates'
      : activeTab === 'connect'
        ? 'Connect'
        : 'Story Book';

  return (
    <header className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex flex-col items-center">
      <motion.nav
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-auto transform-gpu flex flex-col items-center"
      >
        {/* Main Apple Frosted Glass Capsule (Strictly locked height: h-10 / h-11, width-only elasticity) */}
        <div className="relative h-10 sm:h-11 flex items-center p-1 rounded-full bg-[#FAF8F5]/50 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/50 dark:border-stone-700/60 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_8px_32px_-6px_rgba(40,30,20,0.08)] transition-colors duration-300">
          {/* Main 3 Quadrant Tabs: Home, Timeline, Projects */}
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const prefetchProps = item.id === 'home' ? {} : getPrefetchProps(item.id as PrefetchSectionKey);

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                {...prefetchProps}
                className={`group relative h-full flex items-center justify-center px-4 sm:px-5 text-[11px] sm:text-xs tracking-[0.14em] uppercase cursor-pointer focus:outline-none rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-stone-950 dark:text-stone-100 font-medium'
                    : 'text-stone-800/70 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                {/* Active Lens Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={navbarSpring}
                    className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.75)]"
                  />
                )}

                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/25 dark:group-hover:bg-white/10 border border-transparent group-hover:border-white/30 dark:group-hover:border-white/15 transition-all duration-250 ease-out" />
                )}

                <span className="relative z-10 block pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 4th Tab: Archive + Width-Only Dynamic Breadcrumb Extension */}
          <div className="relative h-full flex items-center">
            {/* Archive Button */}
            <button
              onClick={() => handleSelect('archive')}
              {...getPrefetchProps('archive')}
              className={`group relative h-full flex items-center justify-center px-4 sm:px-5 text-[11px] sm:text-xs tracking-[0.14em] uppercase cursor-pointer focus:outline-none rounded-full transition-colors duration-200 ${
                activeTab === 'archive'
                  ? 'text-stone-950 dark:text-stone-100 font-medium'
                  : 'text-stone-800/70 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
              }`}
            >
              {activeTab === 'archive' && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={navbarSpring}
                  className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.75)]"
                />
              )}

              {activeTab !== 'archive' && (
                <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/25 dark:group-hover:bg-white/10 border border-transparent group-hover:border-white/30 dark:group-hover:border-white/15 transition-all duration-250 ease-out" />
              )}

              <span className="relative z-10 block pointer-events-none">
                Archive
              </span>
            </button>

            {/* Horizontal-Only Accordion Breadcrumb Extension (Strictly 0px height change) */}
            <AnimatePresence initial={false}>
              {isSubApp && (
                <motion.div
                  key="subAppBreadcrumb"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={navbarSpring}
                  className="overflow-hidden h-full flex items-center"
                >
                  {/* Divider Chevron */}
                  <div className="flex items-center px-1 flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  </div>

                  {/* Sub-App Active Capsule */}
                  <div className="relative h-full flex items-center justify-center px-3.5 sm:px-4 text-[11px] sm:text-xs tracking-[0.14em] uppercase font-sans font-medium text-stone-950 dark:text-stone-100 flex-shrink-0 whitespace-nowrap">
                    <motion.div
                      layoutId="activeNavPill"
                      transition={navbarSpring}
                      className="absolute inset-0 rounded-full bg-white/65 dark:bg-white/20 border border-white/75 dark:border-white/25 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.75)]"
                    />
                    <span className="relative z-10 block pointer-events-none">
                      {subAppLabel}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>
    </header>
  );
}

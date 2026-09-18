import { motion } from 'motion/react';

export type NavItem = 'home' | 'timeline' | 'projects' | 'archive';

interface NavbarProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

const navItems: { id: NavItem; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'projects', label: 'Projects' },
  { id: 'archive', label: 'Archive' },
];

export function Navbar({ activeTab = 'home', onTabChange }: NavbarProps) {
  const handleSelect = (id: NavItem) => {
    onTabChange?.(id);
  };

  return (
    <header className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
      <motion.nav
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-auto transform-gpu"
      >
        {/* Apple Frosted Glass Container */}
        <div className="relative flex items-center p-1 rounded-full bg-[#FAF8F5]/50 dark:bg-[#161412]/60 hover:bg-[#FAF8F5]/60 dark:hover:bg-[#161412]/75 backdrop-blur-2xl backdrop-saturate-[180%] border border-white/50 dark:border-stone-700/60 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_8px_32px_-6px_rgba(40,30,20,0.08)] transition-colors duration-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-[0.14em] uppercase cursor-pointer focus:outline-none rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-stone-950 dark:text-stone-100 font-medium'
                    : 'text-stone-800/70 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                {/* Active Lens Indicator with Butter-Smooth Spring */}
                {isActive && (
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
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/25 dark:group-hover:bg-white/10 border border-transparent group-hover:border-white/30 dark:group-hover:border-white/15 transition-all duration-250 ease-out" />
                )}

                {/* Text Label */}
                <span className="relative z-10 block pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.nav>
    </header>
  );
}

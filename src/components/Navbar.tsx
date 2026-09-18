import { useState } from 'react';
import { motion } from 'motion/react';

export type NavItem = 'home' | 'timeline' | 'projects' | 'certificate';

interface NavbarProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

const navItems: { id: NavItem; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificate', label: 'Certificate' },
];

export function Navbar({ activeTab = 'home', onTabChange }: NavbarProps) {
  const [active, setActive] = useState<NavItem>(activeTab);

  const handleSelect = (id: NavItem) => {
    setActive(id);
    onTabChange?.(id);
  };

  return (
    <header className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto"
      >
        {/* Apple Frosted Glass Container */}
        <div className="relative flex items-center p-1 rounded-full bg-white/[0.18] backdrop-blur-3xl backdrop-saturate-[180%] border border-white/35 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.45),0_8px_28px_-6px_rgba(0,0,0,0.06)]">
          {navItems.map((item) => {
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-[0.14em] uppercase cursor-pointer focus:outline-none rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-stone-950 font-medium'
                    : 'text-stone-800/70 hover:text-stone-950'
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
                    className="absolute inset-0 rounded-full bg-white/40 border border-white/50 shadow-[0_1px_4px_rgba(0,0,0,0.02),inset_0_1px_0.5px_rgba(255,255,255,0.6)]"
                  />
                )}

                {/* Smooth Non-glitching Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/18 border border-transparent group-hover:border-white/25 transition-all duration-250 ease-out" />
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

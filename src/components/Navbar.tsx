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
  const [hovered, setHovered] = useState<NavItem | null>(null);

  const handleSelect = (id: NavItem) => {
    setActive(id);
    onTabChange?.(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-5 sm:px-10 py-5 sm:py-6 flex items-center justify-between pointer-events-none">
      {/* Brand / Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto"
      >
        <button
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-serif tracking-[0.3em] text-xs sm:text-sm uppercase font-semibold text-[#1C1917]/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] transition-colors group-hover:text-[#94723E]">
            TANTALIZE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#94723E]/80 group-hover:scale-125 transition-transform" />
        </button>
      </motion.div>

      {/* Floating Glass Pill Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto"
      >
        <div
          onMouseLeave={() => setHovered(null)}
          className="relative flex items-center p-1 sm:p-1.5 rounded-full bg-[#FAF8F5]/55 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(44,38,30,0.08)] ring-1 ring-[#1C1917]/5"
        >
          {navItems.map((item) => {
            const isActive = active === item.id;
            const isHover = hovered === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                className={`relative px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-[0.18em] uppercase transition-colors duration-200 cursor-pointer focus:outline-none select-none rounded-full ${
                  isActive
                    ? 'text-[#1C1917] font-medium'
                    : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                }`}
              >
                {/* Active Background Pill with Spring Motion */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-full bg-white/90 shadow-[0_2px_12px_rgba(44,38,30,0.08)] border border-white/80"
                  />
                )}

                {/* Subtle Hover Pill */}
                {!isActive && isHover && (
                  <motion.div
                    layoutId="hoverNavPill"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                    className="absolute inset-0 rounded-full bg-white/40"
                  />
                )}

                {/* Text Label */}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </motion.nav>

      {/* Right Minimalist Status / Year Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5]/40 backdrop-blur-md border border-white/40 text-[10px] tracking-[0.25em] text-[#1C1917]/70 uppercase"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80 animate-pulse" />
        <span>Available 2026</span>
      </motion.div>
    </header>
  );
}

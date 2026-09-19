import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';
import { TimelineRoller } from './components/TimelineRoller';
import { ProjectsGrid } from './components/ProjectsGrid';
import { ArchiveHub, type PortfolioSettings, getSavedSettings } from './components/ArchiveHub';
import { CertificatesCoverflow } from './components/CertificatesCoverflow';

const validTabs: NavItem[] = ['home', 'timeline', 'projects', 'archive', 'certificates'];

const getTabFromHash = (): NavItem => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'certificates' || hash === 'certificate' || hash === 'archive/certificates') {
    return 'certificates';
  }
  if (hash === 'connect' || hash === 'archive/connect') {
    return 'connect';
  }
  if (hash.startsWith('archive') || hash.includes('settings')) {
    return 'archive';
  }
  if (validTabs.includes(hash as NavItem)) {
    return hash as NavItem;
  }
  return 'home';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>(getTabFromHash);
  const [settings, setSettings] = useState<PortfolioSettings>(getSavedSettings);
  const isTransitioningRef = useRef(false);

  // Sync settings and HTML dark class
  const handleUpdateSettings = (patch: Partial<PortfolioSettings>) => {
    setSettings((prev) => {
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
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Sync tab change with URL Hash without page reload
  const handleTabChange = (newTab: NavItem) => {
    setActiveTab(newTab);
    const targetHash = newTab === 'home' ? '' : `#${newTab}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(
        null,
        '',
        targetHash || window.location.pathname + window.location.search
      );
    }
  };

  // Safe global section switch with cooldown to prevent skipping
  const triggerSectionChange = (newTab: NavItem) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    handleTabChange(newTab);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 1400);
  };

  // Listen to browser Back/Forward or direct hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global mouse wheel listener for section-to-section navigation
  const handleGlobalWheel = (e: React.WheelEvent) => {
    if (isTransitioningRef.current) return;

    if (activeTab === 'home') {
      if (e.deltaY > 25) {
        triggerSectionChange('timeline');
      }
    } else if (activeTab === 'certificates') {
      if (e.deltaY < -25) {
        // Scrolling up glides back to Archive Hub
        triggerSectionChange('archive');
      } else if (e.deltaY > 25 || e.deltaX > 25) {
        // Scrolling down or right glides to Projects
        triggerSectionChange('projects');
      }
    } else if (activeTab === 'connect') {
      if (e.deltaY < -25) {
        // Scrolling up glides North to Timeline
        triggerSectionChange('timeline');
      } else if (e.deltaX < -25 || e.deltaY > 25) {
        // Scrolling left or down glides West to Projects
        triggerSectionChange('projects');
      }
    }
  };

  // Map each tab to 2D camera coordinates (Center, East, South, West)
  const getCameraCoordinates = () => {
    switch (activeTab) {
      case 'timeline':
        return { x: '-100vw', y: '0vh' };
      case 'projects':
        return { x: '0vw', y: '-100vh' };
      case 'archive':
        return { x: '100vw', y: '0vh' };
      case 'certificates':
        return { x: '100vw', y: '-100vh' };
      case 'connect':
        return { x: '-100vw', y: '-100vh' };
      case 'home':
      default:
        return { x: '0vw', y: '0vh' };
    }
  };

  const coords = getCameraCoordinates();

  // Reusable mask style for seamless atmospheric edge feathering without transparent gap
  const seamlessMaskStyle = {
    maskImage: 'radial-gradient(ellipse 99% 98% at 50% 50%, black 80%, rgba(0,0,0,0.96) 94%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 99% 98% at 50% 50%, black 80%, rgba(0,0,0,0.96) 94%, transparent 100%)',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  };

  return (
    <div
      onWheel={handleGlobalWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5]"
    >
      {/* Floating Centered Apple Frosted Glass Navbar */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 2D Spatial Canvas World */}
      <motion.div
        initial={{ x: coords.x, y: coords.y }}
        animate={{
          x: coords.x,
          y: coords.y,
        }}
        transition={{
          duration: settings.reducedMotion ? 0.25 : 1.6,
          ease: settings.reducedMotion ? 'easeOut' : [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 w-full h-full bg-[#161412] transform-gpu"
      >
        {/* ================= 1. HOME SECTION (Center: 0, 0) ================= */}
        <div className="absolute left-0 top-0 w-screen h-screen overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/home.png"
              alt="Home Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>

          {/* Upper-Left Editorial Identity */}
          <div className="absolute top-[25%] sm:top-[27%] left-6 sm:left-14 md:left-20 z-20 pointer-events-auto space-y-2 sm:space-y-2.5 max-w-5xl">
            {/* Line 1: Name */}
            <h1
              className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight font-light leading-none whitespace-nowrap"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.65)',
              }}
            >
              Farrell Axel Suwandi
            </h1>

            {/* Line 2: Role (Antique Gold) */}
            <p
              className="font-serif italic text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#E8C582] tracking-wide font-normal whitespace-nowrap"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.65)',
              }}
            >
              AI Researcher & Software Engineer
            </p>

            {/* Line 3: Age & Location */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 font-serif italic text-sm sm:text-base md:text-lg lg:text-xl text-stone-100/90 tracking-wide font-light whitespace-nowrap"
              style={{
                textShadow: '0 1px 8px rgba(0,0,0,0.85), 0 3px 14px rgba(0,0,0,0.6)',
              }}
            >
              <span>20 years old</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C582] shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
              <span>Jakarta</span>
            </div>

            {/* Line 4: Passions */}
            <p
              className="font-serif italic text-sm sm:text-base md:text-lg lg:text-xl text-stone-100/85 tracking-wide font-light whitespace-nowrap pt-0.5"
              style={{
                textShadow: '0 1px 8px rgba(0,0,0,0.85), 0 3px 14px rgba(0,0,0,0.6)',
              }}
            >
              love to playing piano, coding, and watching movies
            </p>
          </div>
        </div>

        {/* ================= 2. TIMELINE SECTION (East: +100vw, 0) ================= */}
        <div className="absolute left-[100vw] top-0 w-screen h-screen overflow-hidden z-10 flex items-center justify-center">
          {/* Background Image with Ultra-Subtle Vignette */}
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/timeline.png"
              alt="Timeline Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-black/10 pointer-events-none" />
          </motion.div>

          {/* Vertical Cylindrical Roller Wheel Component */}
          <TimelineRoller
            onReachEnd={() => triggerSectionChange('projects')}
            onReachStart={() => triggerSectionChange('home')}
          />
        </div>

        {/* ================= 3. PROJECTS SECTION (South: 0, +100vh) ================= */}
        <div className="absolute left-0 top-[100vh] w-screen h-screen overflow-hidden z-10 flex items-center justify-center">
          {/* Background Image with Subtle Vignette */}
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/projects.png"
              alt="Projects Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
          </motion.div>

          {/* 3D Cube Projects Grid with Full Mousewheel & Boundary Handoff */}
          <ProjectsGrid
            onReachEnd={() => triggerSectionChange('archive')}
            onReachStart={() => triggerSectionChange('timeline')}
          />
        </div>

        {/* ================= 4. ARCHIVE SECTION (West: -100vw, 0) ================= */}
        <div className="absolute left-[-100vw] top-0 w-screen h-[calc(100vh+2px)] overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/archives.png"
              alt="Archive Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
          </motion.div>

          {/* macOS Launchpad / App Hub */}
          <ArchiveHub
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onAppSelect={(appId) => {
              if (appId === 'certificates') {
                triggerSectionChange('certificates');
              } else if (appId === 'connect') {
                triggerSectionChange('connect');
              }
            }}
            onReachStart={() => triggerSectionChange('projects')}
          />
        </div>

        {/* ================= 5. CONNECT SECTION (Bottom-Right: +100vw, +100vh) ================= */}
        <div className="absolute left-[100vw] top-[100vh] w-screen h-[calc(100vh+2px)] overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/connect.png"
              alt="Connect Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
          </motion.div>
        </div>

        {/* ================= 6. CERTIFICATES SECTION (Bottom-Left: -100vw, +100vh) ================= */}
        <div className="absolute left-[-100vw] top-[100vh] w-screen h-[calc(100vh+2px)] overflow-hidden z-10">
          <motion.div
            style={seamlessMaskStyle}
            className="absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)]"
            animate={{
              scale: settings.ambientParallax ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={
              settings.ambientParallax
                ? {
                    duration: 22,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            <img
              src="/certificates.png"
              alt="Certificates Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
          </motion.div>

          {/* Interactive 3D Spatial Coverflow Carousel */}
          <CertificatesCoverflow
            onReachTop={() => triggerSectionChange('archive')}
            onReachRight={() => triggerSectionChange('projects')}
          />
        </div>

      </motion.div>
    </div>
  );
}

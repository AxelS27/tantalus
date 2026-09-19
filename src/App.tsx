import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';
import { type PortfolioSettings, getSavedSettings } from './lib/settings';
import { getAssetUrl } from './lib/assets';
import ImageWithSkeleton from './components/common/ImageWithSkeleton';
import ErrorBoundary from './components/common/ErrorBoundary';
import CanvasSectionSkeleton from './components/skeletons/CanvasSectionSkeleton';
import { prefetchSection } from './lib/prefetch';

// Lazy-loaded code-split section chunks
const TimelineRoller = lazy(() =>
  import('./components/TimelineRoller').then((m) => ({ default: m.TimelineRoller }))
);
const ProjectsGrid = lazy(() =>
  import('./components/ProjectsGrid').then((m) => ({ default: m.ProjectsGrid }))
);
const ArchiveHub = lazy(() =>
  import('./components/ArchiveHub').then((m) => ({ default: m.ArchiveHub }))
);
const CertificatesCoverflow = lazy(() =>
  import('./components/CertificatesCoverflow').then((m) => ({ default: m.CertificatesCoverflow }))
);

const validTabs: NavItem[] = ['home', 'timeline', 'projects', 'archive', 'certificates', 'connect'];

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

  // Safe global section switch with cooldown and neighbor prefetching
  const triggerSectionChange = (newTab: NavItem) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    handleTabChange(newTab);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 1400);

    // Intent-aware section chunk prefetching
    if (newTab === 'home') {
      prefetchSection('timeline');
      prefetchSection('archive');
    } else if (newTab === 'timeline') {
      prefetchSection('projects');
    } else if (newTab === 'projects') {
      prefetchSection('archive');
      prefetchSection('certificates');
    } else if (newTab === 'archive') {
      prefetchSection('certificates');
      prefetchSection('projects');
    }
  };

  // Idle background prefetch on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchSection('timeline');
        prefetchSection('archive');
      });
    }
  }, []);

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
    <ErrorBoundary>
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/home.webp')}
                alt="Home Background"
                loading="eager"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
              />
            </motion.div>

            {/* Upper-Left Editorial Identity */}
            <div className="absolute top-[22%] sm:top-[24%] left-6 sm:left-14 md:left-20 z-20 pointer-events-auto space-y-2.5 sm:space-y-3 max-w-5xl">
              {/* Status Highlight: NOT DONE YET */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/45 backdrop-blur-xl border border-[#E8C582]/45 text-[#E8C582] text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase shadow-[0_4px_20px_rgba(0,0,0,0.4)] select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8C582] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8C582]" />
                </span>
                <span className="font-semibold">NOT DONE YET</span>
              </div>

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

            {/* Colossal Diagonal Archival Watermark (Full-Screen Stamp) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-15 overflow-hidden">
              <div
                className="-rotate-12 transform-gpu text-center flex flex-col items-center justify-center"
                style={{
                  WebkitTextStroke: '2px rgba(255, 255, 255, 0.22)',
                }}
              >
                <span className="font-serif italic font-black text-[13vw] sm:text-[14vw] md:text-[15vw] leading-none tracking-[0.06em] text-white/10 dark:text-white/[0.07] uppercase select-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)] whitespace-nowrap">
                  NOT DONE YET
                </span>
              </div>
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/timeline.webp')}
                alt="Timeline Background"
                loading="lazy"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-black/10 pointer-events-none" />
            </motion.div>

            {/* Vertical Cylindrical Roller Wheel Component (Code-Split with Suspense) */}
            <Suspense fallback={<CanvasSectionSkeleton />}>
              <TimelineRoller
                onReachEnd={() => triggerSectionChange('projects')}
                onReachStart={() => triggerSectionChange('home')}
              />
            </Suspense>
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/projects.webp')}
                alt="Projects Background"
                loading="lazy"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
            </motion.div>

            {/* 3D Cube Projects Grid (Code-Split with Suspense) */}
            <Suspense fallback={<CanvasSectionSkeleton />}>
              <ProjectsGrid
                onReachEnd={() => triggerSectionChange('archive')}
                onReachStart={() => triggerSectionChange('timeline')}
              />
            </Suspense>
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/archives.webp')}
                alt="Archive Background"
                loading="lazy"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
            </motion.div>

            {/* macOS Launchpad / App Hub (Code-Split with Suspense) */}
            <Suspense fallback={<CanvasSectionSkeleton />}>
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
            </Suspense>
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/connect.webp')}
                alt="Connect Background"
                loading="lazy"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
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
              <ImageWithSkeleton
                src={getAssetUrl('/images/tantalize/certificates.webp')}
                alt="Certificates Background"
                loading="lazy"
                wrapperClassName="w-full h-full pointer-events-none"
                className="w-full h-full object-cover object-center pointer-events-none"
                skeletonClassName="bg-black/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
            </motion.div>

            {/* Interactive 3D Spatial Coverflow Carousel (Code-Split with Suspense) */}
            <Suspense fallback={<CanvasSectionSkeleton />}>
              <CertificatesCoverflow
                onReachTop={() => triggerSectionChange('archive')}
                onReachRight={() => triggerSectionChange('projects')}
              />
            </Suspense>
          </div>

        </motion.div>
      </div>
    </ErrorBoundary>
  );
}

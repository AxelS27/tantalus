import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';
import { type PortfolioSettings, getSavedSettings } from './lib/settings';
import { getAssetUrl } from './lib/assets';
import { getRenderQuality } from './lib/deviceQuality';
import {
  markNavigationStart,
  measureNavigation,
  startPerformanceMonitoring,
} from './lib/performanceMonitor';
import ErrorBoundary from './components/common/ErrorBoundary';
import CanvasSectionSkeleton from './components/skeletons/CanvasSectionSkeleton';
import type { ArchiveAppId } from './components/ArchiveHub';
import { prefetchSection, prefetchSectionBackground } from './lib/prefetch';
import { getProjectById } from './data/projects';

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
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);

const validTabs: NavItem[] = ['home', 'timeline', 'projects', 'archive', 'certificates', 'connect'];

interface RouteInfo {
  tab: NavItem;
  projectId: string | null;
}

const getRouteInfo = (): RouteInfo => {
  if (typeof window === 'undefined') return { tab: 'home', projectId: null };

  const hash = window.location.hash.replace('#', '').toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // Check project detail route from hash: e.g. #projects/railroad-cv or #project/railroad-cv
  if (hash.startsWith('projects/') || hash.startsWith('project/')) {
    const segments = hash.split('/');
    const projectId = segments.slice(1).join('/');
    return { tab: 'projects', projectId: projectId || null };
  }

  // Check project detail route from pathname: e.g. /projects/railroad-cv
  if (pathname.startsWith('/projects/') || pathname.startsWith('/project/')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return { tab: 'projects', projectId: segments[1] };
    }
  }

  if (hash === 'certificates' || hash === 'certificate' || hash === 'archive/certificates') {
    return { tab: 'certificates', projectId: null };
  }
  if (hash === 'connect' || hash === 'archive/connect') {
    return { tab: 'connect', projectId: null };
  }
  if (hash.startsWith('archive') || hash.includes('settings')) {
    return { tab: 'archive', projectId: null };
  }
  if (validTabs.includes(hash as NavItem)) {
    return { tab: hash as NavItem, projectId: null };
  }
  return { tab: 'home', projectId: null };
};

export default function App() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(getRouteInfo);
  const activeTab = routeInfo.tab;
  const activeProjectId = routeInfo.projectId;
  const [settings, setSettings] = useState<PortfolioSettings>(getSavedSettings);
  const [renderQuality] = useState(getRenderQuality);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = settings.reducedMotion || prefersReducedMotion;
  const [isNavigating, setIsNavigating] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<NavItem>>(() => new Set([activeTab, 'projects']));
  const [transitionFrom, setTransitionFrom] = useState<NavItem | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<NavItem | null>(null);
  const activeTabRef = useRef(activeTab);
  const isTransitioningRef = useRef(false);
  const preparationFrameRef = useRef<number | null>(null);

  // Sync settings and HTML dark class
  const handleUpdateSettings = useCallback((patch: Partial<PortfolioSettings>) => {
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
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Dynamic Web Title matching active navbar section or project detail
  useEffect(() => {
    if (activeProjectId) {
      const project = getProjectById(activeProjectId);
      document.title = project ? `AxelS27 - ${project.title}` : 'AxelS27 - Project Detail';
      return;
    }

    const titleMap: Record<NavItem, string> = {
      home: 'AxelS27 - Home',
      timeline: 'AxelS27 - Timeline',
      projects: 'AxelS27 - Projects',
      archive: 'AxelS27 - Archive',
      certificates: 'AxelS27 - Certificates',
      connect: 'AxelS27 - Connect',
    };
    if (typeof document !== 'undefined') {
      document.title = titleMap[activeTab] || 'AxelS27 - Home';
    }
  }, [activeTab, activeProjectId]);

  // Sync tab change with URL Hash without page reload
  const commitTabChange = useCallback((newTab: NavItem, syncHistory = true) => {
    activeTabRef.current = newTab;
    setRouteInfo({ tab: newTab, projectId: null });

    if (!syncHistory) return;

    const targetHash = newTab === 'home' ? '' : `#${newTab}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(
        null,
        '',
        targetHash || window.location.pathname + window.location.search
      );
    }
  }, []);

  const handleSelectProject = useCallback((projectId: string) => {
    setRouteInfo({ tab: 'projects', projectId });
    const targetUrl = `/projects/${projectId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
  }, []);

  const handleBackToProjects = useCallback(() => {
    setRouteInfo({ tab: 'projects', projectId: null });
    const targetUrl = '/#projects';
    if (window.location.pathname !== '/' || window.location.hash !== '#projects') {
      window.history.pushState(null, '', targetUrl);
    }
  }, []);

  // Wheel navigation pre-paints the destination for two frames. Direct navigation
  // can interrupt an in-flight glide and commits immediately for responsive controls.
  const triggerSectionChange = useCallback((
    newTab: NavItem,
    syncHistory = true,
    immediate = false,
  ) => {
    if (newTab === activeTabRef.current) return;
    if (isTransitioningRef.current && !immediate) return;

    if (preparationFrameRef.current !== null) {
      window.cancelAnimationFrame(preparationFrameRef.current);
      preparationFrameRef.current = null;
    }

    const fromTab = activeTabRef.current;
    isTransitioningRef.current = true;
    markNavigationStart();
    setVisitedTabs((visited) => {
      if (visited.has(newTab)) return visited;
      const next = new Set(visited);
      next.add(newTab);
      return next;
    });
    setIsNavigating(true);
    setTransitionFrom(fromTab);
    setTransitionTarget(newTab);

    prefetchSectionBackground(newTab);
    if (newTab !== 'home' && newTab !== 'connect') {
      prefetchSection(newTab);
    }

    // Warm the next likely destination while the current transition is still cheap.
    if (newTab === 'home') {
      prefetchSection('timeline');
      prefetchSection('archive');
    } else if (newTab === 'timeline') {
      prefetchSection('projects');
    } else if (newTab === 'projects') {
      prefetchSection('archive');
      prefetchSection('certificates');
    } else if (newTab === 'archive') {
      prefetchSection('projects');
      prefetchSection('certificates');
    }

    if (immediate) {
      commitTabChange(newTab, syncHistory);
      return;
    }

    preparationFrameRef.current = window.requestAnimationFrame(() => {
      preparationFrameRef.current = window.requestAnimationFrame(() => {
        preparationFrameRef.current = null;
        commitTabChange(newTab, syncHistory);
      });
    });
  }, [commitTabChange]);

  const handleCameraAnimationComplete = useCallback(() => {
    if (!isTransitioningRef.current || activeTabRef.current !== transitionTarget) return;

    isTransitioningRef.current = false;
    measureNavigation();
    setIsNavigating(false);
    setTransitionFrom(null);
    setTransitionTarget(null);
  }, [transitionTarget]);

  const handleTimelineEnd = useCallback(
    () => triggerSectionChange('projects'),
    [triggerSectionChange],
  );
  const handleTimelineStart = useCallback(
    () => triggerSectionChange('home'),
    [triggerSectionChange],
  );
  const handleProjectsEnd = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );
  const handleProjectsStart = useCallback(
    () => triggerSectionChange('timeline'),
    [triggerSectionChange],
  );
  const handleArchiveStart = useCallback(
    () => triggerSectionChange('projects'),
    [triggerSectionChange],
  );
  const handleArchiveAppSelect = useCallback((appId: ArchiveAppId) => {
    if (appId === 'certificates') {
      triggerSectionChange('certificates');
    } else if (appId === 'connect') {
      triggerSectionChange('connect');
    }
  }, [triggerSectionChange]);
  const handleCertificatesTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );

  useEffect(() => startPerformanceMonitoring(), []);

  useEffect(() => () => {
    if (preparationFrameRef.current !== null) {
      window.cancelAnimationFrame(preparationFrameRef.current);
    }
  }, []);

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
    const handleRouteSync = () => {
      const nextRoute = getRouteInfo();
      setRouteInfo(nextRoute);
      if (!nextRoute.projectId && nextRoute.tab !== activeTabRef.current) {
        triggerSectionChange(nextRoute.tab, false, true);
      }
    };

    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
    };
  }, [triggerSectionChange]);

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
      }
    } else if (activeTab === 'connect') {
      if (e.deltaY < -25) {
        // Scrolling up glides North to Timeline
        triggerSectionChange('timeline');
      }
    }
  };

  // Map each tab to 2D camera coordinates with GPU-accelerated percentage matrices
  const getCameraCoordinates = () => {
    switch (activeTab) {
      case 'timeline':
        return { x: '-100%', y: '0%' };
      case 'projects':
        return { x: '0%', y: '-100%' };
      case 'archive':
        return { x: '100%', y: '0%' };
      case 'certificates':
        return { x: '100%', y: '-100%' };
      case 'connect':
        return { x: '-100%', y: '-100%' };
      case 'home':
      default:
        return { x: '0%', y: '0%' };
    }
  };

  const coords = getCameraCoordinates();
  const isSectionRendered = (tab: NavItem) =>
    tab === activeTab || tab === transitionFrom || tab === transitionTarget;
  const isBackgroundLive = (tab: NavItem) =>
    settings.ambientParallax &&
    renderQuality !== 'reduced' &&
    !shouldReduceMotion &&
    isSectionRendered(tab);

  return (
    <ErrorBoundary>
      {activeProjectId ? (
        <div className="project-detail-scroll-container fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden bg-[#FAF8F5] dark:bg-[#121110] z-50">
          <Suspense fallback={<CanvasSectionSkeleton />}>
            <ProjectDetailPage
              projectId={activeProjectId}
              onBack={handleBackToProjects}
              onSelectProject={handleSelectProject}
            />
          </Suspense>
        </div>
      ) : (
        <div
          onWheel={handleGlobalWheel}
          className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5]"
        >
          {/* Floating Centered Apple Frosted Glass Navbar */}
          <Navbar
            activeTab={activeTab}
            onTabChange={(tab) => triggerSectionChange(tab, true, true)}
          />

          {/* 2D Spatial Canvas World with GPU Off-Thread Transform Acceleration */}
          <motion.div
            initial={{ x: coords.x, y: coords.y }}
            animate={{
              x: coords.x,
              y: coords.y,
            }}
            transition={{
              duration: shouldReduceMotion ? 0.25 : 1.6,
              ease: shouldReduceMotion ? 'easeOut' : [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={handleCameraAnimationComplete}
            className={`canvas-quality-${renderQuality} absolute inset-0 w-full h-full bg-[#161412] transform-gpu ${
              isNavigating ? 'canvas-world--moving will-change-transform' : ''
            }`}
          >
            {/* ================= 1. HOME SECTION (Center: 0, 0) ================= */}
            <div className="spatial-section absolute left-0 top-0 w-screen h-screen overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('home') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/home.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/home-960.webp')} 960w, ${getAssetUrl('/images/tantalize/home-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/home.webp')} 1672w`}
                  sizes="106vw"
                  alt="Home Background"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
              </div>

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
            <div className="spatial-section absolute left-[100vw] top-0 w-screen h-screen overflow-hidden z-10 flex items-center justify-center">
              {/* Background Image with Ultra-Subtle Vignette */}
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('timeline') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/timeline.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/timeline-960.webp')} 960w, ${getAssetUrl('/images/tantalize/timeline-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/timeline.webp')} 1672w`}
                  sizes="106vw"
                  alt="Timeline Background"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Vertical Cylindrical Roller Wheel Component (Code-Split with Suspense) */}
              {visitedTabs.has('timeline') && (
                <Suspense fallback={<CanvasSectionSkeleton />}>
                  <TimelineRoller
                    isActive={isSectionRendered('timeline')}
                    onReachEnd={handleTimelineEnd}
                    onReachStart={handleTimelineStart}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 3. PROJECTS SECTION (South: 0, +100vh) ================= */}
            <div className="spatial-section absolute left-0 top-[100vh] w-screen h-screen overflow-hidden z-10 flex items-center justify-center">
              {/* Background Image with Subtle Vignette */}
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('projects') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/projects.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/projects-960.webp')} 960w, ${getAssetUrl('/images/tantalize/projects-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/projects.webp')} 1672w`}
                  sizes="106vw"
                  alt="Projects Background"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* 3D Cube Projects Grid (Code-Split with Suspense) */}
              {visitedTabs.has('projects') && (
                <Suspense fallback={<CanvasSectionSkeleton />}>
                  <ProjectsGrid
                    isActive={isSectionRendered('projects')}
                    onReachEnd={handleProjectsEnd}
                    onReachStart={handleProjectsStart}
                    onSelectProject={handleSelectProject}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 4. ARCHIVE SECTION (West: -100vw, 0) ================= */}
            <div className="spatial-section absolute left-[-100vw] top-0 w-screen h-screen overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('archive') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/archives.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/archives-960.webp')} 960w, ${getAssetUrl('/images/tantalize/archives-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/archives.webp')} 1671w`}
                  sizes="106vw"
                  alt="Archive Background"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* macOS Launchpad / App Hub (Code-Split with Suspense) */}
              {visitedTabs.has('archive') && (
                <Suspense fallback={<CanvasSectionSkeleton />}>
                  <ArchiveHub
                    isActive={isSectionRendered('archive')}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onAppSelect={handleArchiveAppSelect}
                    onReachStart={handleArchiveStart}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 5. CONNECT SECTION (Bottom-Right: +100vw, +100vh) ================= */}
            <div className="spatial-section absolute left-[100vw] top-[100vh] w-screen h-screen overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('connect') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/connect.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/connect-960.webp')} 960w, ${getAssetUrl('/images/tantalize/connect-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/connect.webp')} 1672w`}
                  sizes="106vw"
                  alt="Connect Background"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>
            </div>

            {/* ================= 6. CERTIFICATES SECTION (Bottom-Left: -100vw, +100vh) ================= */}
            <div className="spatial-section absolute left-[-100vw] top-[100vh] w-screen h-screen overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6vh)] ${
                  isBackgroundLive('certificates') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                <img
                  src={getAssetUrl('/images/tantalize/certificates.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/certificates-960.webp')} 960w, ${getAssetUrl('/images/tantalize/certificates-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/certificates.webp')} 1672w`}
                  sizes="106vw"
                  alt="Certificates Background"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* Interactive 3D Spatial Coverflow Carousel (Code-Split with Suspense) */}
              {visitedTabs.has('certificates') && (
                <Suspense fallback={<CanvasSectionSkeleton />}>
                  <CertificatesCoverflow
                    isActive={isSectionRendered('certificates')}
                    onReachTop={handleCertificatesTop}
                  />
                </Suspense>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </ErrorBoundary>
  );
}

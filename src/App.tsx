import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Navbar, type NavItem } from './components/Navbar';
import { type PortfolioSettings, getSavedSettings, hasSeenThemeEntrance, markThemeEntranceSeen } from './lib/settings';
import ThemeEntrance from './components/ThemeEntrance';
import { getAssetUrl } from './lib/assets';
import { getRenderQuality } from './lib/deviceQuality';
import {
  markNavigationStart,
  measureNavigation,
  startPerformanceMonitoring,
} from './lib/performanceMonitor';
import ErrorBoundary from './components/common/ErrorBoundary';
import TimelineRollerSkeleton from './components/skeletons/TimelineRollerSkeleton';
import ProjectsGridSkeleton from './components/skeletons/ProjectsGridSkeleton';
import ArchiveHubSkeleton from './components/skeletons/ArchiveHubSkeleton';
import CertificatesCoverflowSkeleton from './components/skeletons/CertificatesCoverflowSkeleton';
import ConnectHubSkeleton from './components/skeletons/ConnectHubSkeleton';
import StoryBookSkeleton from './components/skeletons/StoryBookSkeleton';
import ProjectDetailSkeleton from './components/skeletons/ProjectDetailSkeleton';
import RepertoireGridSkeleton from './components/skeletons/RepertoireGridSkeleton';
import WatchlistGridSkeleton from './components/skeletons/WatchlistGridSkeleton';
import type { ArchiveAppId } from './components/ArchiveHub';
import { prefetchSection, prefetchSectionBackground } from './lib/prefetch';
import { getProjectById } from './data/projects';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { INTRO_MUSIC_TRACK, MUSIC_TRACKS } from './lib/music';

// Lazy-loaded code-split section chunks
const TimelineRoller = lazy(() =>
  import('./components/TimelineRoller').then((m) => ({ default: m.TimelineRoller }))
);
const ProjectsGrid = lazy(() =>
  import('./components/ProjectsGrid').then((m) => ({ default: m.ProjectsGrid }))
);
const StoryBook = lazy(() =>
  import('./components/StoryBook').then((m) => ({ default: m.StoryBook }))
);
const ArchiveHub = lazy(() =>
  import('./components/ArchiveHub').then((m) => ({ default: m.ArchiveHub }))
);
const RepertoireGrid = lazy(() =>
  import('./components/RepertoireGrid').then((m) => ({ default: m.RepertoireGrid }))
);
const WatchlistGrid = lazy(() =>
  import('./components/WatchlistGrid').then((m) => ({ default: m.WatchlistGrid }))
);
const CertificatesCoverflow = lazy(() =>
  import('./components/CertificatesCoverflow').then((m) => ({ default: m.CertificatesCoverflow }))
);
const ConnectHub = lazy(() =>
  import('./components/ConnectHub').then((m) => ({ default: m.ConnectHub }))
);
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
);

// Serve the local copy if CDN artwork is temporarily unavailable.
const fallbackToLocalArtwork = (image: HTMLImageElement, path: string) => {
  if (image.src === new URL(path, window.location.href).href) return;
  image.srcset = '';
  image.src = path;
};

const validTabs: NavItem[] = ['home', 'storybook', 'timeline', 'projects', 'archive', 'repertoire', 'watchlist', 'certificates', 'connect'];

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

  if (hash === 'repertoire' || hash === 'archive/repertoire') {
    return { tab: 'repertoire', projectId: null };
  }
  if (hash === 'watchlist' || hash === 'archive/watchlist') {
    return { tab: 'watchlist', projectId: null };
  }
  if (hash === 'certificates' || hash === 'certificate' || hash === 'archive/certificates') {
    return { tab: 'certificates', projectId: null };
  }
  if (hash === 'connect' || hash === 'archive/connect') {
    return { tab: 'connect', projectId: null };
  }
  if (hash === 'storybook' || hash === 'story' || hash === 'archive/storybook') {
    return { tab: 'storybook', projectId: null };
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
  const [entryPhase, setEntryPhase] = useState<'choosing' | 'quote' | 'entering' | 'ready'>(() =>
    hasSeenThemeEntrance() ? 'ready' : 'choosing'
  );
  const portfolioRef = useRef<HTMLDivElement>(null);
  const didChooseThemeRef = useRef(false);
  const music = useBackgroundMusic(settings, entryPhase === 'choosing' ? INTRO_MUSIC_TRACK : undefined);
  const [renderQuality] = useState(getRenderQuality);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = settings.reducedMotion || prefersReducedMotion;
  const [isNavigating, setIsNavigating] = useState(false);
  const [isStoryBookReading, setIsStoryBookReading] = useState(false);
  const [storyBookCloseRequest, setStoryBookCloseRequest] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<NavItem>>(() => new Set([activeTab]));
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
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.style.setProperty('--glass-opacity', String(settings.glassOpacity / 100));
  }, [settings.theme, settings.glassOpacity]);

  const handleChooseTheme = useCallback((theme: PortfolioSettings['theme']) => {
    handleUpdateSettings({ theme });
    didChooseThemeRef.current = true;
    setEntryPhase('quote');
  }, [handleUpdateSettings]);

  const handleEntryComplete = useCallback(() => setEntryPhase('entering'), []);
  const handleEntryExitComplete = useCallback(() => {
    if (didChooseThemeRef.current) markThemeEntranceSeen();
    setEntryPhase('ready');
  }, []);

  useEffect(() => {
    if (entryPhase === 'ready' && didChooseThemeRef.current) {
      portfolioRef.current?.focus({ preventScroll: true });
      didChooseThemeRef.current = false;
    }
  }, [entryPhase]);

  // Keep metadata in sync for client-side navigation as well as static deep links.
  useEffect(() => {
    const project = getProjectById(activeProjectId ?? undefined);
    const titleMap: Record<NavItem, string> = {
      home: 'AxelS27 - Home',
      storybook: 'AxelS27 - Story Book',
      timeline: 'AxelS27 - Timeline',
      projects: 'AxelS27 - Projects',
      archive: 'AxelS27 - Archive',
      repertoire: 'AxelS27 - Repertoire',
      watchlist: 'AxelS27 - Watchlist',
      certificates: 'AxelS27 - Certificates',
      connect: 'AxelS27 - Connect',
    };
    const title = project ? `AxelS27 - ${project.title}` : titleMap[activeTab];
    const description = project?.description ?? 'Farrell Axel Suwandi is an AI researcher and software engineer based in Jakarta. He enjoys playing piano, coding, and watching movies.';
    const url = project ? `https://www.liemaxels.com/projects/${project.id}` : 'https://www.liemaxels.com/';
    const image = project ? getAssetUrl(project.thumbnail) : getAssetUrl('/images/tantalize/home.webp');
    document.title = title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url);
    const meta: Record<string, string> = {
      'og:type': project ? 'article' : 'website',
      'og:title': title, 'og:description': description, 'og:url': url, 'og:image': image,
      'twitter:title': title, 'twitter:description': description, 'twitter:image': image,
    };
    for (const [key, value] of Object.entries(meta)) {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)?.setAttribute('content', value);
    }
    let jsonLd = document.getElementById('project-jsonld');
    if (project) {
      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.id = 'project-jsonld';
        jsonLd.setAttribute('type', 'application/ld+json');
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'CreativeWork',
        name: project.title, description, image, url,
        author: { '@type': 'Person', name: 'Farrell Axel Suwandi' },
      });
    } else {
      jsonLd?.remove();
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
    // On mobile, section changes come from the dock, app links, or browser history,
    // not from scrolling past the edge of a section or carousel.
    if (!immediate && window.matchMedia('(max-width: 767px)').matches) return;
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
    if (newTab !== 'home') {
      prefetchSection(newTab);
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

  const handleStoryBookTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );
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
      triggerSectionChange('certificates', true, true);
    } else if (appId === 'connect') {
      triggerSectionChange('connect', true, true);
    } else if (appId === 'storybook') {
      triggerSectionChange('storybook', true, true);
    } else if (appId === 'repertoire') {
      triggerSectionChange('repertoire', true, true);
    } else if (appId === 'watchlist') {
      triggerSectionChange('watchlist', true, true);
    }
  }, [triggerSectionChange]);
  const handleRepertoireTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );
  const handleWatchlistTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );
  const handleCertificatesTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );
  const handleConnectTop = useCallback(
    () => triggerSectionChange('archive'),
    [triggerSectionChange],
  );

  useEffect(() => startPerformanceMonitoring(), []);

  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(viewport.matches);
    viewport.addEventListener('change', updateViewport);
    return () => viewport.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => () => {
    if (preparationFrameRef.current !== null) {
      window.cancelAnimationFrame(preparationFrameRef.current);
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
    } else if (activeTab === 'storybook') {
      if (e.deltaY < -25) {
        triggerSectionChange('archive');
      }
    } else if (activeTab === 'certificates') {
      if (e.deltaY < -25) {
        // Scrolling up glides back to Archive Hub
        triggerSectionChange('archive');
      }
    } else if (activeTab === 'connect') {
      if (e.deltaY < -25) {
        // Scrolling up glides back to Archive Hub
        triggerSectionChange('archive');
      }
    }
  };

  // Map each tab to 2D camera coordinates with GPU-accelerated percentage matrices
  const getCameraCoordinates = () => {
    switch (activeTab) {
      case 'storybook':
        return { x: '-100%', y: '100%' };
      case 'timeline':
        return { x: '-100%', y: '0%' };
      case 'projects':
        return { x: '0%', y: '-100%' };
      case 'archive':
        return { x: '100%', y: '0%' };
      case 'repertoire':
        return { x: '100%', y: '100%' };
      case 'watchlist':
        return { x: '0%', y: '100%' };
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
  const currentTrack = MUSIC_TRACKS.find((track) => track.id === music.trackId);
  const isSectionRendered = (tab: NavItem) =>
    tab === activeTab || tab === transitionFrom || tab === transitionTarget;
  // Only decode visible artwork on mobile; desktop retains the full panorama.
  const shouldMountBackground = (tab: NavItem) => !isMobileViewport || isSectionRendered(tab);
  const isBackgroundLive = (tab: NavItem) =>
    entryPhase === 'ready' &&
    settings.ambientParallax &&
    !isMobileViewport &&
    renderQuality !== 'reduced' &&
    !shouldReduceMotion &&
    isSectionRendered(tab);

  return (
    <ErrorBoundary>
      <AnimatePresence onExitComplete={handleEntryExitComplete}>
        {(entryPhase === 'choosing' || entryPhase === 'quote') && (
          <ThemeEntrance
            key="theme-entrance"
            onChoose={handleChooseTheme}
            onComplete={handleEntryComplete}
            reducedMotion={!!shouldReduceMotion}
          />
        )}
      </AnimatePresence>
      <div
        ref={portfolioRef}
        tabIndex={-1}
        inert={entryPhase !== 'ready'}
        aria-hidden={entryPhase !== 'ready'}
        className="w-screen h-dvh outline-none"
      >
      {entryPhase !== 'choosing' && <>
      <AnimatePresence>
        {music.status === 'playing' && currentTrack && (
          <motion.p
            key={currentTrack.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            role="status"
            aria-label={`${currentTrack.title} is playing`}
            className={`pointer-events-none fixed z-[60] flex gap-1 font-serif italic text-xs sm:text-sm text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.95),0_2px_18px_rgba(0,0,0,0.8)] ${
              activeTab === 'storybook'
                ? 'left-1/2 -translate-x-1/2 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] max-w-[calc(100vw-3rem)] justify-center spacious:left-auto spacious:right-6 spacious:translate-x-0 spacious:bottom-6 spacious:justify-end'
                : 'right-4 sm:right-6 bottom-[calc(8.25rem+env(safe-area-inset-bottom))] spacious:bottom-6 max-w-[calc(100vw-2rem)]'
            }}`}
          >
            <span aria-hidden="true" className="min-w-0 truncate">{currentTrack.title}</span>
            <span aria-hidden="true" className="shrink-0">is playing</span>
          </motion.p>
        )}
      </AnimatePresence>
      {activeProjectId ? (
        <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#121110]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <img
              src={getAssetUrl('/images/tantalize/project-detail-bg.webp')}
              srcSet={`${getAssetUrl('/images/tantalize/project-detail-bg-960.webp')} 960w, ${getAssetUrl('/images/tantalize/project-detail-bg-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/project-detail-bg.webp')} 1672w`}
              sizes="100vw"
              onError={(e) => fallbackToLocalArtwork(e.currentTarget, '/images/tantalize/project-detail-bg.webp')}
              alt=""
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20" />
          </div>
          <div className="project-detail-scroll-container absolute inset-0 z-10 overflow-y-scroll overflow-x-hidden">
            <Suspense fallback={<ProjectDetailSkeleton />}>
              <ProjectDetailPage
                projectId={activeProjectId}
                onBack={handleBackToProjects}
                onSelectProject={handleSelectProject}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <div
          onWheel={handleGlobalWheel}
          className="relative w-screen h-dvh overflow-hidden bg-[#FAF8F5]"
        >
          {/* Desktop glass navbar and mobile bottom dock */}
          <Navbar
            activeTab={activeTab}
            mobileBackAction={activeTab === 'storybook' && isStoryBookReading ? {
              label: 'Return to Shelf',
              onClick: () => setStoryBookCloseRequest((request) => request + 1),
            } : undefined}
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
              duration: shouldReduceMotion ? 0.25 : isMobileViewport ? 0.55 : 1.6,
              ease: shouldReduceMotion ? 'easeOut' : [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={handleCameraAnimationComplete}
            className={`canvas-quality-${renderQuality} absolute inset-0 w-full h-full bg-[#161412] transform-gpu ${
              isNavigating ? 'canvas-world--moving will-change-transform' : ''
            }`}
          >
            {/* ================= 1. HOME SECTION (Center: 0, 0) ================= */}
            <div className="spatial-section absolute left-0 top-0 w-screen h-dvh overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('home') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('home') && <img
                  src={getAssetUrl('/images/tantalize/home.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/home-960.webp')} 960w, ${getAssetUrl('/images/tantalize/home-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/home.webp')} 1672w`}
                  sizes="106vw"
                  alt="Home Background"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
              </div>

              {/* Upper-Left Editorial Identity */}
              <div className="absolute top-[23%] spacious:top-[27%] left-0 right-0 spacious:left-20 spacious:right-auto z-20 pointer-events-auto space-y-2 spacious:space-y-2.5 px-4 spacious:px-0 max-w-5xl text-center spacious:text-left select-text">
                {/* Line 1: Name */}
                <h1
                  className="font-serif italic text-[clamp(1.8rem,8.5vw,3.75rem)] spacious:text-8xl text-white tracking-tight font-light leading-none spacious:whitespace-nowrap"
                  style={{
                    textShadow: '0 2px 12px rgba(0,0,0,0.85), 0 8px 32px rgba(0,0,0,0.65)',
                  }}
                >
                  Farrell Axel Suwandi
                </h1>

                {/* Line 2: Role (Antique Gold) */}
                <p
                  className="font-serif italic text-[clamp(0.95rem,4vw,1.25rem)] spacious:text-3xl text-[#E8C582] tracking-wide font-normal [-webkit-text-stroke:0.35px_#E8C582] spacious:[-webkit-text-stroke:0] spacious:whitespace-nowrap"
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.65)',
                  }}
                >
                  AI Researcher & Software Engineer
                </p>

                {/* Line 3: Age & Location */}
                <div
                  className="flex items-center justify-center spacious:justify-start gap-2.5 spacious:gap-3 font-serif italic text-sm spacious:text-xl text-stone-100/90 tracking-wide font-light whitespace-nowrap"
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
                  className="font-serif italic text-sm spacious:text-xl text-stone-100/85 tracking-wide font-light pt-0.5"
                  style={{
                    textShadow: '0 1px 8px rgba(0,0,0,0.85), 0 3px 14px rgba(0,0,0,0.6)',
                  }}
                >
                  love to playing piano, coding, and watching movies
                </p>
              </div>
            </div>

            {/* ================= STORY BOOK SECTION (North-East: +100vw, -100dvh) ================= */}
            <div className="spatial-section absolute left-[100vw] top-[-100dvh] w-screen h-dvh overflow-hidden z-10 flex items-center justify-center">
              {/* Background Image with Ambient Parallax */}
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('storybook') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('storybook') && <img
                  src={getAssetUrl('/images/tantalize/storybook.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/storybook-960.webp')} 960w, ${getAssetUrl('/images/tantalize/storybook-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/storybook.webp')} 1672w`}
                  sizes="106vw"
                  onError={(e) => fallbackToLocalArtwork(e.currentTarget, '/images/tantalize/storybook.webp')}
                  alt="Story Book Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20 pointer-events-none" />
              </div>

              {/* Story Book Section (Code-Split with Suspense) */}
              {visitedTabs.has('storybook') && (
                <Suspense fallback={<StoryBookSkeleton />}>
                  <StoryBook
                    isActive={entryPhase === 'ready' && isSectionRendered('storybook')}
                    onReachTop={handleStoryBookTop}
                    onReaderChange={setIsStoryBookReading}
                    closeRequest={storyBookCloseRequest}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 2. TIMELINE SECTION (East: +100vw, 0) ================= */}
            <div className="spatial-section absolute left-[100vw] top-0 w-screen h-dvh overflow-hidden z-10 flex items-center justify-center">
              {/* Background Image with Ultra-Subtle Vignette */}
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('timeline') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('timeline') && <img
                  src={getAssetUrl('/images/tantalize/timeline.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/timeline-960.webp')} 960w, ${getAssetUrl('/images/tantalize/timeline-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/timeline.webp')} 1672w`}
                  sizes="106vw"
                  alt="Timeline Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Vertical Cylindrical Roller Wheel Component (Code-Split with Suspense) */}
              {visitedTabs.has('timeline') && (
                <Suspense fallback={<TimelineRollerSkeleton />}>
                  <TimelineRoller
                    isActive={entryPhase === 'ready' && isSectionRendered('timeline')}
                    onReachEnd={handleTimelineEnd}
                    onReachStart={handleTimelineStart}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 3. PROJECTS SECTION (South: 0, +100dvh) ================= */}
            <div className="spatial-section absolute left-0 top-[100dvh] w-screen h-dvh overflow-hidden z-10 flex items-center justify-center">
              {/* Background Image with Subtle Vignette */}
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('projects') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('projects') && <img
                  src={getAssetUrl('/images/tantalize/projects.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/projects-960.webp')} 960w, ${getAssetUrl('/images/tantalize/projects-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/projects.webp')} 1672w`}
                  sizes="106vw"
                  alt="Projects Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* 3D Cube Projects Grid (Code-Split with Suspense) */}
              {visitedTabs.has('projects') && (
                <Suspense fallback={<ProjectsGridSkeleton />}>
                  <ProjectsGrid
                    isActive={entryPhase === 'ready' && isSectionRendered('projects')}
                    onReachEnd={handleProjectsEnd}
                    onReachStart={handleProjectsStart}
                    onSelectProject={handleSelectProject}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 4. ARCHIVE SECTION (West: -100vw, 0) ================= */}
            <div className="spatial-section absolute left-[-100vw] top-0 w-screen h-dvh overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('archive') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('archive') && <img
                  src={getAssetUrl('/images/tantalize/archives.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/archives-960.webp')} 960w, ${getAssetUrl('/images/tantalize/archives-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/archives.webp')} 1671w`}
                  sizes="106vw"
                  alt="Archive Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* macOS Launchpad / App Hub (Code-Split with Suspense) */}
              {visitedTabs.has('archive') && (
                <Suspense fallback={<ArchiveHubSkeleton />}>
                  <ArchiveHub
                    isActive={entryPhase === 'ready' && isSectionRendered('archive')}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    musicStatus={music.status}
                    currentTrackId={music.trackId}
                    onSkipTrack={music.skipTrack}
                    onRetryPlayback={music.retryPlayback}
                    onAppSelect={handleArchiveAppSelect}
                    onReachStart={handleArchiveStart}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= REPERTOIRE SECTION (North-West: -100vw, -100dvh) ================= */}
            <div className="spatial-section absolute left-[-100vw] top-[-100dvh] w-screen h-dvh overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('repertoire') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('repertoire') && <img
                  src={getAssetUrl('/images/tantalize/repertoire.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/repertoire-960.webp')} 960w, ${getAssetUrl('/images/tantalize/repertoire-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/repertoire.webp')} 1672w`}
                  sizes="106vw"
                  onError={(e) => fallbackToLocalArtwork(e.currentTarget, '/images/tantalize/repertoire.webp')}
                  alt="Repertoire concert hall background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
              </div>
              {visitedTabs.has('repertoire') && (
                <Suspense fallback={<RepertoireGridSkeleton />}>
                  <RepertoireGrid
                    isActive={entryPhase === 'ready' && isSectionRendered('repertoire')}
                    onReachTop={handleRepertoireTop}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= WATCHLIST SECTION (North: 0, -100dvh) ================= */}
            <div className="spatial-section absolute left-0 top-[-100dvh] w-screen h-dvh overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('watchlist') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('watchlist') && <img
                  src={getAssetUrl('/images/tantalize/watchlist.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/watchlist-960.webp')} 960w, ${getAssetUrl('/images/tantalize/watchlist-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/watchlist.webp')} 1672w`}
                  sizes="106vw"
                  onError={(e) => fallbackToLocalArtwork(e.currentTarget, '/images/tantalize/watchlist.webp')}
                  alt="Watchlist theater background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
              </div>
              {visitedTabs.has('watchlist') && (
                <Suspense fallback={<WatchlistGridSkeleton />}>
                  <WatchlistGrid
                    isActive={entryPhase === 'ready' && isSectionRendered('watchlist')}
                    onReachTop={handleWatchlistTop}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 5. CONNECT SECTION (Bottom-Right: +100vw, +100dvh) ================= */}
            <div className="spatial-section absolute left-[100vw] top-[100dvh] w-screen h-dvh overflow-hidden z-10 flex items-center justify-center">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('connect') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('connect') && <img
                  src={getAssetUrl('/images/tantalize/connect.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/connect-960.webp')} 960w, ${getAssetUrl('/images/tantalize/connect-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/connect.webp')} 1672w`}
                  sizes="106vw"
                  alt="Connect Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* Social & Communication Hub (Code-Split with Suspense) */}
              {visitedTabs.has('connect') && (
                <Suspense fallback={<ConnectHubSkeleton />}>
                  <ConnectHub
                    isActive={entryPhase === 'ready' && isSectionRendered('connect')}
                    onReachTop={handleConnectTop}
                  />
                </Suspense>
              )}
            </div>

            {/* ================= 6. CERTIFICATES SECTION (Bottom-Left: -100vw, +100dvh) ================= */}
            <div className="spatial-section absolute left-[-100vw] top-[100dvh] w-screen h-dvh overflow-hidden z-10">
              <div
                className={`ambient-canvas-background absolute -inset-[3vw] w-[calc(100%+6vw)] h-[calc(100%+6dvh)] ${
                  isBackgroundLive('certificates') ? 'ambient-canvas-background--live' : ''
                } ${isNavigating ? 'ambient-canvas-background--paused' : ''}`}
              >
                {shouldMountBackground('certificates') && <img
                  src={getAssetUrl('/images/tantalize/certificates.webp')}
                  srcSet={`${getAssetUrl('/images/tantalize/certificates-960.webp')} 960w, ${getAssetUrl('/images/tantalize/certificates-1280.webp')} 1280w, ${getAssetUrl('/images/tantalize/certificates.webp')} 1672w`}
                  sizes="106vw"
                  alt="Certificates Background"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none"
                />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-black/20 pointer-events-none" />
              </div>

              {/* Interactive 3D Spatial Coverflow Carousel (Code-Split with Suspense) */}
              {visitedTabs.has('certificates') && (
                <Suspense fallback={<CertificatesCoverflowSkeleton />}>
                  <CertificatesCoverflow
                    isActive={entryPhase === 'ready' && isSectionRendered('certificates')}
                    onReachTop={handleCertificatesTop}
                  />
                </Suspense>
              )}
            </div>

          </motion.div>
        </div>
      )}
      </>}
      </div>
    </ErrorBoundary>
  );
}

/**
 * Smart Canvas Section & Route Prefetching Engine
 * Mirroring D:/Coding/Portofolio architecture
 * 
 * Provides safe, intent-aware preloading of code-split section chunks.
 * Features:
 * - Single-execution deduplication
 * - Data Saver / Slow connection awareness (Save-Data header, 2G)
 * - Hover Intent Detection (configurable debounce, default 60ms)
 * - PointerDown / TouchStart immediate preload
 */

export type PrefetchSectionKey =
  | 'timeline'
  | 'projects'
  | 'archive'
  | 'certificates';

export type CanvasBackgroundKey = PrefetchSectionKey | 'home' | 'connect';

const sectionLoaders: Record<PrefetchSectionKey, () => Promise<unknown>> = {
  timeline: () => import('../components/TimelineRoller'),
  projects: () => import('../components/ProjectsGrid'),
  archive: () => import('../components/ArchiveHub'),
  certificates: () => import('../components/CertificatesCoverflow'),
};

const prefetchedSections = new Set<string>();
const prefetchedBackgrounds = new Set<CanvasBackgroundKey>();
const hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();

const backgroundPaths: Record<CanvasBackgroundKey, string> = {
  home: '/images/backgrounds/home.webp',
  timeline: '/images/backgrounds/timeline.webp',
  projects: '/images/backgrounds/projects.webp',
  archive: '/images/backgrounds/archives.webp',
  certificates: '/images/backgrounds/certificates.webp',
  connect: '/images/backgrounds/connect.webp',
};

/** Starts fetching and decoding a canvas background before the camera needs it. */
export function prefetchSectionBackground(key: CanvasBackgroundKey): void {
  if (typeof window === 'undefined' || prefetchedBackgrounds.has(key) || shouldSkipPrefetch()) return;

  prefetchedBackgrounds.add(key);
  const image = new Image();
  const source = backgroundPaths[key];
  const stem = source.slice(0, -5);
  image.decoding = 'async';
  image.srcset = `${stem}-960.webp 960w, ${stem}-1280.webp 1280w, ${source} 1672w`;
  image.sizes = '106vw';
  image.src = source;
  image.decode?.().catch(() => {
    prefetchedBackgrounds.delete(key);
  });
}

/**
 * Checks if the user's browser/network prefers reduced data usage
 */
function shouldSkipPrefetch(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return true;

  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn) {
    if (conn.saveData) return true;
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return true;
  }

  return false;
}

/**
 * Safely prefetches a section chunk in the background
 */
export function prefetchSection(key: PrefetchSectionKey): void {
  if (shouldSkipPrefetch()) return;

  prefetchSectionBackground(key);
  if (prefetchedSections.has(key)) return;
  prefetchedSections.add(key);

  const loader = sectionLoaders[key];
  if (loader) {
    loader().catch(() => {
      // If failed, allow retry later
      prefetchedSections.delete(key);
    });
  }
}

/**
 * Initiates an intent-debounced hover prefetch (default 60ms)
 */
export function startPrefetchHover(key: PrefetchSectionKey, delayMs = 60): void {
  if (prefetchedSections.has(key)) return;
  cancelPrefetchHover(key);
  const timer = setTimeout(() => {
    prefetchSection(key);
    hoverTimers.delete(key);
  }, delayMs);
  hoverTimers.set(key, timer);
}

/**
 * Cancels a pending hover prefetch if cursor leaves before intent delay
 */
export function cancelPrefetchHover(key: PrefetchSectionKey): void {
  const timer = hoverTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    hoverTimers.delete(key);
  }
}

/**
 * Generates event handlers for elements with hover intent delay & pointerdown prefetching
 */
export function getPrefetchProps(key: PrefetchSectionKey, delayMs = 60) {
  return {
    onMouseEnter: () => startPrefetchHover(key, delayMs),
    onMouseLeave: () => cancelPrefetchHover(key),
    onPointerDown: () => {
      cancelPrefetchHover(key);
      prefetchSection(key);
    },
    onTouchStart: () => {
      prefetchSection(key);
    },
  };
}

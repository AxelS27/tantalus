const NAVIGATION_START_MARK = 'tantalize-navigation-start';
const NAVIGATION_MEASURE = 'tantalize-navigation';

export function markNavigationStart(): void {
  if (!import.meta.env.DEV || typeof performance === 'undefined') return;
  performance.clearMarks(NAVIGATION_START_MARK);
  performance.mark(NAVIGATION_START_MARK);
}

export function measureNavigation(): void {
  if (!import.meta.env.DEV || typeof performance === 'undefined') return;

  try {
    performance.measure(NAVIGATION_MEASURE, NAVIGATION_START_MARK);
    const latest = performance.getEntriesByName(NAVIGATION_MEASURE).at(-1);
    if (latest) console.debug(`[performance] navigation ${latest.duration.toFixed(1)}ms`);
  } catch {
    // A navigation can complete without a mark during the initial animation.
  } finally {
    performance.clearMarks(NAVIGATION_START_MARK);
    performance.clearMeasures(NAVIGATION_MEASURE);
  }
}

export function startPerformanceMonitoring(): () => void {
  if (!import.meta.env.DEV || typeof PerformanceObserver === 'undefined') {
    return () => undefined;
  }

  const observers: PerformanceObserver[] = [];
  const observe = (type: string, minimumDuration: number) => {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= minimumDuration) {
            console.warn(
              `[performance] ${type} ${entry.duration.toFixed(1)}ms`,
              entry,
            );
          }
        }
      });
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      // Entry type is not supported by this browser.
    }
  };

  observe('longtask', 50);
  observe('long-animation-frame', 50);

  return () => observers.forEach((observer) => observer.disconnect());
}

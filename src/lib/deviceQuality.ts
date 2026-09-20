export type RenderQuality = 'high' | 'balanced' | 'reduced';

interface NavigatorCapabilities extends Navigator {
  deviceMemory?: number;
}

/**
 * Selects a conservative visual quality tier from stable device capabilities.
 * It never uses user-agent sniffing and gracefully defaults when APIs are absent.
 */
export function getRenderQuality(): RenderQuality {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'high';

  const capabilities = navigator as NavigatorCapabilities;
  const memory = capabilities.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const narrowViewport = window.matchMedia('(max-width: 767px)').matches;

  if ((memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4)) {
    return 'reduced';
  }

  if (narrowViewport || (memory !== undefined && memory < 8) || (cores !== undefined && cores <= 6)) {
    return 'balanced';
  }

  return 'high';
}

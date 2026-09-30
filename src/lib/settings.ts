import { DEFAULT_MUSIC_ORDER, normalizeMusicOrder, type MusicTrackId, type PlaybackMode } from './music';

export interface PortfolioSettings {
  theme: 'light' | 'dark';
  glassOpacity: number;
  reducedMotion: boolean;
  ambientParallax: boolean;
  interactiveTilt: boolean;
  isAudioEnabled: boolean;
  volume: number;
  playbackMode: PlaybackMode;
  musicOrder: MusicTrackId[];
}

export const DEFAULT_SETTINGS: PortfolioSettings = {
  theme: 'light',
  glassOpacity: 50,
  reducedMotion: false,
  ambientParallax: true,
  interactiveTilt: true,
  isAudioEnabled: true,
  volume: 30,
  playbackMode: 'shuffle',
  musicOrder: [...DEFAULT_MUSIC_ORDER],
};

// A separate, versioned marker lets existing visitors see the new introduction
// once without wiping their settings, bookmarks, or unrelated site data.
const THEME_ENTRANCE_KEY = 'tantalize_theme_entrance_v1';

export const hasSeenThemeEntrance = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(THEME_ENTRANCE_KEY) === 'seen';
  } catch {
    return false;
  }
};

export const markThemeEntranceSeen = (): void => {
  try {
    localStorage.setItem(THEME_ENTRANCE_KEY, 'seen');
  } catch {}
};

export const getSavedSettings = (): PortfolioSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem('tantalize_portfolio_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        volume: Number.isFinite(parsed.volume) ? Math.max(0, Math.min(100, parsed.volume)) : DEFAULT_SETTINGS.volume,
        glassOpacity: typeof parsed.glassOpacity === 'number' && Number.isFinite(parsed.glassOpacity)
          ? Math.max(0, Math.min(100, parsed.glassOpacity)) : DEFAULT_SETTINGS.glassOpacity,
        playbackMode: parsed.playbackMode === 'sequential' ? 'sequential' : 'shuffle',
        musicOrder: normalizeMusicOrder(parsed.musicOrder),
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
};

export interface PortfolioSettings {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  ambientParallax: boolean;
  interactiveTilt: boolean;
  isAudioEnabled: boolean;
  volume: number;
}

export const DEFAULT_SETTINGS: PortfolioSettings = {
  theme: 'light',
  reducedMotion: false,
  ambientParallax: true,
  interactiveTilt: true,
  isAudioEnabled: false,
  volume: 70,
};

export const getSavedSettings = (): PortfolioSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem('tantalize_portfolio_settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
};

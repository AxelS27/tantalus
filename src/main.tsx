import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';

// A tab left open across deployments may reference a chunk that no longer exists.
// Retry once with fresh HTML; keep the guard across reloads to prevent a loop.
window.addEventListener('vite:preloadError', () => {
  try {
    const key = 'tantalize-chunk-recovery';
    const lastAttempt = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - lastAttempt < 60_000) return;
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  } catch {
    // If storage is unavailable, let the error boundary handle the failure.
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.PROD && <SpeedInsights />}
  </StrictMode>,
);

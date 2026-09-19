/**
 * Cloudflare R2 / Custom CDN Asset URL Resolver
 * Mirroring D:/Coding/Portofolio architecture
 */

export const R2_BASE_URL = (import.meta.env.VITE_R2_ASSET_URL || 'https://media.liemaxels.com').replace(/\/+$/, '');

export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (R2_BASE_URL) {
    return `${R2_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
}

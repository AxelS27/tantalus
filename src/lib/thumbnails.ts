import { getAssetUrl } from './assets';

const THUMBNAIL_GROUPS = ['career-trace', 'tantalize', 'certificates'] as const;
type ThumbnailGroup = (typeof THUMBNAIL_GROUPS)[number];

const LOCAL_GROUP_NAMES: Record<ThumbnailGroup, string> = {
  'career-trace': 'career',
  tantalize: 'tantalize',
  certificates: 'certificates',
};

const DIRECT_THUMBNAIL_GROUPS: Record<string, ThumbnailGroup> = {
  career: 'career-trace',
  tantalize: 'tantalize',
  certificates: 'certificates',
};

// Only use generated card variants where they are actually available in R2.
const PROJECT_CARD_VARIANTS = new Set([
  'computational-biology-cca',
  'phylaxify',
  'brightstar',
  'nlp-gambling-detection',
  'railroad-cv',
]);

export function getProjectCardImage(id: string, original: string): string {
  return PROJECT_CARD_VARIANTS.has(id)
    ? getAssetUrl(`/images/thumbnails/projects/${id}-320.webp`)
    : original;
}

export function getProjectCardSrcSet(id: string): string | undefined {
  if (!PROJECT_CARD_VARIANTS.has(id)) return undefined;
  const base = getAssetUrl(`/images/thumbnails/projects/${id}`);
  return `${base}-320.webp 320w, ${base}-640.webp 640w`;
}

interface ThumbnailMatch {
  group: ThumbnailGroup;
  localDirectory: string;
  filename: string;
  stem: string;
}

function matchThumbnail(source: string | undefined): ThumbnailMatch | null {
  if (!source) return null;

  try {
    const pathname = new URL(source, 'https://local.invalid').pathname;
    const directDirectory = Object.keys(DIRECT_THUMBNAIL_GROUPS).find((directory) =>
      pathname.includes(`/images/thumbnails/${directory}/`),
    );
    const group = directDirectory
      ? DIRECT_THUMBNAIL_GROUPS[directDirectory]
      : THUMBNAIL_GROUPS.find((candidate) => pathname.includes(`/images/${candidate}/`));
    const filename = pathname.split('/').pop();

    if (group && filename?.endsWith('.webp')) {
      return {
        group,
        localDirectory: directDirectory || LOCAL_GROUP_NAMES[group],
        filename,
        stem: filename.slice(0, -5),
      };
    }
  } catch {
    // Preserve the original URL when it cannot be parsed.
  }

  return null;
}

/** Resolves known CDN artwork to a right-sized local card thumbnail. */
export function getThumbnailUrl(source: string | undefined): string {
  const match = matchThumbnail(source);
  return match
    ? getAssetUrl(`/images/thumbnails/${match.localDirectory}/${match.filename}`)
    : source || '';
}

/** Returns responsive local candidates while allowing unknown content to fall back. */
export function getThumbnailSrcSet(source: string | undefined): string | undefined {
  const match = matchThumbnail(source);
  if (!match) return undefined;

  const base = getAssetUrl(`/images/thumbnails/${match.localDirectory}`);
  if (match.group === 'certificates') {
    return `${base}/${match.filename} 640w, ${base}/${match.stem}-960.webp 960w`;
  }

  return `${base}/${match.filename} 320w, ${base}/${match.stem}-640.webp 640w`;
}

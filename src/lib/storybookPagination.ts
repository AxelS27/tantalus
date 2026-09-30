import type { StoryBookItem } from '../data/storybooks/types';

export interface ChapterPageEntry {
  chapterId: string;
  number: string;
  title: string;
  motif: string;
  pageNumber: number;
}

export interface TextPosition {
  paragraphIndex: number;
  offset: number;
}

export type NovelPageData =
  | { type: 'blank-cover'; pageNumber: number }
  | { type: 'frontispiece'; book: StoryBookItem; pageNumber: number }
  | { type: 'toc'; bookTitle: string; subtitle: string; chapterPageMap: ChapterPageEntry[]; pageNumber: number }
  | {
      type: 'chapter-title-leaf'; chapterId: string; chapterNumber: string; chapterTitle: string;
      subtitle: string; motif: string; theme: string; emblem?: StoryBookItem['emblem']; pageNumber: number;
    }
  | {
      type: 'chapter-narrative'; chapterId: string; chapterNumber: string; chapterTitle: string;
      subtitle: string; motif: string; paragraphs: string[]; position: TextPosition;
      isFirstPageOfChapter: boolean; isLastPageOfChapter: boolean; pageNumber: number;
    }
  | { type: 'finis'; book: StoryBookItem; pageNumber: number };

export interface NovelSpread {
  id: string;
  spreadIndex: number;
  leftPage: NovelPageData;
  rightPage: NovelPageData;
}

export interface ReadingAnchor {
  type: NovelPageData['type'];
  chapterId?: string;
  position?: TextPosition;
}

interface NarrativeLeaf {
  paragraphs: string[];
  position: TextPosition;
}

export interface PageFit {
  narrative: (paragraphs: string[], firstPage: boolean) => boolean;
  toc: (chapters: ChapterPageEntry[]) => boolean;
}

// Fit ordered prefixes only. A long paragraph or sentence may span many leaves.
export function paginateParagraphs(paragraphs: string[], fits: PageFit['narrative']): NarrativeLeaf[] {
  const leaves: NarrativeLeaf[] = [];
  let current: string[] = [];
  let position: TextPosition = { paragraphIndex: 0, offset: 0 };
  const flush = () => {
    if (!current.length) return;
    leaves.push({ paragraphs: current, position });
    current = [];
  };

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const text = paragraph.trim();
    let offset = 0;
    while (offset < text.length) {
      if (!current.length) position = { paragraphIndex, offset };
      const remaining = text.slice(offset);
      if (fits([...current, remaining], leaves.length === 0)) {
        current.push(remaining);
        break;
      }

      const boundaries = [...remaining.matchAll(/\S+\s*/gu)].map(match => match.index + match[0].length);
      let low = 0;
      let high = boundaries.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        const prefix = remaining.slice(0, boundaries[middle - 1]).trimEnd();
        if (fits([...current, prefix], leaves.length === 0)) low = middle;
        else high = middle - 1;
      }
      if (!low) {
        if (current.length) {
          flush();
          continue;
        }
        // An unusually long unbroken token can still continue on another leaf.
        const characters = [...remaining];
        let fitCharacters = 0;
        let end = characters.length;
        while (fitCharacters < end) {
          const middle = Math.ceil((fitCharacters + end) / 2);
          if (fits([characters.slice(0, middle).join('')], leaves.length === 0)) fitCharacters = middle;
          else end = middle - 1;
        }
        if (!fitCharacters) throw new Error('Storybook leaf cannot fit a single character.');
        const prefix = characters.slice(0, fitCharacters).join('');
        current.push(prefix);
        offset += prefix.length;
      } else {
        let end = boundaries[low - 1];
        // Prefer a nearby sentence boundary without leaving most of a page empty.
        const prefix = remaining.slice(0, end);
        const sentenceEnds = [...prefix.matchAll(/[.!?][\u2019\u201d"']?\s+/gu)];
        const sentence = sentenceEnds.at(-1);
        const sentenceEnd = sentence ? sentence.index + sentence[0].length : 0;
        if (sentenceEnd >= end * 0.7) end = sentenceEnd;
        current.push(remaining.slice(0, end).trimEnd());
        offset += end;
      }
      flush();
    }
  });
  flush();
  return leaves;
}

export function paginateBook(book: StoryBookItem, fits: PageFit) {
  const chapterPageMap: ChapterPageEntry[] = book.chapters.map(chapter => ({
    chapterId: chapter.id, number: chapter.number, title: chapter.title, motif: chapter.motif,
    // Reserve room for page numbers before the final narrative pagination is known.
    pageNumber: 9999,
  }));
  const tocChunks: ChapterPageEntry[][] = [];
  let tocChunk: ChapterPageEntry[] = [];
  for (const chapter of chapterPageMap) {
    if (tocChunk.length && !fits.toc([...tocChunk, chapter])) {
      tocChunks.push(tocChunk);
      tocChunk = [];
    }
    if (!fits.toc([chapter])) throw new Error('Storybook leaf cannot fit a contents entry.');
    tocChunk.push(chapter);
  }
  if (tocChunk.length || !tocChunks.length) tocChunks.push(tocChunk);

  const pages: NovelPageData[] = [{ type: 'frontispiece', book, pageNumber: 0 }];
  for (const chunk of tocChunks) pages.push({
    type: 'toc', bookTitle: book.title, subtitle: book.subtitle,
    chapterPageMap: chunk, pageNumber: pages.length,
  });
  book.chapters.forEach((chapter, chapterIndex) => {
    chapterPageMap[chapterIndex].pageNumber = pages.length;
    pages.push({
      type: 'chapter-title-leaf', chapterId: chapter.id, chapterNumber: chapter.number,
      chapterTitle: chapter.title, subtitle: chapter.subtitle, motif: chapter.motif,
      theme: chapter.theme, emblem: book.emblem, pageNumber: pages.length,
    });
    const leaves = paginateParagraphs(chapter.paragraphs, fits.narrative);
    leaves.forEach((leaf, index) => pages.push({
      type: 'chapter-narrative', chapterId: chapter.id, chapterNumber: chapter.number,
      chapterTitle: chapter.title, subtitle: chapter.subtitle, motif: chapter.motif,
      ...leaf, isFirstPageOfChapter: index === 0, isLastPageOfChapter: index === leaves.length - 1,
      pageNumber: pages.length,
    }));
  });
  pages.push({ type: 'finis', book, pageNumber: pages.length });
  if (pages.length % 2) pages.push({ type: 'blank-cover', pageNumber: pages.length });
  return { pages, chapterPageMap };
}

export function getReadingAnchor(page: NovelPageData | undefined): ReadingAnchor | null {
  if (!page) return null;
  if (page.type === 'chapter-narrative') return { type: page.type, chapterId: page.chapterId, position: page.position };
  if (page.type === 'chapter-title-leaf') return { type: page.type, chapterId: page.chapterId };
  if (page.type === 'toc') return { type: page.type, chapterId: page.chapterPageMap[0]?.chapterId };
  return { type: page.type };
}

export function findAnchorPage(pages: NovelPageData[], anchor: ReadingAnchor | null): number {
  if (!anchor) return -1;
  if (anchor.type === 'chapter-narrative' && anchor.position) {
    const position = anchor.position;
    for (let index = pages.length - 1; index >= 0; index--) {
      const page = pages[index];
      if (page.type === 'chapter-narrative' && page.chapterId === anchor.chapterId &&
          (page.position.paragraphIndex < position.paragraphIndex ||
            (page.position.paragraphIndex === position.paragraphIndex && page.position.offset <= position.offset))) return index;
    }
    return -1;
  }
  return pages.findIndex(page => page.type === anchor.type && (
    page.type === 'chapter-title-leaf' ? page.chapterId === anchor.chapterId
      : page.type === 'toc' ? !anchor.chapterId || page.chapterPageMap.some(chapter => chapter.chapterId === anchor.chapterId)
        : true
  ));
}

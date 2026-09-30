import assert from 'node:assert/strict';
import test from 'node:test';
import { storybooksData } from '../src/data/storybooks/index';
import { paginateBook, paginateParagraphs, getReadingAnchor, findAnchorPage, type NovelPageData } from '../src/lib/storybookPagination';

const normalize = (text: string) => text.replace(/\s+/gu, ' ').trim();
const budget = (size: number) => (paragraphs: string[]) => paragraphs.join(' ').length <= size;
const book = storybooksData.find(item => item.isAvailable && item.chapters.length)!;

test('overflow continues in order across any number of leaves', () => {
  const paragraphs = ['The first sentence is longer than an entire small page. A short sentence follows. Another lengthy sentence follows after that.', 'This is the second paragraph and must stay after the first one.'];
  const pages = paginateParagraphs(paragraphs, budget(35));
  assert.ok(pages.length > 3);
  assert.equal(normalize(pages.flatMap(page => page.paragraphs).join(' ')), normalize(paragraphs.join(' ')));
  assert.ok(pages.every(page => budget(35)(page.paragraphs)));
  assert.deepEqual(pages[0].position, { paragraphIndex: 0, offset: 0 });
});

test('an unbroken token also continues without losing Unicode characters', () => {
  const text = 'α'.repeat(90) + '😀'.repeat(10);
  const pages = paginateParagraphs([text], budget(12));
  assert.equal(pages.flatMap(page => page.paragraphs).join(''), text);
  assert.ok(pages.every(page => budget(12)(page.paragraphs)));
});

test('the complete book retains its text, contents, chapter targets and page numbering', () => {
  const result = paginateBook(book, { narrative: budget(190), toc: chapters => chapters.length <= 2 });
  const toc = result.pages.filter(page => page.type === 'toc');
  assert.ok(toc.length > 1);
  assert.deepEqual(toc.flatMap(page => page.chapterPageMap.map(chapter => chapter.chapterId)), book.chapters.map(chapter => chapter.id));
  result.pages.forEach((page, index) => assert.equal(page.pageNumber, index));
  for (const chapter of book.chapters) {
    const leaves = result.pages.filter((page): page is Extract<NovelPageData, { type: 'chapter-narrative' }> =>
      page.type === 'chapter-narrative' && page.chapterId === chapter.id);
    assert.equal(normalize(leaves.flatMap(page => page.paragraphs).join(' ')), normalize(chapter.paragraphs.join(' ')));
    assert.ok(leaves.every(page => budget(190)(page.paragraphs)));
    assert.equal(leaves.filter(page => page.isFirstPageOfChapter).length, 1);
    assert.equal(leaves.filter(page => page.isLastPageOfChapter).length, 1);
    const target = result.chapterPageMap.find(entry => entry.chapterId === chapter.id)!;
    assert.equal(result.pages[target.pageNumber].type, 'chapter-title-leaf');
  }
});

test('reading anchors survive reflow to larger or smaller leaves', () => {
  const small = paginateBook(book, { narrative: budget(160), toc: entries => entries.length <= 2 });
  const large = paginateBook(book, { narrative: budget(800), toc: () => true });
  const original = small.pages.find(page => page.type === 'chapter-narrative' && page.position.offset > 0)!;
  const anchor = getReadingAnchor(original)!;
  const target = large.pages[findAnchorPage(large.pages, anchor)];
  assert.equal(target.type, 'chapter-narrative');
  if (target.type !== 'chapter-narrative') return;
  assert.equal(target.chapterId, anchor.chapterId);
  assert.ok(target.position.paragraphIndex <= anchor.position!.paragraphIndex);
  const reverseTarget = small.pages[findAnchorPage(small.pages, getReadingAnchor(target))];
  assert.equal(reverseTarget.type, 'chapter-narrative');
  assert.equal(findAnchorPage(large.pages, { type: 'chapter-title-leaf', chapterId: 'missing' }), -1);
});

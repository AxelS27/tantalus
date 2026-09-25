import type { StoryBookItem } from './types';
import { adoketosBook } from './adoketos';

export * from './types';
export { adoketosBook } from './adoketos';

export const storybooksData: StoryBookItem[] = [
  adoketosBook,
];

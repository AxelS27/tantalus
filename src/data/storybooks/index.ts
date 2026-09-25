import type { StoryBookItem } from './types';
import { adoketosBook } from './adoketos';
import { shadowOfAthenaBook } from './shadowOfAthena';
import { labyrinthOfMinosBook } from './labyrinthOfMinos';
import { echoesOfTheCycladesBook } from './echoesOfTheCyclades';

export * from './types';
export { adoketosBook } from './adoketos';
export { shadowOfAthenaBook } from './shadowOfAthena';
export { labyrinthOfMinosBook } from './labyrinthOfMinos';
export { echoesOfTheCycladesBook } from './echoesOfTheCyclades';

export const storybooksData: StoryBookItem[] = [
  adoketosBook,
  shadowOfAthenaBook,
  labyrinthOfMinosBook,
  echoesOfTheCycladesBook,
];

export interface StoryChapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  motif: string;
  theme: string;
  paragraphs: string[];
}

export interface StoryBookItem {
  id: string;
  volume: string;
  title: string;
  originalTitle?: string;
  subtitle: string;
  tagline: string;
  synopsis: string;
  readingTime: string;
  totalChapters: number;
  coverColor: string;
  accentColor: string;
  emblem: 'compass' | 'owl' | 'thread' | 'wave';
  isAvailable: boolean;
  year: string;
  author: string;
  epigraph: {
    quote: string;
    source?: string;
  };
  chapters: StoryChapter[];
}

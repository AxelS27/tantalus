export const MUSIC_TRACKS = [
  { id: 'cinderella-dream', title: 'A Dream Is a Wish Your Heart Makes', artist: 'Leiki Ueda' },
  { id: 'cinderella-so-this-is-love', title: 'So This Is Love', artist: 'Leiki Ueda' },
  { id: 'moon-river', title: 'Moon River', artist: 'Piano Solo' },
  { id: 'someday-my-prince-will-come', title: 'Someday My Prince Will Come', artist: 'Leiki Ueda' },
  { id: 'when-you-wish-upon-a-star', title: 'When You Wish Upon a Star', artist: 'Kno Piano Music' },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]['id'];
export type PlaybackMode = 'shuffle' | 'sequential';
export const INTRO_MUSIC_TRACK: MusicTrackId = 'someday-my-prince-will-come';
export const DEFAULT_MUSIC_ORDER: MusicTrackId[] = MUSIC_TRACKS.map((track) => track.id);

export function normalizeMusicOrder(order: unknown): MusicTrackId[] {
  if (!Array.isArray(order)) return [...DEFAULT_MUSIC_ORDER];
  const valid = new Set<string>(DEFAULT_MUSIC_ORDER);
  const unique = [...new Set(order.filter((id): id is MusicTrackId => typeof id === 'string' && valid.has(id)))];
  return [...unique, ...DEFAULT_MUSIC_ORDER.filter((id) => !unique.includes(id))];
}

// The next track is reserved as soon as it starts buffering, so an entire cycle
// is exhausted before any track can repeat. A new cycle avoids an immediate repeat.
export class MusicQueue {
  private remaining: MusicTrackId[];
  private last: MusicTrackId | null = null;
  private order: MusicTrackId[];
  private mode: PlaybackMode;
  private openingTrack: MusicTrackId | undefined;

  constructor(order: MusicTrackId[], mode: PlaybackMode, openingTrack?: MusicTrackId) {
    this.order = normalizeMusicOrder(order);
    this.remaining = [...this.order];
    this.mode = mode;
    this.openingTrack = openingTrack;
  }

  next(): MusicTrackId {
    const newCycle = this.remaining.length === 0;
    if (newCycle) this.remaining = [...this.order];

    let choices = this.remaining;
    if (newCycle && choices.length > 1) choices = choices.filter((id) => id !== this.last);
    // A first-visit introduction has a fixed opening, even in shuffle mode.
    const id = this.openingTrack ?? (this.mode === 'shuffle'
      ? choices[Math.floor(Math.random() * choices.length)]
      : choices[0]);
    this.openingTrack = undefined;
    this.remaining = this.remaining.filter((candidate) => candidate !== id);
    this.last = id;
    return id;
  }

  configure(order: MusicTrackId[], mode: PlaybackMode, current: MusicTrackId | null, reserved: MusicTrackId | null) {
    this.order = normalizeMusicOrder(order);
    this.mode = mode;
    // Put the unused preload back into the pool, then use the new ordering.
    const unplayed = new Set(this.remaining);
    if (reserved) unplayed.add(reserved);
    this.remaining = this.order.filter((id) => unplayed.has(id) && id !== current);
    this.last = current;
  }
}

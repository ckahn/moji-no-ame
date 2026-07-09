/** A kana (or kana combo) and its accepted romaji spellings. */
export type KanaEntry = readonly [kana: string, romaji: readonly string[]];

export interface KanaSet {
  label: string;
  desc: string;
  kana: readonly KanaEntry[];
}

export type SetKey = "basic" | "dakuten" | "yoon";

/** What falls from the sky: random kana constructions or real katakana words. */
export type GameMode = "kana" | "words";

/** How the player answers tiles: keyboard romaji or spoken kana. */
export type InputMode = "type" | "speech";

export type SetSelection = Record<SetKey, boolean>;

export interface TileSizeOption {
  value: number;
  label: string;
  desc: string;
}

/** Kana → struggle score; higher means the player fumbles it more. */
export type StruggleMap = ReadonlyMap<string, number>;

export interface FallingItem {
  id: number;
  parts: readonly KanaEntry[];
  text: string;
  accept: readonly string[];
  /** Horizontal position, percent of playfield width. */
  x: number;
  /** Vertical position, percent of playfield height. */
  y: number;
  /** Fall speed in percent per second. */
  speed: number;
  /** Phase for the horizontal sway animation. */
  sway: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  k: string;
  kind: "clear" | "splash" | "ghost";
  expiresAt: number;
}

export interface WrongEntry {
  typed: string;
  k: string;
  r: string;
}

export interface DrownEntry {
  k: string;
  r: string;
}

export interface BannerInfo {
  text: string;
  sub: string;
}

export interface GameState {
  items: readonly FallingItem[];
  queue: readonly (readonly KanaEntry[])[];
  pool: readonly KanaEntry[];
  level: number;
  tileSize: number;
  levelGoal: number;
  levelCleared: number;
  lives: number;
  errors: number;
  wrongLog: readonly WrongEntry[];
  drownLog: readonly DrownEntry[];
  /** Texts that already cost a heart; repeats are free. */
  drownedSet: ReadonlySet<string>;
  totalCleared: number;
  elapsed: number;
  lastSpawn: number;
  nextGap: number;
  lastTs: number | null;
  banner: BannerInfo | null;
  bannerUntil: number;
  over: boolean;
  paused: boolean;
  particles: readonly Particle[];
  inputText: string;
  /** True when playing by voice; spawning then avoids sound-alike tiles. */
  speechMode: boolean;
  /** Tile text → English meaning, shown as a ghost on clear. Empty for kana mode. */
  glosses: ReadonlyMap<string, string>;
  shakeUntil: number;
  struggle: StruggleMap;
  /** Timestamp of the last tick, used to derive time-based UI states. */
  now: number;
}

export interface DrownedStat {
  k: string;
  r: string;
  n: number;
}

export interface StrugglingStat {
  k: string;
  r: string;
  n: number;
}

export interface FinalStats {
  level: number;
  tileSize: number;
  cleared: number;
  errors: number;
  elapsed: number;
  drowned: readonly DrownedStat[];
  wrong: readonly WrongEntry[];
  struggling: readonly StrugglingStat[];
}

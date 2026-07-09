import {
  BANNER_MS,
  FIRST_SPAWN_GAP_MS,
  GROUND_Y,
  MAX_INPUT_LENGTH,
  MAX_LIVES,
} from "./constants";
import { pickSpawnIndex } from "./conflicts";
import { tileSizeName } from "./format";
import { ROMAJI } from "./kana";
import { acceptFor, buildLevelQueue, insertRandomly, partsText } from "./queue";
import { clearTile, makeParticle, recordMiss, uid } from "./resolve";
import { bumpStruggle } from "./struggle";
import { wordReading } from "./words";
import type {
  DrownedStat,
  FallingItem,
  FinalStats,
  GameState,
  KanaEntry,
  StruggleMap,
} from "./types";

const baseSpeed = (level: number): number => (6 + level * 1.6) * 1.1;
const spawnInterval = (level: number): number => Math.max(2600 - (level - 1) * 220, 950);

export interface NewGameArgs {
  pool: readonly KanaEntry[];
  tileSize: number;
  level: number;
  isContinue: boolean;
  struggle: StruggleMap;
  now: number;
  speechMode: boolean;
  glosses: ReadonlyMap<string, string>;
}

export function createGame(args: NewGameArgs): GameState {
  const queue = buildLevelQueue(args.pool, args.tileSize, args.struggle);
  return {
    items: [],
    queue,
    pool: args.pool,
    level: args.level,
    tileSize: args.tileSize,
    levelGoal: queue.length,
    levelCleared: 0,
    lives: MAX_LIVES,
    errors: 0,
    wrongLog: [],
    drownLog: [],
    drownedSet: new Set(),
    totalCleared: 0,
    elapsed: 0,
    lastSpawn: 0,
    nextGap: FIRST_SPAWN_GAP_MS,
    lastTs: null,
    banner: args.isContinue
      ? { text: `LEVEL ${args.level}`, sub: "CONTINUE — restarting this level" }
      : null,
    bannerUntil: args.isContinue ? args.now + BANNER_MS : 0,
    over: false,
    paused: false,
    particles: [],
    inputText: "",
    speechMode: args.speechMode,
    glosses: args.glosses,
    shakeUntil: 0,
    struggle: args.struggle,
    now: args.now,
  };
}

function spawnItem(parts: readonly KanaEntry[], level: number): FallingItem {
  return {
    id: uid(),
    parts,
    text: partsText(parts),
    accept: acceptFor(parts),
    x: 6 + Math.random() * (parts.length > 1 ? 72 : 82),
    y: -8,
    speed: baseSpeed(level) * (0.85 + Math.random() * 0.3),
    sway: Math.random() * Math.PI * 2,
  };
}

/** Advances the simulation by one animation frame. Pure: returns a new state. */
export function tick(prev: GameState, ts: number): GameState {
  if (prev.over) return prev;
  const dt = Math.min(ts - (prev.lastTs ?? ts), 100);
  const next: GameState = {
    ...prev,
    lastTs: ts,
    now: ts,
    particles: prev.particles.filter((p) => p.expiresAt > ts),
  };
  if (next.paused || ts < next.bannerUntil) return next;

  next.elapsed = prev.elapsed + dt;

  if (next.queue.length > 0 && ts - next.lastSpawn > next.nextGap) {
    const spawnIndex = next.speechMode ? pickSpawnIndex(next.queue, next.items) : 0;
    const parts = next.queue[spawnIndex]!;
    next.queue = next.queue.filter((_, i) => i !== spawnIndex);
    next.items = [...next.items, spawnItem(parts, next.level)];
    next.lastSpawn = ts;
    next.nextGap = spawnInterval(next.level) * (0.8 + Math.random() * 0.4);
  }

  next.items = next.items.map((item) => ({
    ...item,
    y: item.y + (item.speed * dt) / 1000,
    sway: item.sway + dt / 900,
  }));

  const drownedNow = next.items.filter((item) => item.y >= GROUND_Y);
  if (drownedNow.length > 0) {
    next.items = next.items.filter((item) => item.y < GROUND_Y);
    const drownedSet = new Set(next.drownedSet);
    const drownLog = [...next.drownLog];
    const particles = [...next.particles];
    let queue = next.queue;
    let struggle = next.struggle;
    let lives = next.lives;
    for (const drowned of drownedNow) {
      if (!drownedSet.has(drowned.text)) {
        drownedSet.add(drowned.text);
        lives -= 1;
      }
      for (const [k, r] of drowned.parts) {
        drownLog.push({ k, r: r[0]! });
        struggle = bumpStruggle(struggle, k, 2);
      }
      particles.push(makeParticle(drowned.x, GROUND_Y, drowned.text, "splash", ts));
      if (lives > 0) queue = insertRandomly(queue, drowned.parts, queue.length + 1);
    }
    next.drownedSet = drownedSet;
    next.drownLog = drownLog;
    next.particles = particles;
    next.queue = queue;
    next.struggle = struggle;
    next.lives = Math.max(lives, 0);
    if (lives <= 0) {
      next.over = true;
      return next;
    }
  }

  if (next.queue.length === 0 && next.items.length === 0) {
    next.level = prev.level + 1;
    next.queue = buildLevelQueue(next.pool, next.tileSize, next.struggle);
    next.levelGoal = next.queue.length;
    next.levelCleared = 0;
    next.bannerUntil = ts + BANNER_MS;
    next.banner = {
      text: `LEVEL ${next.level}`,
      sub: `速くなる — faster ${tileSizeName(next.tileSize)} tiles`,
    };
  }

  return next;
}

/** Fires the current input at the lowest matching tile. */
export function submitInput(prev: GameState, now: number): GameState {
  if (prev.over || prev.paused) return prev;
  const val = prev.inputText.trim().toLowerCase();
  const next: GameState = { ...prev, inputText: "" };
  if (!val) return next;

  let target: FallingItem | null = null;
  for (const item of next.items) {
    if (item.accept.includes(val) && (!target || item.y > target.y)) target = item;
  }
  return target ? clearTile(next, target, now) : recordMiss(next, val, now);
}

export function typeChar(prev: GameState, key: string): GameState {
  if (prev.over || prev.paused || prev.inputText.length >= MAX_INPUT_LENGTH) return prev;
  return { ...prev, inputText: prev.inputText + key.toLowerCase() };
}

export function eraseChar(prev: GameState): GameState {
  if (prev.over || prev.paused) return prev;
  return { ...prev, inputText: prev.inputText.slice(0, -1) };
}

export function clearInput(prev: GameState): GameState {
  if (prev.over || prev.paused) return prev;
  return { ...prev, inputText: "" };
}

export function togglePause(prev: GameState): GameState {
  if (prev.over) return prev;
  return { ...prev, paused: !prev.paused };
}

export function computeFinalStats(state: GameState): FinalStats {
  const drownCounts = new Map<string, DrownedStat>();
  for (const d of state.drownLog) {
    const stat = drownCounts.get(d.k) ?? { k: d.k, r: d.r, n: 0 };
    drownCounts.set(d.k, { ...stat, n: stat.n + 1 });
  }
  return {
    level: state.level,
    tileSize: state.tileSize,
    cleared: state.totalCleared,
    errors: state.errors,
    elapsed: state.elapsed,
    drowned: [...drownCounts.values()].sort((a, b) => b.n - a.n),
    wrong: state.wrongLog.slice(-12),
    struggling: [...state.struggle.entries()]
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k, n]) => ({ k, n, r: ROMAJI.get(k)?.[0] ?? wordReading(k) ?? "?" })),
  };
}

import { GHOST_MS, PARTICLE_MS, SHAKE_MS } from "./constants";
import { insertRandomly, partsText } from "./queue";
import { bumpStruggle } from "./struggle";
import type { FallingItem, GameState, Particle } from "./types";

let nextId = 0;

/** Monotonic id shared by falling items and particles. */
export const uid = (): number => ++nextId;

export function makeParticle(
  x: number,
  y: number,
  k: string,
  kind: Particle["kind"],
  now: number,
  ttlMs: number = PARTICLE_MS,
): Particle {
  return { id: uid(), x, y, k, kind, expiresAt: now + ttlMs };
}

/** Clears a falling tile: removes it, credits progress, eases its struggle. */
export function clearTile(prev: GameState, target: FallingItem, now: number): GameState {
  let struggle = prev.struggle;
  for (const [k] of target.parts) struggle = bumpStruggle(struggle, k, -1);
  const particles = [
    ...prev.particles,
    makeParticle(target.x, target.y, target.text, "clear", now),
  ];
  const gloss = prev.glosses.get(target.text);
  if (gloss) particles.push(makeParticle(target.x, target.y, gloss, "ghost", now, GHOST_MS));
  return {
    ...prev,
    items: prev.items.filter((item) => item.id !== target.id),
    totalCleared: prev.totalCleared + 1,
    levelCleared: prev.levelCleared + 1,
    struggle,
    particles,
  };
}

/** Clears whichever of the given tiles are still falling (spoken hits). */
export function clearItemsById(
  prev: GameState,
  ids: readonly number[],
  now: number,
): GameState {
  if (prev.over || prev.paused) return prev;
  let state = prev;
  for (const id of ids) {
    const item = state.items.find((candidate) => candidate.id === id);
    if (item) state = clearTile(state, item, now);
  }
  return state;
}

/** Records a spoken answer that matched nothing on screen. */
export function speechMiss(prev: GameState, heard: string, now: number): GameState {
  if (prev.over || prev.paused || heard.length === 0) return prev;
  return recordMiss(prev, heard, now);
}

/** Records a wrong answer: logs it against the lowest tile and requeues that tile. */
export function recordMiss(prev: GameState, typed: string, now: number): GameState {
  const next: GameState = { ...prev, errors: prev.errors + 1 };
  let lowest: FallingItem | null = null;
  for (const item of next.items) {
    if (!lowest || item.y > lowest.y) lowest = item;
  }
  next.wrongLog = [
    ...next.wrongLog,
    { typed, k: lowest ? lowest.text : "—", r: lowest ? lowest.accept[0]! : "" },
  ];
  if (lowest) {
    const missed = lowest;
    let struggle = next.struggle;
    for (const [k] of missed.parts) struggle = bumpStruggle(struggle, k, 1);
    next.struggle = struggle;
    const copies = next.queue.filter((group) => partsText(group) === missed.text).length;
    if (copies < 2) {
      next.queue = insertRandomly(next.queue, missed.parts, 4);
      next.levelGoal = prev.levelGoal + 1;
    }
  }
  next.shakeUntil = now + SHAKE_MS;
  return next;
}

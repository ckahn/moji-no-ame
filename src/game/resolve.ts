import { PARTICLE_MS, SHAKE_MS } from "./constants";
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
): Particle {
  return { id: uid(), x, y, k, kind, expiresAt: now + PARTICLE_MS };
}

/** Clears a falling tile: removes it, credits progress, eases its struggle. */
export function clearTile(prev: GameState, target: FallingItem, now: number): GameState {
  let struggle = prev.struggle;
  for (const [k] of target.parts) struggle = bumpStruggle(struggle, k, -1);
  return {
    ...prev,
    items: prev.items.filter((item) => item.id !== target.id),
    totalCleared: prev.totalCleared + 1,
    levelCleared: prev.levelCleared + 1,
    struggle,
    particles: [...prev.particles, makeParticle(target.x, target.y, target.text, "clear", now)],
  };
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

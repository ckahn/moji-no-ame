import type { StruggleMap } from "./types";

/** Returns a new map with the kana's struggle score adjusted, floored at 0. */
export function bumpStruggle(struggle: StruggleMap, kana: string, delta: number): StruggleMap {
  const next = new Map(struggle);
  next.set(kana, Math.max(0, (struggle.get(kana) ?? 0) + delta));
  return next;
}

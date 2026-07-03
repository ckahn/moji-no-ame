import type { KanaEntry, StruggleMap } from "./types";

/**
 * Deals the pool into a shuffled queue, dealing struggled kana extra copies
 * and biasing them toward the front.
 */
export function buildQueue(pool: readonly KanaEntry[], struggle: StruggleMap): KanaEntry[] {
  const entries: KanaEntry[] = [];
  for (const entry of pool) {
    entries.push(entry);
    const score = struggle.get(entry[0]) ?? 0;
    const extras = Math.min(Math.floor(score / 2), 2);
    for (let i = 0; i < extras; i++) entries.push(entry);
  }
  return entries
    .map((e) => ({ e, key: Math.random() / (1 + (struggle.get(e[0]) ?? 0)) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.e);
}

/**
 * Chunks the queue into tile groups of the given size. ン is spread out so it
 * lands at most once per group (its "n" romaji is ambiguous mid-combo).
 */
export function buildLevelQueue(
  pool: readonly KanaEntry[],
  size: number,
  struggle: StruggleMap,
): KanaEntry[][] {
  const entries = buildQueue(pool, struggle);
  if (size === 1) return entries.map((e) => [e]);
  const ns = entries.filter((e) => e[0] === "ン");
  const rest = entries.filter((e) => e[0] !== "ン");
  const groups: KanaEntry[][] = [];
  while (rest.length || ns.length) {
    const group: KanaEntry[] = [];
    while (group.length < size - 1 && rest.length) group.push(rest.shift()!);
    if (ns.length) group.push(ns.shift()!);
    else if (rest.length) group.push(rest.shift()!);
    if (group.length) groups.push(group);
  }
  return groups;
}

/** All accepted romaji strings for a tile (cartesian product of part spellings). */
export function acceptFor(parts: readonly KanaEntry[]): string[] {
  return parts.reduce<string[]>(
    (acc, [, romajiList]) => acc.flatMap((prefix) => romajiList.map((v) => prefix + v)),
    [""],
  );
}

export function partsText(parts: readonly KanaEntry[]): string {
  return parts.map((p) => p[0]).join("");
}

import type { FallingItem } from "../game/types";
import { isKatakana, matchKey } from "./normalize";

/** Distinct normalized candidates from a segment's alternatives. */
export function candidatesFor(alternatives: readonly string[]): readonly string[] {
  return [...new Set(alternatives.map(matchKey).filter((c) => c.length > 0))];
}

/** True if some candidate was clean kana — a miss can be judged fairly. */
export function anyJudgeable(candidates: readonly string[]): boolean {
  return candidates.some(isKatakana);
}

/**
 * Ids of tiles the utterance clears. Each candidate is tried and the one
 * consuming the most tiles wins, so a mumbled first hypothesis can lose to a
 * cleaner alternative.
 */
export function findSpeechMatches(
  items: readonly FallingItem[],
  candidates: readonly string[],
): readonly number[] {
  let best: readonly number[] = [];
  for (const candidate of candidates) {
    const ids = matchCandidate(items, candidate);
    if (ids.length > best.length) best = ids;
  }
  return best;
}

function matchCandidate(items: readonly FallingItem[], candidate: string): readonly number[] {
  // Whole-utterance match against romaji spellings or the kana text itself.
  const exact = lowest(
    items,
    (item) => item.accept.includes(candidate) || matchKey(item.text) === candidate,
    new Set(),
  );
  if (exact) return [exact.id];
  if (!isKatakana(candidate)) return [];

  // Greedy prefix consume, lowest tile first: clears several words said in
  // one breath and tolerates trailing recognizer padding (ショウ for ショー
  // leaves an unmatched ウ, which is ignored).
  const taken = new Set<number>();
  const ids: number[] = [];
  let rest = candidate;
  while (rest.length > 0) {
    const hit = lowest(items, (item) => rest.startsWith(matchKey(item.text)), taken);
    if (!hit) break;
    taken.add(hit.id);
    ids.push(hit.id);
    rest = rest.slice(matchKey(hit.text).length);
  }
  return ids;
}

function lowest(
  items: readonly FallingItem[],
  matches: (item: FallingItem) => boolean,
  taken: ReadonlySet<number>,
): FallingItem | null {
  let found: FallingItem | null = null;
  for (const item of items) {
    if (!taken.has(item.id) && matches(item) && (!found || item.y > found.y)) found = item;
  }
  return found;
}

import { matchKey } from "../speech/normalize";
import { acceptFor, partsText } from "./queue";
import type { FallingItem, KanaEntry } from "./types";

/**
 * True when one tile's spoken answer could be mistaken for the other's:
 * identical or a prefix (saying パン must not ambiguously target パンダ).
 */
export function acceptsConflict(a: readonly string[], b: readonly string[]): boolean {
  return a.some((x) => b.some((y) => x.startsWith(y) || y.startsWith(x)));
}

/**
 * True when the tiles' kana text collides once normalized the way speech
 * matching does (matchKey strips ー) — e.g. スープ and スプーン both reduce
 * to a spelling where one prefixes the other, even though their romaji don't.
 */
function textConflict(a: string, b: string): boolean {
  const x = matchKey(a);
  const y = matchKey(b);
  return x.startsWith(y) || y.startsWith(x);
}

/**
 * Index of the first queued tile that doesn't sound like anything currently
 * falling. Falls back to the head of the queue when everything conflicts, so
 * spawning can never stall a level.
 */
export function pickSpawnIndex(
  queue: readonly (readonly KanaEntry[])[],
  items: readonly FallingItem[],
): number {
  const index = queue.findIndex((parts) => {
    const accepts = acceptFor(parts);
    const text = partsText(parts);
    return !items.some(
      (item) => acceptsConflict(accepts, item.accept) || textConflict(text, item.text),
    );
  });
  return index === -1 ? 0 : index;
}

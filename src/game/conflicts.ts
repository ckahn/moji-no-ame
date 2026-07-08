import { acceptFor } from "./queue";
import type { FallingItem, KanaEntry } from "./types";

/**
 * True when one tile's spoken answer could be mistaken for the other's:
 * identical or a prefix (saying パン must not ambiguously target パンダ).
 */
export function acceptsConflict(a: readonly string[], b: readonly string[]): boolean {
  return a.some((x) => b.some((y) => x.startsWith(y) || y.startsWith(x)));
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
  if (items.length === 0) return 0;
  const index = queue.findIndex((parts) => {
    const accepts = acceptFor(parts);
    return !items.some((item) => acceptsConflict(accepts, item.accept));
  });
  return index === -1 ? 0 : index;
}

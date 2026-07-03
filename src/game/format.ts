import { TILE_SIZES } from "./kana";

export function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function tileSizeName(size: number): string {
  return (TILE_SIZES.find((t) => t.value === size) ?? TILE_SIZES[0]).label.toLowerCase();
}

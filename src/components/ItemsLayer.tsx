import { DANGER_ZONE, GROUND_Y } from "../game/constants";
import type { FallingItem } from "../game/types";

export function ItemsLayer({ items }: { items: readonly FallingItem[] }) {
  return (
    <>
      {items.map((item) => {
        const danger = item.y > GROUND_Y - DANGER_ZONE;
        return (
          <div
            key={item.id}
            className={`falling-kana kr-jp${danger ? " danger" : ""}`}
            style={{
              left: `calc(${item.x}% + ${Math.sin(item.sway) * 8}px)`,
              top: `${item.y}%`,
              fontSize: Math.max(24, 46 - item.text.length * 4),
            }}
          >
            {item.text}
          </div>
        );
      })}
    </>
  );
}

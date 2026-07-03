import { useEffect, useRef, useState } from "react";
import { MAX_LIVES } from "../game/constants";
import { fmtTime } from "../game/format";
import type { GameState } from "../game/types";

const HEART_PULSE_MS = 400;

export function Hud({ state }: { state: GameState }) {
  const remaining = state.queue.length + state.items.length;
  const goal = Math.max(state.levelGoal, 1);
  const pct = Math.max(0, Math.min(100, (state.levelCleared / goal) * 100));

  const [pulseIndex, setPulseIndex] = useState(-1);
  const prevLives = useRef(state.lives);
  useEffect(() => {
    const dropped = state.lives < prevLives.current;
    prevLives.current = state.lives;
    if (!dropped) return;
    setPulseIndex(state.lives);
    const timer = window.setTimeout(() => setPulseIndex(-1), HEART_PULSE_MS);
    return () => window.clearTimeout(timer);
  }, [state.lives]);

  return (
    <div className="hud">
      <div className="hud-left">
        <span className="muted">LEVEL </span>
        <b className="gold">{state.level}</b>
        <span className="muted" style={{ marginLeft: 18 }}>TILE </span>
        <b>{state.tileSize}</b>
        <span className="muted" style={{ marginLeft: 18 }}>LEFT THIS LEVEL </span>
        <b>{remaining}</b>
        <div className="progress-shell">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-copy">
          {state.levelCleared}/{state.levelGoal} tiles cleared — {remaining} left
        </div>
      </div>
      <div className="hearts kr-jp">
        {Array.from({ length: MAX_LIVES }, (_, i) => (
          <span
            key={i}
            className={`heart ${i < state.lives ? "filled" : "empty"}${i === pulseIndex ? " pulse" : ""}`}
          >
            ♥
          </span>
        ))}
      </div>
      <div className="hud-right">
        <span className="muted">TIME </span>
        <b>{fmtTime(state.elapsed)}</b>
        <span className="muted" style={{ marginLeft: 18 }}>MISSED </span>
        <b className={state.errors ? "red" : ""}>{state.errors}</b>
      </div>
    </div>
  );
}

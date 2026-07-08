import type { Particle } from "../game/types";

export function ParticlesLayer({ particles }: { particles: readonly Particle[] }) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.kind === "ghost" ? "particle ghost" : `particle kr-jp ${p.kind}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {p.k}
        </div>
      ))}
    </>
  );
}

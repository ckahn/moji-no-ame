import { fmtTime } from "../game/format";
import type { FinalStats } from "../game/types";

export function GameOverPanel({ stats }: { stats: FinalStats }) {
  return (
    <div className="gameover-panel">
      <div className="gameover-title kr-jp">波に飲まれた…</div>
      <div className="stats-grid">
        <div>
          Level reached <b className="gold">{stats.level}</b>
        </div>
        <div>
          Tile size <b className="gold">{stats.tileSize}</b>
        </div>
        <div>
          Kana cleared <b className="gold">{stats.cleared}</b>
        </div>
        <div>
          Missed <b className="red">{stats.errors}</b>
        </div>
        <div>
          Time <b className="gold">{fmtTime(stats.elapsed)}</b>
        </div>
      </div>

      {stats.drowned.length > 0 && (
        <div className="review-section">
          <div className="review-label">STUDY THESE — fell in the water</div>
          <div className="pill-wrap">
            {stats.drowned.map((d) => (
              <div key={d.k} className="pill red">
                <span className="kr-jp" style={{ fontSize: 20, marginRight: 8 }}>{d.k}</span>
                <span className="gold">{d.r}</span>
                {d.n > 1 && <span style={{ opacity: 0.6 }}> ×{d.n}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.struggling.length > 0 && (
        <div className="review-section">
          <div className="review-label">
            STILL SHAKY — these get dealt sooner &amp; more often next run
          </div>
          <div className="pill-wrap">
            {stats.struggling.map((d) => (
              <div key={d.k} className="pill">
                <span className="kr-jp" style={{ fontSize: 20, marginRight: 8 }}>{d.k}</span>
                <span className="gold">{d.r}</span>
                <span style={{ opacity: 0.55 }}> {"•".repeat(Math.min(d.n, 5))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.wrong.length > 0 && (
        <div className="review-section">
          <div className="review-label">MISSED — what you typed vs. the lowest kana at the time</div>
          <div className="wrong-list">
            {stats.wrong.map((w, i) => (
              <div key={i} style={{ opacity: 0.9 }}>
                <span className="red" style={{ textDecoration: "line-through" }}>{w.typed}</span>
                {w.k !== "—" && (
                  <>
                    <span style={{ opacity: 0.5 }}> → probably </span>
                    <span className="kr-jp" style={{ fontSize: 17 }}>{w.k}</span>
                    <span style={{ opacity: 0.5 }}> = </span>
                    <span className="gold">{w.r}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

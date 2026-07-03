import { MAX_LIVES } from "../game/constants";
import { SET_KEYS, SETS, TILE_SIZES } from "../game/kana";
import type { FinalStats, SetKey, SetSelection } from "../game/types";
import { GameOverPanel } from "./GameOverPanel";

interface SetupScreenProps {
  selected: SetSelection;
  tileSize: number;
  /** Present only when arriving here from a lost game. */
  finalStats: FinalStats | null;
  onToggleSet: (key: SetKey) => void;
  onSelectTileSize: (value: number) => void;
  onStart: () => void;
  onContinue: () => void;
}

export function SetupScreen({
  selected,
  tileSize,
  finalStats,
  onToggleSet,
  onSelectTileSize,
  onStart,
  onContinue,
}: SetupScreenProps) {
  const totalSelected = SET_KEYS.reduce(
    (sum, key) => sum + (selected[key] ? SETS[key].kana.length : 0),
    0,
  );
  const startSuffix = totalSelected > 0 ? ` — ${totalSelected} kana, ${tileSize}-tile` : "";
  const canContinue = finalStats !== null && finalStats.level > 1;

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <div className="title kr-jp">カタカナの雨</div>
        <div className="subtitle">Katakana Rain — type the romaji before it hits the sea</div>

        {finalStats && <GameOverPanel stats={finalStats} />}

        <div className="section-title">Kana sets</div>
        <div className="set-list">
          {SET_KEYS.map((key) => {
            const set = SETS[key];
            return (
              <label key={key} className={`set-row${selected[key] ? " selected" : ""}`}>
                <input type="checkbox" checked={selected[key]} onChange={() => onToggleSet(key)} />
                <div className="set-copy">
                  <div className="set-label">{set.label}</div>
                  <div className="set-desc">{set.desc}</div>
                </div>
                <div className="set-count kr-jp">{set.kana.length}字</div>
              </label>
            );
          })}
        </div>

        <div className="section-title">Tile size</div>
        <div className="tile-list">
          {TILE_SIZES.map((tile) => (
            <label
              key={tile.value}
              className={`tile-row${tileSize === tile.value ? " selected" : ""}`}
            >
              <input
                type="radio"
                name="tileSize"
                checked={tileSize === tile.value}
                onChange={() => onSelectTileSize(tile.value)}
              />
              <div className="tile-number">{tile.value}</div>
              <div className="tile-label">{tile.label}</div>
              <div className="tile-desc">{tile.desc}</div>
            </label>
          ))}
        </div>

        {canContinue ? (
          <div className="button-row">
            <button
              className="start-button continue-button"
              disabled={totalSelected === 0}
              onClick={onContinue}
            >
              CONTINUE LEVEL {finalStats.level}
            </button>
            <button
              className="start-button restart-button"
              disabled={totalSelected === 0}
              onClick={onStart}
            >
              RESTART FROM LEVEL 1{startSuffix}
            </button>
          </div>
        ) : (
          <button className="start-button" disabled={totalSelected === 0} onClick={onStart}>
            START{startSuffix}
          </button>
        )}

        <div className="instructions">
          Type the romaji, press <b>SPACE</b> or <b>ENTER</b> to fire — the lowest matching item
          clears. Every level covers the <b>full selected set</b>, chunked using the tile size you
          chose. Tile size controls what appears in each falling block — single kana, pairs,
          triples, or quads. Levels now only control speed: <b>level 2 is faster than level 1</b>,
          level 3 is faster again, and so on. The <b>LEFT THIS LEVEL</b> counter shows queued plus
          falling tiles. When it reaches <b>0</b>, you win the level. Anything that reaches the
          water costs a heart — but only the <b>first</b> time for that exact kana/combo; repeats
          keep coming back until you clear them. {MAX_LIVES} unique drops and it's over. If level 1
          drains all hearts, you still see your results here, but the button returns to the normal{" "}
          <b>START</b> flow. After losing on level 2 or later, <b>CONTINUE LEVEL N</b> restarts the
          level you lost with full hearts; <b>RESTART FROM LEVEL 1</b> starts over. The game notices
          what you fumble and quietly deals it back sooner and more often. <b>ESC</b> or a click
          pauses while playing.
        </div>
      </div>
    </div>
  );
}

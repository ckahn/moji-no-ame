import { useMemo, useRef, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { SetupScreen } from "./components/SetupScreen";
import { selectedPool } from "./game/kana";
import { WORD_GLOSSES, WORDS_POOL } from "./game/words";
import type {
  FinalStats,
  GameMode,
  InputMode,
  KanaEntry,
  SetKey,
  SetSelection,
  StruggleMap,
} from "./game/types";

type Screen = "setup" | "playing" | "gameover";

/** The resolved (mode-aware) settings a run actually plays with. */
interface RunSettings {
  pool: readonly KanaEntry[];
  tileSize: number;
  glosses: ReadonlyMap<string, string>;
  inputMode: InputMode;
}

interface RunConfig extends RunSettings {
  id: number;
  level: number;
  isContinue: boolean;
}

const NO_GLOSSES: ReadonlyMap<string, string> = new Map();

export default function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [mode, setMode] = useState<GameMode>("kana");
  const [inputMode, setInputMode] = useState<InputMode>("type");
  const [selected, setSelected] = useState<SetSelection>({
    basic: true,
    dakuten: false,
    yoon: false,
  });
  const [tileSize, setTileSize] = useState(1);
  const [struggle, setStruggle] = useState<StruggleMap>(() => new Map());
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [run, setRun] = useState<RunConfig | null>(null);
  const runIdRef = useRef(0);

  const pool = useMemo(
    () => (mode === "words" ? WORDS_POOL : selectedPool(selected)),
    [mode, selected],
  );

  const currentSettings = (): RunSettings => ({
    pool,
    tileSize: mode === "words" ? 1 : tileSize,
    glosses: mode === "words" ? WORD_GLOSSES : NO_GLOSSES,
    inputMode: mode === "words" ? inputMode : "type",
  });

  // Settings are captured once per run so a "Continue" always resumes the
  // mode/tileSize the player actually lost in, even if they fiddle with the
  // setup radios (still visible behind the game-over panel) before clicking it.
  const startLevel = (level: number, isContinue: boolean, settings: RunSettings) => {
    if (settings.pool.length === 0) return;
    runIdRef.current += 1;
    setFinalStats(null);
    setRun({ id: runIdRef.current, level, isContinue, ...settings });
    setScreen("playing");
  };

  const handleToggleSet = (key: SetKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGameOver = (stats: FinalStats, endStruggle: StruggleMap) => {
    setStruggle(endStruggle);
    setFinalStats(stats);
    setScreen("gameover");
  };

  if (screen === "playing" && run) {
    return (
      <GameScreen
        key={run.id}
        pool={run.pool}
        tileSize={run.tileSize}
        startLevel={run.level}
        isContinue={run.isContinue}
        struggle={struggle}
        glosses={run.glosses}
        inputMode={run.inputMode}
        onGameOver={handleGameOver}
      />
    );
  }

  return (
    <SetupScreen
      mode={mode}
      inputMode={inputMode}
      selected={selected}
      tileSize={tileSize}
      finalStats={screen === "gameover" ? finalStats : null}
      onSelectMode={setMode}
      onSelectInputMode={setInputMode}
      onToggleSet={handleToggleSet}
      onSelectTileSize={setTileSize}
      onStart={() => startLevel(1, false, currentSettings())}
      onContinue={() => {
        if (finalStats && run) startLevel(finalStats.level, true, run);
      }}
    />
  );
}

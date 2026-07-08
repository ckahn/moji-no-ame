import { useMemo, useRef, useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { SetupScreen } from "./components/SetupScreen";
import { selectedPool } from "./game/kana";
import { WORD_GLOSSES, WORDS_POOL } from "./game/words";
import type {
  FinalStats,
  GameMode,
  InputMode,
  SetKey,
  SetSelection,
  StruggleMap,
} from "./game/types";

type Screen = "setup" | "playing" | "gameover";

interface RunConfig {
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

  const startLevel = (level: number, isContinue: boolean) => {
    if (pool.length === 0) return;
    runIdRef.current += 1;
    setFinalStats(null);
    setRun({ id: runIdRef.current, level, isContinue });
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
        pool={pool}
        tileSize={mode === "words" ? 1 : tileSize}
        startLevel={run.level}
        isContinue={run.isContinue}
        struggle={struggle}
        glosses={mode === "words" ? WORD_GLOSSES : NO_GLOSSES}
        inputMode={mode === "words" ? inputMode : "type"}
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
      onStart={() => startLevel(1, false)}
      onContinue={() => {
        if (finalStats) startLevel(finalStats.level, true);
      }}
    />
  );
}

import { useEffect, useRef, useState } from "react";
import { GAME_OVER_DELAY_MS } from "../game/constants";
import {
  clearInput,
  computeFinalStats,
  createGame,
  eraseChar,
  submitInput,
  tick,
  togglePause,
  typeChar,
} from "../game/engine";
import type { FinalStats, InputMode, KanaEntry, StruggleMap } from "../game/types";
import { useSpeechInput } from "../hooks/useSpeechInput";
import { Banner } from "./Banner";
import { Hud } from "./Hud";
import { InputDisplay } from "./InputDisplay";
import { ItemsLayer } from "./ItemsLayer";
import { isErrorStatus } from "../speech/transcriber";
import { MicErrorOverlay } from "./MicErrorOverlay";
import { MicStatus } from "./MicStatus";
import { ParticlesLayer } from "./ParticlesLayer";
import { PauseOverlay } from "./PauseOverlay";
import { Wave } from "./Wave";

interface GameScreenProps {
  pool: readonly KanaEntry[];
  tileSize: number;
  startLevel: number;
  isContinue: boolean;
  struggle: StruggleMap;
  glosses: ReadonlyMap<string, string>;
  inputMode: InputMode;
  onGameOver: (stats: FinalStats, struggle: StruggleMap) => void;
}

export function GameScreen({
  pool,
  tileSize,
  startLevel,
  isContinue,
  struggle,
  glosses,
  inputMode,
  onGameOver,
}: GameScreenProps) {
  const speechEnabled = inputMode === "speech";
  const [state, setState] = useState(() =>
    createGame({
      pool,
      tileSize,
      level: startLevel,
      isContinue,
      struggle,
      now: performance.now(),
      speechMode: speechEnabled,
      glosses,
    }),
  );
  const overReported = useRef(false);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const { status: micStatus, heard } = useSpeechInput({
    enabled: speechEnabled,
    stateRef,
    setState,
  });
  const micError = speechEnabled && isErrorStatus(micStatus);

  useEffect(() => {
    if (!micError) return;
    setState((s) => (s.over || s.paused ? s : { ...s, paused: true }));
  }, [micError]);

  useEffect(() => {
    let rafId = requestAnimationFrame(function loop(ts) {
      setState((s) => tick(s, ts));
      rafId = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setState(togglePause);
        return;
      }
      if (event.key === "Backspace" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setState(clearInput);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setState((s) => submitInput(s, performance.now()));
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setState(eraseChar);
      } else if (/^[a-zA-Z-]$/.test(event.key)) {
        setState((s) => typeChar(s, event.key));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!state.over || overReported.current) return;
    overReported.current = true;
    const stats = computeFinalStats(state);
    const endStruggle = state.struggle;
    const timer = window.setTimeout(() => onGameOver(stats, endStruggle), GAME_OVER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, onGameOver]);

  const bannerVisible = state.banner !== null && state.now < state.bannerUntil;

  return (
    <div className="game-root" onClick={() => setState(togglePause)}>
      <Hud state={state} />
      <ItemsLayer items={state.items} />
      <ParticlesLayer particles={state.particles} />
      <Wave />
      {speechEnabled && !(state.paused && micError) && <MicStatus status={micStatus} />}
      <InputDisplay
        text={speechEnabled && !state.inputText ? heard : state.inputText}
        shake={state.now < state.shakeUntil}
        placeholder={speechEnabled ? "speak the word…" : "type romaji…"}
      />
      {bannerVisible && state.banner && <Banner banner={state.banner} />}
      {state.paused && (micError ? <MicErrorOverlay status={micStatus} /> : <PauseOverlay />)}
    </div>
  );
}

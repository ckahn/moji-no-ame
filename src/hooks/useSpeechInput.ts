import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { clearItemsById, speechMiss } from "../game/resolve";
import type { GameState } from "../game/types";
import { candidatesFor, findSpeechMatches, firstJudgeable } from "../speech/match";
import type { TranscriberFactory, TranscriberStatus } from "../speech/transcriber";
import { createWebSpeechTranscriber } from "../speech/webSpeech";

/** Segment keys remembered to avoid re-firing; trimmed when it grows past this. */
const MAX_CONSUMED_KEYS = 200;

interface UseSpeechInputArgs {
  enabled: boolean;
  /** Latest committed game state; read to match without waiting on React. */
  stateRef: RefObject<GameState>;
  setState: Dispatch<SetStateAction<GameState>>;
  createTranscriber?: TranscriberFactory;
}

interface SpeechInput {
  status: TranscriberStatus;
  /** Latest raw transcript, for display. */
  heard: string;
}

/**
 * Streams speech into the game: interim hypotheses fire hits as soon as they
 * match (low latency); a segment that finalizes as clean kana without matching
 * anything counts as a miss. Consumed segment keys guard against a segment
 * firing twice as it upgrades from interim to final.
 */
export function useSpeechInput({
  enabled,
  stateRef,
  setState,
  createTranscriber = createWebSpeechTranscriber,
}: UseSpeechInputArgs): SpeechInput {
  const [status, setStatus] = useState<TranscriberStatus>("idle");
  const [heard, setHeard] = useState("");
  const consumedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;
    const transcriber = createTranscriber({
      onStatus: setStatus,
      onSegment: ({ alternatives, isFinal, key }) => {
        const display = alternatives[0]?.trim() ?? "";
        setHeard(display);
        const snapshot = stateRef.current;
        const consumed = consumedRef.current;
        if (!snapshot || snapshot.over || snapshot.paused || consumed.has(key)) return;

        const candidates = candidatesFor(alternatives);
        const now = performance.now();
        const ids = findSpeechMatches(snapshot.items, candidates);
        if (ids.length > 0) {
          consumed.add(key);
          setHeard("");
          setState((prev) => clearItemsById(prev, ids, now));
        } else if (isFinal) {
          const judged = firstJudgeable(candidates);
          if (judged) {
            consumed.add(key);
            setState((prev) => speechMiss(prev, judged, now));
          }
        }
        if (consumed.size > MAX_CONSUMED_KEYS) {
          consumedRef.current = new Set([...consumed].slice(-MAX_CONSUMED_KEYS / 2));
        }
      },
    });
    if (!transcriber) {
      setStatus("unavailable");
      return;
    }
    transcriber.start();
    return () => transcriber.stop();
  }, [enabled, createTranscriber, setState, stateRef]);

  return { status, heard };
}

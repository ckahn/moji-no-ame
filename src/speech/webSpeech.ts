import type { Transcriber, TranscriberCallbacks } from "./transcriber";

/** Delay before rebooting a session the browser ended on its own. */
const RESTART_DELAY_MS = 250;
const MAX_ALTERNATIVES = 5;

/**
 * A session that ends this fast without ever producing a result didn't hear
 * real audio — it was rejected outright (e.g. Brave blocks the Google speech
 * backend the API relies on, without surfacing a permission-style error).
 */
const STALL_SESSION_MS = 1500;
/** Consecutive no-result sessions before giving up and reporting "stalled". */
const STALL_STREAK_LIMIT = 3;

// Minimal Web Speech API typings — SpeechRecognition isn't in lib.dom.
interface WSAlternative {
  readonly transcript: string;
}
interface WSResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: WSAlternative;
}
interface WSResultList {
  readonly length: number;
  readonly [index: number]: WSResult;
}
interface WSResultEvent {
  readonly resultIndex: number;
  readonly results: WSResultList;
}
interface WSErrorEvent {
  readonly error: string;
}
interface WSRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: WSResultEvent) => void) | null;
  onerror: ((event: WSErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}
type WSRecognitionCtor = new () => WSRecognition;

function recognitionCtor(): WSRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: WSRecognitionCtor;
    webkitSpeechRecognition?: WSRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Web Speech API transcriber (ja-JP, continuous, interim results). Returns
 * null when the browser lacks the API. Browsers end continuous sessions after
 * silence or a time cap, so ended sessions reboot until stop() is called.
 */
export function createWebSpeechTranscriber(callbacks: TranscriberCallbacks): Transcriber | null {
  const Recognition = recognitionCtor();
  if (!Recognition) return null;

  let stopped = true;
  let session = 0;
  let active: WSRecognition | null = null;
  let restartTimer = 0;
  let noResultStreak = 0;

  const boot = () => {
    if (stopped) return;
    session += 1;
    const sessionId = session;
    const startedAt = performance.now();
    let gotResult = false;
    const recognition = new Recognition();
    active = recognition;
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = MAX_ALTERNATIVES;
    recognition.onstart = () => callbacks.onStatus("listening");
    recognition.onresult = (event) => {
      gotResult = true;
      noResultStreak = 0;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!;
        const alternatives: string[] = [];
        for (let j = 0; j < result.length; j++) alternatives.push(result[j]!.transcript);
        callbacks.onSegment({ alternatives, isFinal: result.isFinal, key: `${sessionId}:${i}` });
      }
    };
    recognition.onerror = (event) => {
      // Permission errors are fatal; everything else ("no-speech", "network",
      // "aborted") ends the session and onend reboots it.
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        stopped = true;
        callbacks.onStatus("denied");
      }
    };
    recognition.onend = () => {
      if (stopped) return;
      if (!gotResult && performance.now() - startedAt < STALL_SESSION_MS) {
        noResultStreak += 1;
      } else {
        noResultStreak = 0;
      }
      if (noResultStreak >= STALL_STREAK_LIMIT) {
        stopped = true;
        callbacks.onStatus("stalled");
        return;
      }
      restartTimer = window.setTimeout(boot, RESTART_DELAY_MS);
    };
    try {
      recognition.start();
    } catch {
      // start() throws InvalidStateError if a session is somehow still live;
      // retry on the same schedule as a self-ended session.
      restartTimer = window.setTimeout(boot, RESTART_DELAY_MS);
    }
  };

  return {
    start() {
      if (!stopped) return;
      stopped = false;
      noResultStreak = 0;
      callbacks.onStatus("starting");
      boot();
    },
    stop() {
      stopped = true;
      window.clearTimeout(restartTimer);
      active?.abort();
      active = null;
      callbacks.onStatus("idle");
    },
  };
}

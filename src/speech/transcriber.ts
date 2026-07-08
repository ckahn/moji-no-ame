/**
 * Engine-agnostic streaming speech-to-text interface. The Web Speech API
 * implementation lives in webSpeech.ts; a cloud engine (ElevenLabs Scribe,
 * Deepgram) or an on-device model (Vosk) can be swapped in by providing
 * another TranscriberFactory.
 */

export type TranscriberStatus =
  | "idle"
  | "starting"
  | "listening"
  | "denied"
  | "unavailable"
  | "stalled";

/** One utterance segment. Interim segments re-emit under the same key until final. */
export interface TranscriptSegment {
  /** Transcription hypotheses, most confident first. */
  alternatives: readonly string[];
  isFinal: boolean;
  /** Stable identity of this segment across its interim → final updates. */
  key: string;
}

export interface TranscriberCallbacks {
  onSegment: (segment: TranscriptSegment) => void;
  onStatus: (status: TranscriberStatus) => void;
}

export interface Transcriber {
  start: () => void;
  stop: () => void;
}

/** Returns null when the engine isn't available in this environment. */
export type TranscriberFactory = (callbacks: TranscriberCallbacks) => Transcriber | null;

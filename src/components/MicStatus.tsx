import type { TranscriberStatus } from "../speech/transcriber";

const LABELS: Record<TranscriberStatus, string> = {
  idle: "mic off",
  starting: "starting mic…",
  listening: "listening",
  denied: "mic blocked — allow microphone access and reload",
  unavailable: "speech recognition not supported here — try Chrome",
  stalled:
    "recognizer isn't returning results — Brave blocks this by default, enable " +
    "\"Use Google services for speech recognition\" in brave://settings/system and reload",
};

export function MicStatus({ status }: { status: TranscriberStatus }) {
  return (
    <div className="mic-status-wrap">
      <div className={`mic-status mic-${status}`}>
        <span className="mic-dot" />
        {LABELS[status]}
      </div>
    </div>
  );
}

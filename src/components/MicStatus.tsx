import type { TranscriberStatus } from "../speech/transcriber";

const LABELS: Record<TranscriberStatus, string> = {
  idle: "mic off",
  starting: "starting mic…",
  listening: "listening",
  denied: "mic blocked",
  unavailable: "speech recognition not supported here",
  stalled: "speech recognition unavailable",
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

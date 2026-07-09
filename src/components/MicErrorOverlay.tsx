import type { TranscriberStatus } from "../speech/transcriber";

const MESSAGES: Partial<Record<TranscriberStatus, string>> = {
  denied:
    "Microphone access is blocked. Allow microphone access for this site, then reload to use voice input again.",
  unavailable: "Speech recognition isn't supported in this browser. Try Chrome instead.",
  stalled:
    "The speech recognizer isn't returning any results — your browser may be blocking the " +
    "speech-recognition service. Try Chrome, or check its privacy settings, then reload.",
};

export function MicErrorOverlay({ status }: { status: TranscriberStatus }) {
  const message = MESSAGES[status];
  if (!message) return null;
  return (
    <div className="pause-overlay">
      <div className="pause-card mic-error-card">
        <div className="pause-title mic-error-title">mic trouble</div>
        <div className="pause-sub">{message}</div>
        <div className="pause-sub">Game paused — click or press ESC to keep playing by typing.</div>
      </div>
    </div>
  );
}

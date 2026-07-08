import type { TranscriberStatus } from "../speech/transcriber";

/**
 * Brave exposes `(navigator as any).brave` and resolves `isBrave()` truthy;
 * no other browser defines this. Used only to tailor the "stalled" hint —
 * detection failing just means a slightly more generic message.
 */
function isBrave(): boolean {
  return Boolean((navigator as unknown as { brave?: { isBrave?: () => unknown } }).brave);
}

const STALLED_GENERIC =
  "recognizer isn't returning results — your browser may be blocking the " +
  "speech-recognition service. Try Chrome, or check its privacy settings, then reload.";

const STALLED_BRAVE =
  "recognizer isn't returning results — Brave blocks this by default, enable " +
  '"Use Google services for speech recognition" in brave://settings/system and reload.';

const LABELS: Record<Exclude<TranscriberStatus, "stalled">, string> = {
  idle: "mic off",
  starting: "starting mic…",
  listening: "listening",
  denied: "mic blocked — allow microphone access and reload",
  unavailable: "speech recognition not supported here — try Chrome",
};

export function MicStatus({ status }: { status: TranscriberStatus }) {
  const label = status === "stalled" ? (isBrave() ? STALLED_BRAVE : STALLED_GENERIC) : LABELS[status];
  return (
    <div className="mic-status-wrap">
      <div className={`mic-status mic-${status}`}>
        <span className="mic-dot" />
        {label}
      </div>
    </div>
  );
}

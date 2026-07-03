export function InputDisplay({ text, shake }: { text: string; shake: boolean }) {
  return (
    <div className="input-display-wrap">
      <div className={`input-display${shake ? " shake" : ""}`}>
        {text || <span className="placeholder">type romaji…</span>}
        <span className="caret">▌</span>
      </div>
    </div>
  );
}

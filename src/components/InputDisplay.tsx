interface InputDisplayProps {
  text: string;
  shake: boolean;
  placeholder?: string;
}

export function InputDisplay({ text, shake, placeholder = "type romaji…" }: InputDisplayProps) {
  return (
    <div className="input-display-wrap">
      <div className={`input-display${shake ? " shake" : ""}`}>
        {text || <span className="placeholder">{placeholder}</span>}
        <span className="caret">▌</span>
      </div>
    </div>
  );
}

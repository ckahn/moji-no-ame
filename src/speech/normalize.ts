/** Text normalization for comparing recognizer output against tile text. */

const FULLWIDTH_ASCII = /[！-～]/g;
const HIRAGANA_FIRST = 0x3041; // ぁ
const HIRAGANA_LAST = 0x3096; // ゖ
const HIRAGANA_TO_KATAKANA = 0x60;

/** Converts hiragana to katakana; leaves everything else untouched. */
export function toKatakana(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    out +=
      code >= HIRAGANA_FIRST && code <= HIRAGANA_LAST
        ? String.fromCodePoint(code + HIRAGANA_TO_KATAKANA)
        : ch;
  }
  return out;
}

/**
 * Characters that don't affect matching: spacing, punctuation, and the
 * long-vowel mark ー — recognizers write コーヒ/コーヒー inconsistently, so
 * both sides of a comparison drop it.
 */
const IGNORED = /[ー・、。，．,.!?！？「」『』〜~\s]/gu;

/** Canonical matching form: katakana + lowercase ascii, noise stripped. */
export function matchKey(raw: string): string {
  const ascii = raw.replace(FULLWIDTH_ASCII, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
  return toKatakana(ascii).replace(IGNORED, "").toLowerCase();
}

const KATAKANA_ONLY = /^[ァ-ヶ]+$/u;

/** True when the string is purely kana — i.e. clean Japanese we can judge. */
export function isKatakana(text: string): boolean {
  return KATAKANA_ONLY.test(text);
}

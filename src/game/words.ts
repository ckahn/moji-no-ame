import type { KanaEntry } from "./types";

/** A real katakana word: reading, accepted romaji spellings, English meaning. */
export interface WordEntry {
  kana: string;
  romaji: readonly string[];
  gloss: string;
}

/**
 * Short (2–4 mora) gairaigo, curated so no two words share a romaji prefix or
 * sound alike (e.g. パン but not パンダ, ビル but not ビール) — spoken answers
 * must stay unambiguous. Long vowels accept doubled ("koohii") and IME-dash
 * ("ko-hi-") spellings.
 */
export const WORDS: readonly WordEntry[] = [
  // Food & drink
  { kana: "パン", romaji: ["pan"], gloss: "bread" },
  { kana: "ミルク", romaji: ["miruku"], gloss: "milk" },
  { kana: "ケーキ", romaji: ["keeki", "ke-ki"], gloss: "cake" },
  { kana: "ジュース", romaji: ["juusu", "ju-su"], gloss: "juice" },
  { kana: "コーヒー", romaji: ["koohii", "ko-hi-"], gloss: "coffee" },
  { kana: "スープ", romaji: ["suupu", "su-pu"], gloss: "soup" },
  { kana: "サラダ", romaji: ["sarada"], gloss: "salad" },
  { kana: "トマト", romaji: ["tomato"], gloss: "tomato" },
  { kana: "バナナ", romaji: ["banana"], gloss: "banana" },
  { kana: "メロン", romaji: ["meron"], gloss: "melon" },
  { kana: "レモン", romaji: ["remon"], gloss: "lemon" },
  { kana: "チーズ", romaji: ["chiizu", "chi-zu"], gloss: "cheese" },
  { kana: "バター", romaji: ["bataa", "bata-"], gloss: "butter" },
  { kana: "ピザ", romaji: ["piza"], gloss: "pizza" },
  { kana: "アイス", romaji: ["aisu"], gloss: "ice cream" },
  { kana: "カレー", romaji: ["karee", "kare-"], gloss: "curry" },
  { kana: "ラーメン", romaji: ["raamen", "ra-men"], gloss: "ramen" },
  // Around the house
  { kana: "テレビ", romaji: ["terebi"], gloss: "TV" },
  { kana: "カメラ", romaji: ["kamera"], gloss: "camera" },
  { kana: "ピアノ", romaji: ["piano"], gloss: "piano" },
  { kana: "ギター", romaji: ["gitaa", "gita-"], gloss: "guitar" },
  { kana: "ラジオ", romaji: ["rajio"], gloss: "radio" },
  { kana: "マイク", romaji: ["maiku"], gloss: "microphone" },
  { kana: "ベッド", romaji: ["beddo"], gloss: "bed" },
  { kana: "ソファ", romaji: ["sofa"], gloss: "sofa" },
  { kana: "テーブル", romaji: ["teeburu", "te-buru"], gloss: "table" },
  { kana: "ドア", romaji: ["doa"], gloss: "door" },
  { kana: "ペン", romaji: ["pen"], gloss: "pen" },
  { kana: "ノート", romaji: ["nooto", "no-to"], gloss: "notebook" },
  { kana: "カップ", romaji: ["kappu"], gloss: "cup" },
  { kana: "グラス", romaji: ["gurasu"], gloss: "glass" },
  { kana: "ナイフ", romaji: ["naifu"], gloss: "knife" },
  { kana: "フォーク", romaji: ["fooku", "fo-ku"], gloss: "fork" },
  { kana: "スプーン", romaji: ["supuun", "supu-n"], gloss: "spoon" },
  { kana: "タオル", romaji: ["taoru"], gloss: "towel" },
  { kana: "シャツ", romaji: ["shatsu", "syatsu"], gloss: "shirt" },
  { kana: "ボタン", romaji: ["botan"], gloss: "button" },
  { kana: "ポケット", romaji: ["poketto"], gloss: "pocket" },
  { kana: "バッグ", romaji: ["baggu"], gloss: "bag" },
  { kana: "ズボン", romaji: ["zubon"], gloss: "trousers" },
  // Around town
  { kana: "バス", romaji: ["basu"], gloss: "bus" },
  { kana: "タクシー", romaji: ["takushii", "takushi-"], gloss: "taxi" },
  { kana: "ホテル", romaji: ["hoteru"], gloss: "hotel" },
  { kana: "プール", romaji: ["puuru", "pu-ru"], gloss: "pool" },
  { kana: "ビル", romaji: ["biru"], gloss: "building" },
  { kana: "トイレ", romaji: ["toire"], gloss: "toilet" },
  // Sports & fun
  { kana: "サッカー", romaji: ["sakkaa", "sakka-"], gloss: "soccer" },
  { kana: "テニス", romaji: ["tenisu"], gloss: "tennis" },
  { kana: "ダンス", romaji: ["dansu"], gloss: "dance" },
  { kana: "ゲーム", romaji: ["geemu", "ge-mu"], gloss: "game" },
  { kana: "カード", romaji: ["kaado", "ka-do"], gloss: "card" },
  { kana: "ボール", romaji: ["booru", "bo-ru"], gloss: "ball" },
  { kana: "バット", romaji: ["batto"], gloss: "bat" },
  { kana: "ロボット", romaji: ["robotto"], gloss: "robot" },
  { kana: "アニメ", romaji: ["anime"], gloss: "anime" },
  // Animals
  { kana: "コアラ", romaji: ["koara"], gloss: "koala" },
  { kana: "ゴリラ", romaji: ["gorira"], gloss: "gorilla" },
  { kana: "キリン", romaji: ["kirin"], gloss: "giraffe" },
  { kana: "ライオン", romaji: ["raion"], gloss: "lion" },
];

/** Words shaped as pool entries — words mode is a pool with tile size 1. */
export const WORDS_POOL: readonly KanaEntry[] = WORDS.map(
  (word) => [word.kana, word.romaji] as const,
);

export const WORD_GLOSSES: ReadonlyMap<string, string> = new Map(
  WORDS.map((word) => [word.kana, word.gloss]),
);

const WORD_READINGS: ReadonlyMap<string, string> = new Map(
  WORDS.map((word) => [word.kana, word.romaji[0]!]),
);

export function wordReading(kana: string): string | undefined {
  return WORD_READINGS.get(kana);
}

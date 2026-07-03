import type { KanaEntry, KanaSet, SetKey, SetSelection, TileSizeOption } from "./types";

export const SETS: Record<SetKey, KanaSet> = {
  basic: {
    label: "Basic (五十音)",
    desc: "ア through ン — the core 46",
    kana: [
      ["ア", ["a"]], ["イ", ["i"]], ["ウ", ["u"]], ["エ", ["e"]], ["オ", ["o"]],
      ["カ", ["ka"]], ["キ", ["ki"]], ["ク", ["ku"]], ["ケ", ["ke"]], ["コ", ["ko"]],
      ["サ", ["sa"]], ["シ", ["shi", "si"]], ["ス", ["su"]], ["セ", ["se"]], ["ソ", ["so"]],
      ["タ", ["ta"]], ["チ", ["chi", "ti"]], ["ツ", ["tsu", "tu"]], ["テ", ["te"]], ["ト", ["to"]],
      ["ナ", ["na"]], ["ニ", ["ni"]], ["ヌ", ["nu"]], ["ネ", ["ne"]], ["ノ", ["no"]],
      ["ハ", ["ha"]], ["ヒ", ["hi"]], ["フ", ["fu", "hu"]], ["ヘ", ["he"]], ["ホ", ["ho"]],
      ["マ", ["ma"]], ["ミ", ["mi"]], ["ム", ["mu"]], ["メ", ["me"]], ["モ", ["mo"]],
      ["ヤ", ["ya"]], ["ユ", ["yu"]], ["ヨ", ["yo"]],
      ["ラ", ["ra"]], ["リ", ["ri"]], ["ル", ["ru"]], ["レ", ["re"]], ["ロ", ["ro"]],
      ["ワ", ["wa"]], ["ヲ", ["wo", "o"]], ["ン", ["n", "nn"]],
    ],
  },
  dakuten: {
    label: "Dakuten & Handakuten (濁点・半濁点)",
    desc: "The little marks — ガ, ザ, ダ, バ, パ rows",
    kana: [
      ["ガ", ["ga"]], ["ギ", ["gi"]], ["グ", ["gu"]], ["ゲ", ["ge"]], ["ゴ", ["go"]],
      ["ザ", ["za"]], ["ジ", ["ji", "zi"]], ["ズ", ["zu"]], ["ゼ", ["ze"]], ["ゾ", ["zo"]],
      ["ダ", ["da"]], ["ヂ", ["ji", "di"]], ["ヅ", ["zu", "du"]], ["デ", ["de"]], ["ド", ["do"]],
      ["バ", ["ba"]], ["ビ", ["bi"]], ["ブ", ["bu"]], ["ベ", ["be"]], ["ボ", ["bo"]],
      ["パ", ["pa"]], ["ピ", ["pi"]], ["プ", ["pu"]], ["ペ", ["pe"]], ["ポ", ["po"]],
    ],
  },
  yoon: {
    label: "Yōon (拗音)",
    desc: "Big + small combos — キャ, シュ, ジョ…",
    kana: [
      ["キャ", ["kya"]], ["キュ", ["kyu"]], ["キョ", ["kyo"]],
      ["シャ", ["sha", "sya"]], ["シュ", ["shu", "syu"]], ["ショ", ["sho", "syo"]],
      ["チャ", ["cha", "tya"]], ["チュ", ["chu", "tyu"]], ["チョ", ["cho", "tyo"]],
      ["ニャ", ["nya"]], ["ニュ", ["nyu"]], ["ニョ", ["nyo"]],
      ["ヒャ", ["hya"]], ["ヒュ", ["hyu"]], ["ヒョ", ["hyo"]],
      ["ミャ", ["mya"]], ["ミュ", ["myu"]], ["ミョ", ["myo"]],
      ["リャ", ["rya"]], ["リュ", ["ryu"]], ["リョ", ["ryo"]],
      ["ギャ", ["gya"]], ["ギュ", ["gyu"]], ["ギョ", ["gyo"]],
      ["ジャ", ["ja", "jya", "zya"]], ["ジュ", ["ju", "jyu", "zyu"]], ["ジョ", ["jo", "jyo", "zyo"]],
      ["ビャ", ["bya"]], ["ビュ", ["byu"]], ["ビョ", ["byo"]],
      ["ピャ", ["pya"]], ["ピュ", ["pyu"]], ["ピョ", ["pyo"]],
    ],
  },
};

export const TILE_SIZES: readonly TileSizeOption[] = [
  { value: 1, label: "Single", desc: "one kana per falling tile" },
  { value: 2, label: "Double", desc: "type both together" },
  { value: 3, label: "Triple", desc: "three-part tiles" },
  { value: 4, label: "Quad", desc: "longer chunks" },
];

export const SET_KEYS = Object.keys(SETS) as readonly SetKey[];

/** Every kana across all sets → its romaji spellings. */
export const ROMAJI: ReadonlyMap<string, readonly string[]> = new Map(
  Object.values(SETS).flatMap((set) => set.kana.map(([k, r]) => [k, r] as const)),
);

export function selectedPool(selected: SetSelection): readonly KanaEntry[] {
  return SET_KEYS.filter((key) => selected[key]).flatMap((key) => SETS[key].kana);
}

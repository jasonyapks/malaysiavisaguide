// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
/**
 * Simplified Chinese for the nationality picker in the cost calculator.
 *
 * These are not programme prose, so they do not belong in the
 * `locales/programmes` overlay: they come from `data/nationality-fees.ts`,
 * where the visa-fee and security-bond schedules are keyed by the English
 * label. That label stays the stored value and only its rendering changes, so
 * selecting a country cannot behave differently by locale.
 *
 * A missing entry falls back to the English name, and `check-countries` fails
 * the build on one — a country added to the fee schedule without a translation
 * would otherwise sit in English in the middle of a Chinese dropdown.
 *
 * Traditional is generated from this file — run `npm run i18n:hant`.
 */
export const countries: Record<string, string> = {
  "Other / not listed": "其他／未列出",
  Angola: "安哥拉",
  Argentina: "阿根廷",
  Australia: "澳大利亞",
  Bangladesh: "孟加拉國",
  Bhutan: "不丹",
  Bolivia: "玻利維亞",
  Brazil: "巴西",
  Brunei: "文萊",
  // The fee schedule lists Burma and Myanmar as separate rows; both are kept,
  // and the older name is marked so the two are not read as a duplicate.
  Burma: "緬甸（Burma）",
  "Burkina Faso": "布基納法索",
  Bulgaria: "保加利亞",
  Burundi: "布隆迪",
  Cameroon: "喀麥隆",
  Canada: "加拿大",
  "Central African Republic": "中非共和國",
  Chile: "智利",
  China: "中國",
  Colombia: "哥倫比亞",
  "Congo, Democratic Republic of the": "剛果民主共和國",
  "Congo, Republic of the": "剛果共和國",
  "Costa Rica": "哥斯達黎加",
  "Côte d’Ivoire": "科特迪瓦",
  "Czech & Slovak": "捷克與斯洛伐克",
  Denmark: "丹麥",
  Djibouti: "吉布提",
  "Dominican Republic": "多米尼加共和國",
  Ecuador: "厄瓜多爾",
  "Equatorial Guinea": "赤道幾內亞",
  Eritrea: "厄立特里亞",
  Ethiopia: "埃塞俄比亞",
  Finland: "芬蘭",
  France: "法國",
  Ghana: "加納",
  "Guinea-Bissau": "幾內亞比紹",
  Haiti: "海地",
  "Hong Kong": "香港",
  Hungary: "匈牙利",
  India: "印度",
  Indonesia: "印度尼西亞",
  Iran: "伊朗",
  Iraq: "伊拉克",
  Israel: "以色列",
  Italy: "意大利",
  Japan: "日本",
  Liberia: "利比里亞",
  Macao: "澳門",
  Mali: "馬裡",
  Mexico: "墨西哥",
  Mozambique: "莫桑比克",
  Myanmar: "緬甸",
  Nepal: "尼泊爾",
  Niger: "尼日爾",
  Nigeria: "尼日利亞",
  Pakistan: "巴基斯坦",
  Panama: "巴拿馬",
  Peru: "秘魯",
  Philippines: "菲律賓",
  Poland: "波蘭",
  Portugal: "葡萄牙",
  Rwanda: "盧旺達",
  "Saudi Arabia": "沙特阿拉伯",
  Singapore: "新加坡",
  "South Korea": "韓國",
  "Sri Lanka": "斯里蘭卡",
  Sudan: "蘇丹",
  Taiwan: "臺灣",
  Thailand: "泰國",
  Tunisia: "突尼斯",
  "United States of America": "美國",
  Uruguay: "烏拉圭",
  Venezuela: "委內瑞拉",
  Vietnam: "越南",
  "Western Sahara": "西撒哈拉",
};

/**
 * The handful of nationality rows that carry a note of their own, keyed the
 * same way. Separate from `countries` because almost none of them have one and
 * a second optional field on every row would be mostly empty.
 */
export const countryNotes: Record<string, string> = {
  "Other / not listed": "收費表本身對未列名國家所採用的默認值。",
  Burma: "簽證費收費表把 Burma 與 Myanmar 列為兩行，分別為 RM19.50 與 RM20.00。兩者都列出；以你的代理報出的那一個為準。",
};

/**
 * Who the visa-fee and security-bond schedules come from.
 *
 * `NATIONALITY_FEE_ATTRIBUTION.by` in data/nationality-fees.ts, which is a
 * sentence rather than a name and so needs translating like one. Keyed by the
 * English so it fails the same way everything else here does if it is reworded.
 */
export const feeAttribution: Record<string, string> = {
  "MYPVIP, from the Immigration Department fee schedules":
    "MYPVIP，依據移民局的收費表",
};

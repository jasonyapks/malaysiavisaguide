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
  Australia: "澳大利亚",
  Bangladesh: "孟加拉国",
  Bhutan: "不丹",
  Bolivia: "玻利维亚",
  Brazil: "巴西",
  Brunei: "文莱",
  // The fee schedule lists Burma and Myanmar as separate rows; both are kept,
  // and the older name is marked so the two are not read as a duplicate.
  Burma: "缅甸（Burma）",
  "Burkina Faso": "布基纳法索",
  Bulgaria: "保加利亚",
  Burundi: "布隆迪",
  Cameroon: "喀麦隆",
  Canada: "加拿大",
  "Central African Republic": "中非共和国",
  Chile: "智利",
  China: "中国",
  Colombia: "哥伦比亚",
  "Congo, Democratic Republic of the": "刚果民主共和国",
  "Congo, Republic of the": "刚果共和国",
  "Costa Rica": "哥斯达黎加",
  "Côte d’Ivoire": "科特迪瓦",
  "Czech & Slovak": "捷克与斯洛伐克",
  Denmark: "丹麦",
  Djibouti: "吉布提",
  "Dominican Republic": "多米尼加共和国",
  Ecuador: "厄瓜多尔",
  "Equatorial Guinea": "赤道几内亚",
  Eritrea: "厄立特里亚",
  Ethiopia: "埃塞俄比亚",
  Finland: "芬兰",
  France: "法国",
  Ghana: "加纳",
  "Guinea-Bissau": "几内亚比绍",
  Haiti: "海地",
  "Hong Kong": "香港",
  Hungary: "匈牙利",
  India: "印度",
  Indonesia: "印度尼西亚",
  Iran: "伊朗",
  Iraq: "伊拉克",
  Israel: "以色列",
  Italy: "意大利",
  Japan: "日本",
  Liberia: "利比里亚",
  Macao: "澳门",
  Mali: "马里",
  Mexico: "墨西哥",
  Mozambique: "莫桑比克",
  Myanmar: "缅甸",
  Nepal: "尼泊尔",
  Niger: "尼日尔",
  Nigeria: "尼日利亚",
  Pakistan: "巴基斯坦",
  Panama: "巴拿马",
  Peru: "秘鲁",
  Philippines: "菲律宾",
  Poland: "波兰",
  Portugal: "葡萄牙",
  Rwanda: "卢旺达",
  "Saudi Arabia": "沙特阿拉伯",
  Singapore: "新加坡",
  "South Korea": "韩国",
  "Sri Lanka": "斯里兰卡",
  Sudan: "苏丹",
  Taiwan: "台湾",
  Thailand: "泰国",
  Tunisia: "突尼斯",
  "United States of America": "美国",
  Uruguay: "乌拉圭",
  Venezuela: "委内瑞拉",
  Vietnam: "越南",
  "Western Sahara": "西撒哈拉",
};

/**
 * The handful of nationality rows that carry a note of their own, keyed the
 * same way. Separate from `countries` because almost none of them have one and
 * a second optional field on every row would be mostly empty.
 */
export const countryNotes: Record<string, string> = {
  "Other / not listed": "收费表本身对未列名国家所采用的默认值。",
  Burma: "签证费收费表把 Burma 与 Myanmar 列为两行，分别为 RM19.50 与 RM20.00。两者都列出；以你的代理报出的那一个为准。",
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
    "MYPVIP，依据移民局的收费表",
};

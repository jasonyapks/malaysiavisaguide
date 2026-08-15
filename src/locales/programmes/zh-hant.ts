// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import type { ProgrammeSlug } from "@/lib/data/programmes";

/**
 * Chinese for the free-text fields in `programmes.ts`.
 *
 * ## Why an overlay and not a `zh` block inside programmes.ts
 *
 * SPEC.md §4.1 makes `programmes.ts` the sole source of every figure on the
 * site, and that rule is load-bearing — it is the reason four pages cannot
 * disagree about the same fee. Adding translations into that file would put
 * three copies of each record side by side and invite exactly the drift the
 * rule prevents.
 *
 * So the split is by kind, not by language: **no number appears here.** Fees,
 * deposits, thresholds, tenures and dates are read from `programmes.ts` on
 * every page in every language, and formatted by the `facts` strings in the UI
 * dictionary. What lives here is only the handful of fields that are English
 * prose — the ones a translator has to actually write.
 *
 * A missing entry falls back to the English string. That is deliberate: an
 * untranslated authority name is a visible blemish someone will report,
 * whereas a thrown error would take down a page over a caption.
 *
 * ## Authority names keep the English in brackets
 *
 * The home page argues these should stay in English so a reader can verify
 * them against the document they land on. In a key-facts table there is room
 * for both, so both are given — the Chinese so the reader knows which ministry
 * it is, the English so it matches the letterhead.
 */
export type ProgrammeProse = {
  name?: string;
  /** The correction banner's prose — a date phrase, who confirmed it, and the
   *  bullets. Numbers inside the bullets are written exactly as programmes.ts
   *  writes them, for the same reason the guide copy does. */
  superseded?: {
    changedOn?: string;
    attributionBy?: string;
    whatChanged?: string[];
  };
  authority?: string;
  minStayPerYear?: string;
  minStayShort?: string;
  sponsor?: string;
  sponsorShort?: string;
  renewalLimit?: string;
  withdrawable?: string;
  propertyStateFloorNote?: string;
  /** The tier table's agency-fee footnote, which is three prose fields. */
  agencyFee?: { note?: string; includes?: string[]; paymentTerms?: string };
  dependants?: string[];
};

export const prose: Partial<Record<ProgrammeSlug, ProgrammeProse>> = {
  pvip: {
    name: "高端簽證計劃（PVIP）",
    superseded: {
      changedOn: "2026 年 3 月 16 日",
      attributionBy: "MYPVIP 的實務操作",
      whatChanged: [
        "定期存款改為存滿六個月後即可提取，而非原本的一年。可提取上限不變，仍為質押金額的 50%。",
        "家屬現在可以選擇 10 年期、繳 RM50,000，為 20 年期 RM100,000（價格不變）的一半。主申請人的期限固定為 20 年，沒有這個選項。",
        "每月 RM40,000 的收入要求不變，但可計入的範圍比 2022 年常見問答所述更寬。不要求是工資 —— 已實現的投資收益、租金收入和退休金提領都算。也不要求收入來自境外：馬來西亞本地收入現在同樣可以計入，前提是能出示已就該收入繳納大馬所得稅的證明。",
      ],
    },
    authority: "馬來西亞移民局（Immigration Department of Malaysia）",
    minStayPerYear: "無",
    minStayShort: "無",
    dependants: ["配偶", "子女", "父母", "外籍家庭傭工"],
  },

  "mm2h-silver": {
    name: "MM2H 白銀級",
    authority: "旅遊、藝術及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的實務操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房產購置完成之後才打開，而不是在申請獲批之時。因此它不能用來支付這筆購房款，而且購置住宅也已不在獲准的用途之列 —— 在馬來西亞的教育、醫療和旅遊支出仍然可以。",
        "受養子女的資格上限為 34 歲，也就是在 35 歲生日之前。官方指南寫的「最高至 35 歲」，比實際執行的口徑寬了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 歲每年 90 天，可由主申請人和／或配偶及家屬合併計算。50 歲起沒有最低居住天數要求。",
    minStayShort: "90 天（25–49 歲）",
    withdrawable:
      "在計劃中滿六個月後，最多可提取 50% —— 2026 年新條款把原本的一年縮短為六個月。",
    propertyStateFloorNote:
      "這是全國最低標準。買房所在的州屬會為外國買家另設自己的門檻，通常更高 —— 雪蘭莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正約束這筆交易的是州屬的那一個。",
    agencyFee: {
      note: "由政府固定，不由代理機構訂定 —— 這裡沒有議價空間；報價高於這個數字的，是報錯了，而不是比較貴。",
      includes: [
        "主申請人的手續費",
        "主申請人前五年的準證費",
        "主申請人前五年的簽證費",
        "主申請人的保證金",
      ],
      paymentTerms: "遞交時付 20%，批准後付其餘 80%。",
    },
  },
  "mm2h-gold": {
    name: "MM2H 黃金級",
    authority: "旅遊、藝術及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的實務操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房產購置完成之後才打開，而不是在申請獲批之時。因此它不能用來支付這筆購房款，而且購置住宅也已不在獲准的用途之列 —— 在馬來西亞的教育、醫療和旅遊支出仍然可以。",
        "受養子女的資格上限為 34 歲，也就是在 35 歲生日之前。官方指南寫的「最高至 35 歲」，比實際執行的口徑寬了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 歲每年 90 天，可由主申請人和／或配偶及家屬合併計算。50 歲起沒有最低居住天數要求。",
    minStayShort: "90 天（25–49 歲）",
    withdrawable:
      "在計劃中滿六個月後，最多可提取 50% —— 2026 年新條款把原本的一年縮短為六個月。",
    propertyStateFloorNote:
      "這是全國最低標準。買房所在的州屬會為外國買家另設自己的門檻，通常更高 —— 雪蘭莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正約束這筆交易的是州屬的那一個。",
    agencyFee: {
      note: "由政府固定，不由代理機構訂定 —— 這裡沒有議價空間；報價高於這個數字的，是報錯了，而不是比較貴。",
      includes: [
        "主申請人的手續費",
        "主申請人前五年的準證費",
        "主申請人前五年的簽證費",
        "主申請人的保證金",
      ],
      paymentTerms: "遞交時付 20%，批准後付其餘 80%。",
    },
  },
  "mm2h-platinum": {
    name: "MM2H 白金級",
    authority: "旅遊、藝術及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的實務操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房產購置完成之後才打開，而不是在申請獲批之時。因此它不能用來支付這筆購房款，而且購置住宅也已不在獲准的用途之列 —— 在馬來西亞的教育、醫療和旅遊支出仍然可以。",
        "受養子女的資格上限為 34 歲，也就是在 35 歲生日之前。官方指南寫的「最高至 35 歲」，比實際執行的口徑寬了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 歲每年 90 天，可由主申請人和／或配偶及家屬合併計算。50 歲起沒有最低居住天數要求。",
    minStayShort: "90 天（25–49 歲）",
    withdrawable:
      "在計劃中滿六個月後，最多可提取 50% —— 2026 年新條款把原本的一年縮短為六個月。",
    propertyStateFloorNote:
      "這是全國最低標準。買房所在的州屬會為外國買家另設自己的門檻，通常更高 —— 雪蘭莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正約束這筆交易的是州屬的那一個。",
    agencyFee: {
      note: "由政府固定，不由代理機構訂定 —— 這裡沒有議價空間；報價高於這個數字的，是報錯了，而不是比較貴。",
      includes: [
        "主申請人的手續費",
        "主申請人前五年的準證費",
        "主申請人前五年的簽證費",
        "主申請人的保證金",
      ],
      paymentTerms: "遞交時付 20%，批准後付其餘 80%。",
    },
  },

  smm2h: {
    name: "砂拉越 MM2H（S-MM2H）",
  },

  "de-rantau": {
    name: "DE Rantau 數字遊民準證",
    authority: "馬來西亞數字經濟機構（MDEC）",
    renewalLimit: "僅可續簽一次",
    sponsor: "外國註冊的僱主，或位於海外的客戶",
    sponsorShort: "海外僱主或客戶",
  },

  "employment-pass": {
    name: "工作準證（Employment Pass）",
    authority: "外籍人士服務局（ESD）／移民局",
    sponsor: "馬來西亞僱主，並須經外籍人士委員會批准",
    sponsorShort: "馬來西亞僱主",
  },

  "student-pass": {
    name: "學生準證（Student Pass）",
    authority: "移民局／EMGS",
  },
};

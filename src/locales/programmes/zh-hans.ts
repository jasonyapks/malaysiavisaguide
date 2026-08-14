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
  authority?: string;
  minStayPerYear?: string;
  minStayShort?: string;
  sponsor?: string;
  sponsorShort?: string;
  renewalLimit?: string;
  withdrawable?: string;
  dependants?: string[];
};

export const prose: Partial<Record<ProgrammeSlug, ProgrammeProse>> = {
  pvip: {
    name: "高端签证计划（PVIP）",
    authority: "马来西亚移民局（Immigration Department of Malaysia）",
    minStayPerYear: "无",
    minStayShort: "无",
    dependants: ["配偶", "子女", "父母", "外籍家庭佣工"],
  },

  "mm2h-silver": {
    name: "MM2H 白银级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
  },
  "mm2h-gold": {
    name: "MM2H 黄金级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
  },
  "mm2h-platinum": {
    name: "MM2H 白金级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
  },

  smm2h: {
    name: "砂拉越 MM2H（S-MM2H）",
  },

  "de-rantau": {
    name: "DE Rantau 数字游民准证",
    authority: "马来西亚数字经济机构（MDEC）",
    renewalLimit: "仅可续签一次",
    sponsor: "外国注册的雇主，或位于海外的客户",
    sponsorShort: "海外雇主或客户",
  },

  "employment-pass": {
    name: "工作准证（Employment Pass）",
    authority: "外籍人士服务局（ESD）／移民局",
    sponsor: "马来西亚雇主，并须经外籍人士委员会批准",
    sponsorShort: "马来西亚雇主",
  },

  "student-pass": {
    name: "学生准证（Student Pass）",
    authority: "移民局／EMGS",
  },
};

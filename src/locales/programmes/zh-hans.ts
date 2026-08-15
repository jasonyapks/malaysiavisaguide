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
    name: "高端签证计划（PVIP）",
    superseded: {
      changedOn: "2026 年 3 月 16 日",
      attributionBy: "MYPVIP 的实务操作",
      whatChanged: [
        "定期存款改为存满六个月后即可提取，而非原本的一年。可提取上限不变，仍为质押金额的 50%。",
        "家属现在可以选择 10 年期、缴 RM50,000，为 20 年期 RM100,000（价格不变）的一半。主申请人的期限固定为 20 年，没有这个选项。",
        "每月 RM40,000 的收入要求不变，但可计入的范围比 2022 年常见问答所述更宽。不要求是工资 —— 已实现的投资收益、租金收入和退休金提领都算。也不要求收入来自境外：马来西亚本地收入现在同样可以计入，前提是能出示已就该收入缴纳大马所得税的证明。",
      ],
    },
    authority: "马来西亚移民局（Immigration Department of Malaysia）",
    minStayPerYear: "无",
    minStayShort: "无",
    dependants: ["配偶", "子女", "父母", "外籍家庭佣工"],
  },

  "mm2h-silver": {
    name: "MM2H 白银级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的实务操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房产购置完成之后才打开，而不是在申请获批之时。因此它不能用来支付这笔购房款，而且购置住宅也已不在获准的用途之列 —— 在马来西亚的教育、医疗和旅游支出仍然可以。",
        "受养子女的资格上限为 34 岁，也就是在 35 岁生日之前。官方指南写的「最高至 35 岁」，比实际执行的口径宽了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 岁每年 90 天，可由主申请人和／或配偶及家属合并计算。50 岁起没有最低居住天数要求。",
    minStayShort: "90 天（25–49 岁）",
    withdrawable:
      "在计划中满六个月后，最多可提取 50% —— 2026 年新条款把原本的一年缩短为六个月。",
    propertyStateFloorNote:
      "这是全国最低标准。买房所在的州属会为外国买家另设自己的门槛，通常更高 —— 雪兰莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正约束这笔交易的是州属的那一个。",
    agencyFee: {
      note: "由政府固定，不由代理机构订定 —— 这里没有议价空间；报价高于这个数字的，是报错了，而不是比较贵。",
      includes: [
        "主申请人的手续费",
        "主申请人前五年的准证费",
        "主申请人前五年的签证费",
        "主申请人的保证金",
      ],
      paymentTerms: "递交时付 20%，批准后付其余 80%。",
    },
  },
  "mm2h-gold": {
    name: "MM2H 黄金级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的实务操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房产购置完成之后才打开，而不是在申请获批之时。因此它不能用来支付这笔购房款，而且购置住宅也已不在获准的用途之列 —— 在马来西亚的教育、医疗和旅游支出仍然可以。",
        "受养子女的资格上限为 34 岁，也就是在 35 岁生日之前。官方指南写的「最高至 35 岁」，比实际执行的口径宽了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 岁每年 90 天，可由主申请人和／或配偶及家属合并计算。50 岁起没有最低居住天数要求。",
    minStayShort: "90 天（25–49 岁）",
    withdrawable:
      "在计划中满六个月后，最多可提取 50% —— 2026 年新条款把原本的一年缩短为六个月。",
    propertyStateFloorNote:
      "这是全国最低标准。买房所在的州属会为外国买家另设自己的门槛，通常更高 —— 雪兰莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正约束这笔交易的是州属的那一个。",
    agencyFee: {
      note: "由政府固定，不由代理机构订定 —— 这里没有议价空间；报价高于这个数字的，是报错了，而不是比较贵。",
      includes: [
        "主申请人的手续费",
        "主申请人前五年的准证费",
        "主申请人前五年的签证费",
        "主申请人的保证金",
      ],
      paymentTerms: "递交时付 20%，批准后付其余 80%。",
    },
  },
  "mm2h-platinum": {
    name: "MM2H 白金级",
    authority: "旅游、艺术及文化部（MOTAC，MM2H 一站式中心）",
    superseded: {
      changedOn: "2026 年 8 月 3 日",
      attributionBy: "MYPVIP 的实务操作",
      whatChanged: [
        "定期存款 50% 的提取窗口，在房产购置完成之后才打开，而不是在申请获批之时。因此它不能用来支付这笔购房款，而且购置住宅也已不在获准的用途之列 —— 在马来西亚的教育、医疗和旅游支出仍然可以。",
        "受养子女的资格上限为 34 岁，也就是在 35 岁生日之前。官方指南写的「最高至 35 岁」，比实际执行的口径宽了一年。",
      ],
    },
    minStayPerYear:
      "25 至 49 岁每年 90 天，可由主申请人和／或配偶及家属合并计算。50 岁起没有最低居住天数要求。",
    minStayShort: "90 天（25–49 岁）",
    withdrawable:
      "在计划中满六个月后，最多可提取 50% —— 2026 年新条款把原本的一年缩短为六个月。",
    propertyStateFloorNote:
      "这是全国最低标准。买房所在的州属会为外国买家另设自己的门槛，通常更高 —— 雪兰莪 RM2,000,000，吉隆坡 RM1,000,000 —— 真正约束这笔交易的是州属的那一个。",
    agencyFee: {
      note: "由政府固定，不由代理机构订定 —— 这里没有议价空间；报价高于这个数字的，是报错了，而不是比较贵。",
      includes: [
        "主申请人的手续费",
        "主申请人前五年的准证费",
        "主申请人前五年的签证费",
        "主申请人的保证金",
      ],
      paymentTerms: "递交时付 20%，批准后付其余 80%。",
    },
  },

  smm2h: {
    name: "砂拉越 MM2H（S-MM2H）",
    authority:
      "砂拉越旅游、创意产业及表演艺术部（Ministry of Tourism, Creative Industry and Performing Arts Sarawak, MTCP）",
    minStayPerYear: "每年在砂拉越累计 30 天，仅主申请人须符合。",
    minStayShort: "30 天（仅主申请人）",
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
    sponsor: "就读的院校，并经 EMGS 审核",
    sponsorShort: "就读院校",
  },
};

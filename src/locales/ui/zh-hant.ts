// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import type { UiStrings } from "./en";

/**
 * Simplified Chinese chrome.
 *
 * This file is the SOURCE for both Chinese trees. `scripts/gen-zh-hant.mjs`
 * converts it to `zh-hant.ts` — do not hand-edit that file, your change will be
 * overwritten on the next build.
 *
 * Programme acronyms stay in Latin script on purpose. PVIP, MM2H and DE Rantau
 * are what the government, the agencies and the applicants themselves write,
 * and they are what Chinese-language searchers actually type; a purely
 * translated name would rank for nothing. Each one gets a short Chinese gloss
 * beside it so a first-time reader knows what it is.
 */
export const ui: UiStrings = {
  siteName: "馬來西亞簽證指南",
  siteDescription:
    "獨立解讀馬來西亞長期居留簽證 —— PVIP、MM2H、砂拉越 MM2H 與 DE Rantau。費用、條件與辦理時程，全部核對官方來源。",
  strapline: ["獨立簽證指南", "並非政府機構"],
  askQuestion: "諮詢提問",
  menu: "選單",
  ariaPrimaryNav: "主導航",
  ariaFooterNav: "頁腳導航",
  ariaLanguage: "語言",

  navGroups: {
    programmes: "長期居留簽證",
    "work-study": "工作與留學",
    tools: "工具與對比",
    reading: "觀點與新聞",
  },

  routeTitles: {
    "/": "首頁",
    "/insights/": "深度觀點",
    "/news/": "最新消息",
    "/visas/pvip/": "PVIP 高端簽證",
    "/visas/mm2h/": "MM2H 第二家園",
    "/visas/sarawak-mm2h/": "砂拉越 MM2H",
    "/visas/de-rantau/": "DE Rantau 數字遊民",
    "/visas/employment-pass/": "工作準證",
    "/visas/student-pass/": "學生準證",
    "/compare/": "方案對比",
    "/tools/eligibility/": "資格評估",
    "/tools/cost-calculator/": "費用計算器",
    "/tools/": "實用工具",
    "/about/": "關於我們",
    "/editorial-policy/": "編輯方針",
    "/privacy/": "隱私政策",
    "/contact/": "聯繫我們",
  },

  footer: {
    heading: "把計劃、真實數字講清楚，",
    headingAccent: "絕不推銷",
    disclosureTitle: "出版方與利益聲明",
    disclosureBefore:
      "本站是獨立指南 —— 與馬來西亞移民局或任何政府機構均無隸屬關係。出版人為 Jason Yap，他同時是 ",
    disclosureMypvip: "MYPVIP",
    disclosureBetween: " 的董事總經理；該持牌代理機構提供的服務，說明見",
    disclosureAbout: "關於我們",
    disclosureAfter: "。",
    rights: "版權所有。",
  },

  guide: {
    onThisPage: "本頁內容",
    contentsSuits: "適合誰",
    contentsQuestions: "常見問題",
    honestFitEyebrow: "老實說適不適合",
    honestFitTitleLead: "它適合誰 —— 以及",
    honestFitTitleAccent: "不適合誰",
    goodFitIf: "以下情況適合",
    lookElsewhereIf: "以下情況請另選",
    ctaDefault: "繼續",
    faqEyebrow: "常見問答",
    faqTitleLead: "常見",
    faqTitleAccent: "問題",
    atAGlance: "一覽",
    keyFactsHeading: "關鍵數據",
    sourceLabel: "來源：",
    listSeparator: "，",
    keyFactsLabel: (programme) => `${programme} 關鍵數據`,
    bylineBefore: "撰寫與複核：",
    bylineMid: "，",
    bylineAfter: " 董事總經理",
    bylineLastReviewed: (date) => `最後複核於 ${date}。`,
    tiers: {
      fixedDeposit: "定期存款",
      propertyPurchase: "房產購置",
      optional: "非強制",
      term: "年限",
      participationFee: "參與費",
      agencyFee: "代理費",
      notGovernmentSet: "非政府訂定",
      agencyFeeCommercialNote:
        "由代理機構按商業方式訂定，沒有任何官方渠道公佈。在簽約之前，請要求以書面給出金額。",
      agencyFeeCovers: (note, includes, terms) =>
        `${note} 涵蓋${includes}。${terms}`,
      processingFee: "手續費",
      processingFeePrincipal: (amount) => `主申請人 ${amount}`,
      processingFeeAbsorbed:
        "已包含在上方的代理費之內 —— 報價單上不應重複出現。",
      minAge: "最低年齡",
      minStay: "最低居住天數",
      workRights: "工作權利",
      workYes: "可以",
      workRestricted: "受限",
      workNo: "不可",
      workFullNote: "可工作並經營生意。",
      workRestrictedNote: "附帶條件。",
      sponsor: "擔保方",
      incomeFloor: "收入門檻",
      noneStated: "未訂明",
      maximumTerm: "最長年限",
      governmentFee: "政府收費",
      dependants: "隨行家屬",
      permitted: "允許",
      notPermitted: "不允許",
      renewableSuffix: "，可續簽",
      attributeColumn: "項目",
      seeNote: "見注 ",
    },
    superseded: {
      termsChangedOn: (programme, date) => `${programme} 的條款已於 ${date} 變更`,
      figuresArePrevious: " —— 下方顯示的仍是舊數字",
      showWhatChanged: "查看變更內容",
      hide: "收起",
      confirmedByBefore: "此說法來自 ",
      confirmedByAfter: (date) => `，截至 ${date} 仍然有效。`,
      officialDocument: (authority) => `${authority} 的官方文件`,
      notYetUpdated:
        "尚未更新，因此這些條款無法引用政府來源作為依據。",
      treatAsUnconfirmed:
        "在官方更新之前，請把本頁的每一個數字都視為需要另行確認後才可據以行動。",
    },
    facts: {
      authority: "主管機構",
      tenure: "簽證年限",
      minAge: "最低年齡",
      fixedDeposit: "定期存款",
      incomeRequirement: "收入要求",
      minSalary: "最低薪資",
      sponsorRequired: "需要擔保方",
      propertyPurchase: "房產購置",
      participationFee: "參與費",
      processingFee: "手續費",
      minStay: "最低居住天數",
      workRights: "工作權利",
      none: "無",
      renewable: "可續簽",
      aMonth: (amount) => `每月 ${amount}`,
      from: (amount) => `${amount} 起`,
      principal: (amount) => `主申請人 ${amount}`,
      principalAndDependant: (principal, dependant) =>
        `主申請人 ${principal}，每名家屬 ${dependant}`,
      perDependantTerms: (principal, terms) =>
        `主申請人 ${principal}。每名家屬：${terms}`,
      forYears: (amount, years) => `${amount}／${years}`,
      or: "，或 ",
      workRightsFull: "完整 —— 可工作及經營生意",
      workRightsRestricted: "受限 —— 附帶條件",
      workRightsNone: "無",
    },
  },

  consent: {
    heading: "本站使用的 Cookie",
    body: "分析類 Cookie 讓我們知道哪些指南有人讀。你不開啟，它就不會啟用；開不開啟，網站的功能完全一樣。",
    privacyLink: "隱私政策",
    decline: "拒絕",
    accept: "接受",
  },

  notFound: {
    eyebrow: "錯誤 404",
    heading: "這個頁面",
    headingAccent: "不在這裡",
    lead: "鏈接可能已經過期，或者頁面已經搬走。本指南涵蓋的全部內容都在下面。",
    tailBefore: "在找特定的內容？可以看看",
    tailNews: "最新消息",
    tailBetween: "，或者直接",
    tailContact: "提出問題",
    tailAfter: "，撰寫這些指南的人會親自回覆你。",
    metaTitle: "頁面不存在",
  },
};

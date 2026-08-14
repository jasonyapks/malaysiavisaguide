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
  siteName: "马来西亚签证指南",
  siteDescription:
    "独立解读马来西亚长期居留签证 —— PVIP、MM2H、砂拉越 MM2H 与 DE Rantau。费用、条件与办理时程，全部核对官方来源。",
  strapline: ["独立签证指南", "并非政府机构"],
  askQuestion: "咨询提问",
  menu: "菜单",
  ariaPrimaryNav: "主导航",
  ariaFooterNav: "页脚导航",
  ariaLanguage: "语言",

  navGroups: {
    programmes: "长期居留签证",
    "work-study": "工作与留学",
    tools: "工具与对比",
    reading: "观点与新闻",
  },

  routeTitles: {
    "/": "首页",
    "/insights/": "深度观点",
    "/news/": "最新消息",
    "/visas/pvip/": "PVIP 高端签证",
    "/visas/mm2h/": "MM2H 第二家园",
    "/visas/sarawak-mm2h/": "砂拉越 MM2H",
    "/visas/de-rantau/": "DE Rantau 数字游民",
    "/visas/employment-pass/": "工作准证",
    "/visas/student-pass/": "学生准证",
    "/compare/": "方案对比",
    "/tools/eligibility/": "资格评估",
    "/tools/cost-calculator/": "费用计算器",
    "/tools/": "实用工具",
    "/about/": "关于我们",
    "/editorial-policy/": "编辑方针",
    "/privacy/": "隐私政策",
    "/contact/": "联系我们",
  },

  footer: {
    heading: "把计划、真实数字讲清楚，",
    headingAccent: "绝不推销",
    disclosureTitle: "出版方与利益声明",
    disclosureBefore:
      "本站是独立指南 —— 与马来西亚移民局或任何政府机构均无隶属关系。出版人为 Jason Yap，他同时是 ",
    disclosureMypvip: "MYPVIP",
    disclosureBetween: " 的董事总经理；该持牌代理机构提供的服务，说明见",
    disclosureAbout: "关于我们",
    disclosureAfter: "。",
    rights: "版权所有。",
  },

  guide: {
    onThisPage: "本页内容",
    contentsSuits: "适合谁",
    contentsQuestions: "常见问题",
    honestFitEyebrow: "老实说适不适合",
    honestFitTitleLead: "它适合谁 —— 以及",
    honestFitTitleAccent: "不适合谁",
    goodFitIf: "以下情况适合",
    lookElsewhereIf: "以下情况请另选",
    ctaDefault: "继续",
    faqEyebrow: "常见问答",
    faqTitleLead: "常见",
    faqTitleAccent: "问题",
    atAGlance: "一览",
    keyFactsHeading: "关键数据",
    sourceLabel: "来源：",
    listSeparator: "，",
    keyFactsLabel: (programme) => `${programme} 关键数据`,
    bylineBefore: "撰写与复核：",
    bylineMid: "，",
    bylineAfter: " 董事总经理",
    bylineLastReviewed: (date) => `最后复核于 ${date}。`,
    superseded: {
      termsChangedOn: (programme, date) => `${programme} 的条款已于 ${date} 变更`,
      figuresArePrevious: " —— 下方显示的仍是旧数字",
      showWhatChanged: "查看变更内容",
      hide: "收起",
      confirmedByBefore: "此说法来自 ",
      confirmedByAfter: (date) => `，截至 ${date} 仍然有效。`,
      officialDocument: (authority) => `${authority} 的官方文件`,
      notYetUpdated:
        "尚未更新，因此这些条款无法引用政府来源作为依据。",
      treatAsUnconfirmed:
        "在官方更新之前，请把本页的每一个数字都视为需要另行确认后才可据以行动。",
    },
    facts: {
      authority: "主管机构",
      tenure: "签证年限",
      minAge: "最低年龄",
      fixedDeposit: "定期存款",
      incomeRequirement: "收入要求",
      minSalary: "最低薪资",
      sponsorRequired: "需要担保方",
      propertyPurchase: "房产购置",
      participationFee: "参与费",
      processingFee: "手续费",
      minStay: "最低居住天数",
      workRights: "工作权利",
      none: "无",
      renewable: "可续签",
      aMonth: (amount) => `每月 ${amount}`,
      from: (amount) => `${amount} 起`,
      principal: (amount) => `主申请人 ${amount}`,
      principalAndDependant: (principal, dependant) =>
        `主申请人 ${principal}，每名家属 ${dependant}`,
      perDependantTerms: (principal, terms) =>
        `主申请人 ${principal}。每名家属：${terms}`,
      forYears: (amount, years) => `${amount}／${years}`,
      or: "，或 ",
      workRightsFull: "完整 —— 可工作及经营生意",
      workRightsRestricted: "受限 —— 附带条件",
      workRightsNone: "无",
    },
  },

  consent: {
    heading: "本站使用的 Cookie",
    body: "分析类 Cookie 让我们知道哪些指南有人读。你不开启，它就不会启用；开不开启，网站的功能完全一样。",
    privacyLink: "隐私政策",
    decline: "拒绝",
    accept: "接受",
  },

  notFound: {
    eyebrow: "错误 404",
    heading: "这个页面",
    headingAccent: "不在这里",
    lead: "链接可能已经过期，或者页面已经搬走。本指南涵盖的全部内容都在下面。",
    tailBefore: "在找特定的内容？可以看看",
    tailNews: "最新消息",
    tailBetween: "，或者直接",
    tailContact: "提出问题",
    tailAfter: "，撰写这些指南的人会亲自回覆你。",
    metaTitle: "页面不存在",
  },
};

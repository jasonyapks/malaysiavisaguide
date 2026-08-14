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

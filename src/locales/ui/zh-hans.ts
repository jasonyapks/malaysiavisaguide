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

  cost: {
    agencyFeePrincipal: "代理费 —— 主申请人",
    agencyFeeCovers: (note, includes) => `${note}涵盖：${includes}。`,
    includesSeparator: "；",
    additionalAgencyFee: (d) => `额外代理费 —— ${d} 名家属`,
    additionalAgencyFeeNote: (from, included) =>
      `自第 ${from} 名家属起收取，因此前 ${included} 名已包含在上方的费用之内。`,
    ordinal: (n) => `${n}`,
    participationFee: "参与费",
    processingFee: "政府处理费",
    passFee: "移民准证费",
    visaFee: "多次入境签证费",
    visaFeeNote: (note, nationality, amount, perYear) =>
      `${note} ${nationality}：${amount}${perYear ? "／年" : ""}。`,
    securityBondPrincipal: "保证金 —— 主申请人",
    securityBondNote: (note, nationality, amount) =>
      `${note} 按国籍订定 —— ${nationality}：${amount}。`,
    securityBondDependants: (d) => `保证金 —— ${d} 名家属`,
    fixedDeposit: "定期存款",
    propertyPurchase: "房产购置（最低）",
    propertyNote: (stateFloor) =>
      stateFloor
        ? `这是你拥有的房产，不是费用 —— 但为取得资格，这笔资金你必须投入。${stateFloor}`
        : "这是你拥有的房产，不是费用 —— 但为取得资格，这笔资金你必须投入。",
    forPrincipal: (label, term) => `${label} —— 主申请人${term}`,
    forDependants: (label, count, term) => `${label} —— ${count} 名家属${term}`,
    forDependantsOnTerm: (label, count, years) =>
      `${label} —— ${count} 名家属，${years} 年期`,
    termSuffix: (years) => (years > 1 ? `（${years} 年）` : ""),
    each: (amount) => `每人 ${amount}。`,
    pricedAtFullTerm: (alternatives) =>
      `按最长年期计价。另一个可选年期是${alternatives}。`,
    termAlternative: (years, amount) => `${years} 年，每人 ${amount}`,
    termAlternativeSeparator: "，或 ",
  },
  states: {
    selangor: "雪兰莪",
    "kuala-lumpur": "吉隆坡",
  },
  gates: {
    minAge: (age) => `最低年龄 ${age} 岁`,
    fixedDeposit: (amount) => `${amount} 的定期存款`,
    income: (perPeriod) => `收入达 ${perPeriod}`,
    salaryFrom: (monthly) => `月薪 ${monthly} 起`,
    property: (from) => `购买 ${from} 起的房产`,
    employerSponsor: "一家获准聘用你的马来西亚雇主",
    institutionSponsor: "一个由院校担保的学额",
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
    bylineEnd: "。",
    bylineLastReviewed: (date) => `最后复核于 ${date}。`,
    tiers: {
      fixedDeposit: "定期存款",
      propertyPurchase: "房产购置",
      optional: "非强制",
      term: "年限",
      participationFee: "参与费",
      agencyFee: "代理费",
      notGovernmentSet: "非政府订定",
      agencyFeeCommercialNote:
        "由代理机构按商业方式订定，没有任何官方渠道公布。在签约之前，请要求以书面给出金额。",
      includesSeparator: "；",
      agencyFeeCovers: (note, includes, terms) =>
        `${note} 涵盖${includes}。${terms}`,
      processingFee: "手续费",
      processingFeePrincipal: (amount) => `主申请人 ${amount}`,
      processingFeeAbsorbed:
        "已包含在上方的代理费之内 —— 报价单上不应重复出现。",
      minAge: "最低年龄",
      minStay: "最低居住天数",
      workRights: "工作权利",
      workYes: "可以",
      workRestricted: "受限",
      workNo: "不可",
      workFullNote: "可工作并经营生意。",
      workRestrictedNote: "附带条件。",
      sponsor: "担保方",
      incomeFloor: "收入门槛",
      noneStated: "未订明",
      maximumTerm: "最长年限",
      governmentFee: "政府收费",
      dependants: "随行家属",
      permitted: "允许",
      notPermitted: "不允许",
      renewableSuffix: "，可续签",
      attributeColumn: "项目",
      seeNote: "见注 ",
    },
    superseded: {
      changedOn: (date) => `条款已于 ${date} 变更`,
      nameSeparator: "、",
      termsChangedLabel: (programmes) => `${programmes}：条款已变更`,
      figuresArePrevious: " —— 下方显示的仍是旧数字",
      showWhatChanged: "查看变更内容",
      hide: "收起",
      confirmedByBefore: "此说法来自 ",
      confirmedByAfter: (date) => `，截至 ${date} 仍然有效。`,
      officialDocument: (authority) => `${authority} 的官方文件`,
      notYetUpdated:
        "尚未更新，因此上述数字无法与该文件核对。",
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
    bodyOptOut: "分析类 Cookie 让我们知道哪些指南有人读。它已经开启，你随时可以关掉；开不开启，网站的功能完全一样。",
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

  news: {
    categoryLabel: {
      pvip: "PVIP",
      mm2h: "MM2H",
      "sarawak-mm2h": "砂拉越 MM2H",
      "de-rantau": "DE Rantau",
      "employment-pass": "工作准证",
      "student-pass": "学生准证",
      general: "移民政策",
      world: "其他国家",
    },
    categoryBlurb: {
      pvip: "高端签证计划（PVIP）的变化——参与费、定期存款，以及 20 年期限在实务上如何执行。",
      mm2h: "MM2H 第二家园计划的消息——白银级、黄金级与白金级的存款与房产门槛，以及必须通过持牌代理的规定。",
      "sarawak-mm2h":
        "砂拉越自己的 MM2H：州属自行设定存款、自行审批、自成一套规则，因此单独报道。",
      "de-rantau":
        "马来西亚的数字游民准证 DE Rantau——收入门槛、适用职业，以及 12 个月准证如何续签。",
      "employment-pass":
        "工作准证（Employment Pass）的消息——EP I、II、III 三级薪资门槛、ESD 的审批流程，以及雇主与持证人各自须遵守的规定。",
      "student-pass":
        "学生准证（Student Pass）的消息——EMGS 的审批、院校担保，以及在马来西亚就读所附带的条件。",
      general:
        "影响各类外籍人士、而非单一签证计划的马来西亚移民政策。",
      world:
        "其他国家的长期居留、退休与投资签证——读者在与马来西亚比较时会考虑的选项，只作对照，不作推荐。",
    },
    categoryPageTitle: {
      world: "其他国家的签证消息",
      general: "马来西亚移民政策消息",
    },
    categoryPageTitleFor: (label) => `${label} 最新消息`,
    guideTitle: {
      pvip: "PVIP 指南",
      mm2h: "MM2H 指南",
      "sarawak-mm2h": "砂拉越 MM2H 指南",
      "de-rantau": "DE Rantau 指南",
      "employment-pass": "工作准证指南",
      "student-pass": "学生准证指南",
      general: "方案对比",
      world: "马来西亚与各国的对比",
    },
    comparisonTitle: "方案对比",
    guidesTitle: "各签证指南",
    eligibilityLink: "做一次资格评估",
    index: {
      metaTitle: "马来西亚签证最新消息",
      metaDescription:
        "马来西亚长期居留签证的最新消息与解读——PVIP、MM2H、砂拉越 MM2H、DE Rantau，以及工作与学生准证。每则消息都完整写出，并注明出处。",
      h1: "马来西亚签证最新消息",
      lead: "马来西亚长期居留签证有什么变化，我们完整写出来——具体数字，以及这项变化对正在申请的你到底意味着什么。每一则都经人工审阅才发布，并注明所依据的报道。",
      empty: "目前还没有发布消息——在此之前，各签证指南里是最新的已核实数字。",
      moreEyebrow: "更多消息",
      moreTitle: "其余",
      moreTitleAccent: "值得一读的内容",
      footerBefore: "消息只是起点，不构成建议。想知道某项规定对你意味着什么，可以读",
      footerBetween: "，或者",
      footerAfter: "。",
    },
    card: {
      readFull: "阅读全文",
      minRead: (minutes) => `阅读约 ${minutes} 分钟`,
      via: (source) => `来源：${source}`,
      browseAria: "按类别浏览消息",
      allStories: "全部消息",
      countLabel: (label, count) => `${label} — ${count} 则消息`,
    },
    article: {
      breadcrumbHome: "首页",
      breadcrumbNews: "最新消息",
      shortVersion: "重点摘要",
      whatItMeansEyebrow: "这意味着什么",
      whatItMeansTitle: "对申请人来说",
      whatItMeansAccent: "有什么改变",
      quotedFrom: "引自",
      quoteTranslated: "（引文为中译）",
      sourceHeading: "消息来源",
      sourceBefore: "本文由 Malaysia Visa Guide 撰写，依据的是",
      sourceAfter:
        "的报道。我们用自己的话概括并解读这则消息，不转载原文。想看出版方的完整报道，请点击原文链接。",
      lastUpdated: (date) => `最后更新于 ${date}。`,
      ctaLead: "消息只是起点，不构成建议。",
      ctaBefore: "想知道这对你自己的情况意味着什么，已核实的数字都在",
      ctaBetween: "，或者",
      ctaAfter: "。",
      authorJobTitle: "MYPVIP 董事总经理",
    },
    category: {
      oneStory: "目前有 1 则消息。",
      manyStories: (count) => `共 ${count} 则消息，由新到旧。`,
      reviewedNote: "每一则都经人工审阅才发布，并注明所依据的报道。",
      moreOn: (label) => `更多 ${label} 消息`,
      moreTitle: "本类别下的",
      moreTitleAccent: "其余内容",
      footerBefore: "消息只是起点，不构成建议。想知道这些变化对你自己的情况意味着什么，可以读",
      footerBetween: "，或者",
      footerAfter: "。",
    },
  },

  insights: {
    categoryLabel: {
      comparisons: "方案对比",
      "by-nationality": "按国籍",
      "expat-living": "在马生活",
      perspective: "第一线观察",
      "how-to": "操作指引",
    },
    categoryTitle: {
      comparisons: "方案对比与选择指南",
      "by-nationality": "按国籍看马来西亚签证",
      "expat-living": "在马生活、税务与理财",
      perspective: "第一线观察",
      "how-to": "申请流程，一步一步来",
    },
    categoryBlurb: {
      comparisons:
        "不是功能清单，而是并排的取舍——以你的收入、你手上的资金、以及未来二十年的打算来看，哪一个方案才真正适合。",
      "by-nationality":
        "换一本护照，会有什么不同：所需文件、按国籍定价的签证费，以及申请流程中因来源国而异的环节。",
      "expat-living":
        "签证问题之后紧接着出现的那些问题——税务居民身份与境外收入、各州的房产门槛、开设银行账户、子女教育与医疗。",
      perspective:
        "来自经营两家马来西亚持牌长期居留代理机构的第一手记录——公布的规则与柜台的做法在哪里不一致，以及这对申请人意味着多少代价。",
      "how-to":
        "申请本身，按实际发生的顺序来讲——递件前必须备妥什么、批准后才会解锁什么，以及哪些步骤必须人在马来西亚才能办。",
    },
    browseAria: "按类别浏览",
    index: {
      metaTitle: "深度观点",
      metaDescription:
        "关于马来西亚长期居留签证的方案对比、选择指南与第一手观察——由 Jason Yap 依据 500+ 宗迁居案例写成，每一个数字都可追溯到官方来源。",
      eyebrow: "深度观点",
      h1: "哪一个方案",
      h1Accent: "才真正属于你",
      moreEyebrow: "更多",
      moreTitle: "其余",
      moreTitleAccent: "值得一读的内容",
      empty: "目前还没有发布文章。",
      footerBefore: "想看的是有什么变化，而不是该怎么选？那请看",
      newsLink: "最新消息",
      footerBetween: "。想看各签证的参考页面，可以从",
      compareLink: "方案对比表",
      footerAfter: "开始。",
    },
    article: {
      breadcrumb: "深度观点",
      publishedLine: (minutes, date) => `阅读约 ${minutes} 分钟 · 发布于 ${date}`,
      reviewedLine: (minutes, date) => `阅读约 ${minutes} 分钟 · 复核于 ${date}`,
      sourcesHeading: "资料来源",
      sourcesNoteBefore:
        "上文每一个数字都出自官方文件。官方来源没有说明的地方，本站会直接说明，而不是自行填补——参见",
      editorialLink: "我们如何查证并标注日期",
      sourcesNoteAfter: "。",
      checkedOn: (date) => ` — 查证于 ${date}`,
      handoffBefore: "这是一篇对比，不构成针对你个人情况的建议。可以读",
      listSeparator: "、",
      listLast: "或",
      handoffBetween: "，也可以用你自己的数字",
      eligibilityLink: "做一次资格评估",
      handoffAfter: "。",
    },
    category: {
      oneArticle: "目前有 1 篇文章。",
      manyArticles: (count) => `共 ${count} 篇文章，由新到旧。`,
      tracedNote: "每一个数字都可追溯到官方文件，并标注了查证日期。",
      footerBefore: "只想直接并排看数字，不看论述？可以用",
      compareLink: "方案对比表",
      footerBetween: "，或者",
      calculatorLink: "费用计算器",
      footerAfter: "。",
    },
  },
};

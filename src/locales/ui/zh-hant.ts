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

  cost: {
    agencyFeePrincipal: "代理費 —— 主申請人",
    agencyFeeCovers: (note, includes) => `${note}涵蓋：${includes}。`,
    includesSeparator: "；",
    additionalAgencyFee: (d) => `額外代理費 —— ${d} 名家屬`,
    additionalAgencyFeeNote: (from, included) =>
      `自第 ${from} 名家屬起收取，因此前 ${included} 名已包含在上方的費用之內。`,
    ordinal: (n) => `${n}`,
    participationFee: "參與費",
    processingFee: "政府處理費",
    passFee: "移民準證費",
    visaFee: "多次入境簽證費",
    visaFeeNote: (note, nationality, amount, perYear) =>
      `${note} ${nationality}：${amount}${perYear ? "／年" : ""}。`,
    securityBondPrincipal: "保證金 —— 主申請人",
    securityBondNote: (note, nationality, amount) =>
      `${note} 按國籍訂定 —— ${nationality}：${amount}。`,
    securityBondDependants: (d) => `保證金 —— ${d} 名家屬`,
    fixedDeposit: "定期存款",
    propertyPurchase: "房產購置（最低）",
    propertyNote: (stateFloor) =>
      stateFloor
        ? `這是你擁有的房產，不是費用 —— 但為取得資格，這筆資金你必須投入。${stateFloor}`
        : "這是你擁有的房產，不是費用 —— 但為取得資格，這筆資金你必須投入。",
    forPrincipal: (label, term) => `${label} —— 主申請人${term}`,
    forDependants: (label, count, term) => `${label} —— ${count} 名家屬${term}`,
    forDependantsOnTerm: (label, count, years) =>
      `${label} —— ${count} 名家屬，${years} 年期`,
    termSuffix: (years) => (years > 1 ? `（${years} 年）` : ""),
    each: (amount) => `每人 ${amount}。`,
    pricedAtFullTerm: (alternatives) =>
      `按最長年期計價。另一個可選年期是${alternatives}。`,
    termAlternative: (years, amount) => `${years} 年，每人 ${amount}`,
    termAlternativeSeparator: "，或 ",
  },
  states: {
    selangor: "雪蘭莪",
    "kuala-lumpur": "吉隆坡",
  },
  gates: {
    minAge: (age) => `最低年齡 ${age} 歲`,
    fixedDeposit: (amount) => `${amount} 的定期存款`,
    income: (perPeriod) => `收入達 ${perPeriod}`,
    salaryFrom: (monthly) => `月薪 ${monthly} 起`,
    property: (from) => `購買 ${from} 起的房產`,
    employerSponsor: "一家獲准聘用你的馬來西亞僱主",
    institutionSponsor: "一個由院校擔保的學額",
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
      includesSeparator: "；",
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
      changedOn: (date) => `條款已於 ${date} 變更`,
      nameSeparator: "、",
      termsChangedLabel: (programmes) => `${programmes}：條款已變更`,
      figuresArePrevious: " —— 下方顯示的仍是舊數字",
      showWhatChanged: "查看變更內容",
      hide: "收起",
      confirmedByBefore: "此說法來自 ",
      confirmedByAfter: (date) => `，截至 ${date} 仍然有效。`,
      officialDocument: (authority) => `${authority} 的官方文件`,
      notYetUpdated:
        "尚未更新，因此上述數字無法與該文件核對。",
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
    bodyOptOut: "分析類 Cookie 讓我們知道哪些指南有人讀。它已經開啟，你隨時可以關掉；開不開啟，網站的功能完全一樣。",
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

  news: {
    categoryLabel: {
      pvip: "PVIP",
      mm2h: "MM2H",
      "sarawak-mm2h": "砂拉越 MM2H",
      "de-rantau": "DE Rantau",
      "employment-pass": "工作準證",
      "student-pass": "學生準證",
      general: "移民政策",
      world: "其他國家",
    },
    categoryBlurb: {
      pvip: "高端簽證計劃（PVIP）的變化——參與費、定期存款，以及 20 年期限在實務上如何執行。",
      mm2h: "MM2H 第二家園計劃的消息——白銀級、黃金級與白金級的存款與房產門檻，以及必須通過持牌代理的規定。",
      "sarawak-mm2h":
        "砂拉越自己的 MM2H：州屬自行設定存款、自行審批、自成一套規則，因此單獨報道。",
      "de-rantau":
        "馬來西亞的數字遊民準證 DE Rantau——收入門檻、適用職業，以及 12 個月準證如何續簽。",
      "employment-pass":
        "工作準證（Employment Pass）的消息——EP I、II、III 三級薪資門檻、ESD 的審批流程，以及僱主與持證人各自須遵守的規定。",
      "student-pass":
        "學生準證（Student Pass）的消息——EMGS 的審批、院校擔保，以及在馬來西亞就讀所附帶的條件。",
      general:
        "影響各類外籍人士、而非單一簽證計劃的馬來西亞移民政策。",
      world:
        "其他國家的長期居留、退休與投資簽證——讀者在與馬來西亞比較時會考慮的選項，只作對照，不作推薦。",
    },
    categoryPageTitle: {
      world: "其他國家的簽證消息",
      general: "馬來西亞移民政策消息",
    },
    categoryPageTitleFor: (label) => `${label} 最新消息`,
    guideTitle: {
      pvip: "PVIP 指南",
      mm2h: "MM2H 指南",
      "sarawak-mm2h": "砂拉越 MM2H 指南",
      "de-rantau": "DE Rantau 指南",
      "employment-pass": "工作準證指南",
      "student-pass": "學生準證指南",
      general: "方案對比",
      world: "馬來西亞與各國的對比",
    },
    comparisonTitle: "方案對比",
    guidesTitle: "各簽證指南",
    eligibilityLink: "做一次資格評估",
    index: {
      metaTitle: "馬來西亞簽證最新消息",
      metaDescription:
        "馬來西亞長期居留簽證的最新消息與解讀——PVIP、MM2H、砂拉越 MM2H、DE Rantau，以及工作與學生準證。每則消息都完整寫出，並註明出處。",
      h1: "馬來西亞簽證最新消息",
      lead: "馬來西亞長期居留簽證有什麼變化，我們完整寫出來——具體數字，以及這項變化對正在申請的你到底意味著什麼。每一則都經人工審閱才發佈，並註明所依據的報道。",
      empty: "目前還沒有發佈消息——在此之前，各簽證指南里是最新的已核實數字。",
      moreEyebrow: "更多消息",
      moreTitle: "其餘",
      moreTitleAccent: "值得一讀的內容",
      footerBefore: "消息只是起點，不構成建議。想知道某項規定對你意味著什麼，可以讀",
      footerBetween: "，或者",
      footerAfter: "。",
    },
    card: {
      readFull: "閱讀全文",
      minRead: (minutes) => `閱讀約 ${minutes} 分鐘`,
      via: (source) => `來源：${source}`,
      browseAria: "按類別瀏覽消息",
      allStories: "全部消息",
      countLabel: (label, count) => `${label} — ${count} 則消息`,
    },
    article: {
      breadcrumbHome: "首頁",
      breadcrumbNews: "最新消息",
      shortVersion: "重點摘要",
      whatItMeansEyebrow: "這意味著什麼",
      whatItMeansTitle: "對申請人來說",
      whatItMeansAccent: "有什麼改變",
      quotedFrom: "引自",
      quoteTranslated: "（引文為中譯）",
      sourceHeading: "消息來源",
      sourceBefore: "本文由 Malaysia Visa Guide 撰寫，依據的是",
      sourceAfter:
        "的報道。我們用自己的話概括並解讀這則消息，不轉載原文。想看出版方的完整報道，請點擊原文鏈接。",
      lastUpdated: (date) => `最後更新於 ${date}。`,
      ctaLead: "消息只是起點，不構成建議。",
      ctaBefore: "想知道這對你自己的情況意味著什麼，已核實的數字都在",
      ctaBetween: "，或者",
      ctaAfter: "。",
      authorJobTitle: "MYPVIP 董事總經理",
    },
    category: {
      oneStory: "目前有 1 則消息。",
      manyStories: (count) => `共 ${count} 則消息，由新到舊。`,
      reviewedNote: "每一則都經人工審閱才發佈，並註明所依據的報道。",
      moreOn: (label) => `更多 ${label} 消息`,
      moreTitle: "本類別下的",
      moreTitleAccent: "其餘內容",
      footerBefore: "消息只是起點，不構成建議。想知道這些變化對你自己的情況意味著什麼，可以讀",
      footerBetween: "，或者",
      footerAfter: "。",
    },
  },

  insights: {
    categoryLabel: {
      comparisons: "方案對比",
      "by-nationality": "按國籍",
      "expat-living": "在馬生活",
      perspective: "第一線觀察",
      "how-to": "操作指引",
    },
    categoryTitle: {
      comparisons: "方案對比與選擇指南",
      "by-nationality": "按國籍看馬來西亞簽證",
      "expat-living": "在馬生活、稅務與理財",
      perspective: "第一線觀察",
      "how-to": "申請流程，一步一步來",
    },
    categoryBlurb: {
      comparisons:
        "不是功能清單，而是並排的取捨——以你的收入、你手上的資金、以及未來二十年的打算來看，哪一個方案才真正適合。",
      "by-nationality":
        "換一本護照，會有什麼不同：所需文件、按國籍定價的簽證費，以及申請流程中因來源國而異的環節。",
      "expat-living":
        "簽證問題之後緊接著出現的那些問題——稅務居民身份與境外收入、各州的房產門檻、開設銀行賬戶、子女教育與醫療。",
      perspective:
        "來自經營兩家馬來西亞持牌長期居留代理機構的第一手記錄——公佈的規則與櫃檯的做法在哪裡不一致，以及這對申請人意味著多少代價。",
      "how-to":
        "申請本身，按實際發生的順序來講——遞件前必須備妥什麼、批准後才會解鎖什麼，以及哪些步驟必須人在馬來西亞才能辦。",
    },
    browseAria: "按類別瀏覽",
    index: {
      metaTitle: "深度觀點",
      metaDescription:
        "關於馬來西亞長期居留簽證的方案對比、選擇指南與第一手觀察——由 Jason Yap 依據 500+ 宗遷居案例寫成，每一個數字都可追溯到官方來源。",
      eyebrow: "深度觀點",
      h1: "哪一個方案",
      h1Accent: "才真正屬於你",
      moreEyebrow: "更多",
      moreTitle: "其餘",
      moreTitleAccent: "值得一讀的內容",
      empty: "目前還沒有發佈文章。",
      footerBefore: "想看的是有什麼變化，而不是該怎麼選？那請看",
      newsLink: "最新消息",
      footerBetween: "。想看各簽證的參考頁面，可以從",
      compareLink: "方案對比表",
      footerAfter: "開始。",
    },
    article: {
      breadcrumb: "深度觀點",
      publishedLine: (minutes, date) => `閱讀約 ${minutes} 分鐘 · 發佈於 ${date}`,
      reviewedLine: (minutes, date) => `閱讀約 ${minutes} 分鐘 · 複核於 ${date}`,
      sourcesHeading: "資料來源",
      sourcesNoteBefore:
        "上文每一個數字都出自官方文件。官方來源沒有說明的地方，本站會直接說明，而不是自行填補——參見",
      editorialLink: "我們如何查證並標註日期",
      sourcesNoteAfter: "。",
      checkedOn: (date) => ` — 查證於 ${date}`,
      handoffBefore: "這是一篇對比，不構成針對你個人情況的建議。可以讀",
      listSeparator: "、",
      listLast: "或",
      handoffBetween: "，也可以用你自己的數字",
      eligibilityLink: "做一次資格評估",
      handoffAfter: "。",
    },
    category: {
      oneArticle: "目前有 1 篇文章。",
      manyArticles: (count) => `共 ${count} 篇文章，由新到舊。`,
      tracedNote: "每一個數字都可追溯到官方文件，並標註了查證日期。",
      footerBefore: "只想直接並排看數字，不看論述？可以用",
      compareLink: "方案對比表",
      footerBetween: "，或者",
      calculatorLink: "費用計算器",
      footerAfter: "。",
    },
  },
};

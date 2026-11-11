/**
 * Simplified Chinese search-result titles and descriptions, where the
 * translated headline or standfirst does not fit a results page (audit task
 * B2-F7). SOURCE for zh-hant — see scripts/gen-zh-hant.mjs.
 *
 * Keyed by the canonical path. Width rules are in src/lib/metadata.ts: title
 * 60 or less, description about 120–150, a Chinese character counting 2.
 * The on-page headline is unaffected.
 */
export const seoOverrides: Record<string, { title?: string; description?: string }> = {
  "/insights/comparisons/employment-pass-vs-residence-pass-talent/": {
    title: "马来西亚工作准证与人才居留准证（RP-T）对比",
    description:
      "自 2026 年 6 月 1 日起，工作准证设有年限，并须附带把职位移交本地员工的计划。人才居留准证（RP-T）是出路，而且它的薪资门槛比你已达到的更低。",
  },
  "/insights/comparisons/federal-mm2h-vs-sarawak-mm2h/": {
    title: "联邦 MM2H 对比砂拉越 MM2H：哪个更适合你？",
    description:
      "砂拉越 MM2H 资金门槛低得多、不必买房，但会审查财务并需要担保人；联邦 MM2H 没有公布收入门槛，却强制购房。先决定你想住在哪里，再选计划。",
  },
  "/insights/comparisons/mm2h-platinum-vs-pvip/": {
    title: "MM2H 白金级对比 PVIP：哪种 20 年签证更省钱？",
    description:
      "两者都是 20 年、参与费都是 RM200,000。真正的分别在于能否证明每月 RM40,000 收入：能，PVIP 锁定的资金少得多；不能，PVIP 就不对你开放。",
  },
  "/insights/comparisons/mm2h-sez-sfz-forest-city-2026/": {
    title: "MM2H SEZ 与 SFZ 2026：森林城市路线与三级对比",
    description:
      "经济特区（SEZ）与金融特区（SFZ）是进入 MM2H 成本最低的路线。本文比较它们与白银、黄金、白金级的费用，说明为何要先买房后获批，以及其中的隐忧。",
  },
  "/insights/comparisons/mm2h-silver-vs-gold-vs-platinum/": {
    title: "MM2H 白银、黄金、白金级对比：哪一级适合你？",
    description:
      "MM2H 白银、黄金、白金级的日常生活几乎一样，真正的分别在于准证年限、须锁定的资金，以及能否工作。逐项并列比较，教你判断哪一级适合自己。",
  },
  "/insights/comparisons/mm2h-vs-pvip-vs-de-rantau/": {
    title: "MM2H、PVIP 与 DE Rantau：哪种签证适合你的收入？",
  },
  "/insights/comparisons/which-visa-lets-you-run-a-business/": {
    title: "哪种马来西亚签证可以经营企业？",
    description:
      "大多数长期居留准证只让你在马来西亚生活。其中两种让你以本人身份经营企业，一种只能经营一家，其余的则只供居留、不能用来营利。逐一说明。",
  },
  "/insights/how-to/apply-for-mm2h-2026/": {
    title: "2026 年如何申请 MM2H：三个级别与特区路线",
    description:
      "MM2H 有三个主要级别和两条特区路线。每一级实际要求什么、哪些步骤只能在马来西亚境内办理，以及签证贴入护照之后仍须遵守的两项房产条件。",
  },
  "/insights/how-to/how-much-does-mm2h-cost/": {
    title: "2026 年 MM2H 要花多少钱？逐级拆解每项费用",
    description:
      "MM2H 白银、黄金、白金级的费用，拆分为你要支付的、要存入的和要购买的三类钱，并列出大多数报价单都漏掉的受养人费用。逐级算给你看。",
  },
  "/insights/how-to/mm2h-over-50-requirements-2026/": {
    title: "50 岁以上申请 MM2H：2026 年条件、级别与费用",
    description:
      "年满 50 岁后，MM2H 不再有最低居住天数要求，其余几乎不变。50 岁以上申请人仍须亲自办理哪些事、哪一级适合退休，以及家属会增加多少费用。",
  },
  "/insights/how-to/paid-up-capital-employment-pass-own-company/": {
    title: "用自己的公司申请工作准证：实缴资本要多少",
    description:
      "注册马来西亚公司几乎不需要资本，但公司持有 RM500,000 之前，你无法通过它为自己申请工作准证。这个数字不会出现在任何一份注册报价单里。",
  },
  "/news/budget-2027-lets-de-rantau-holders-stay-beyond-two-year-limit/": {
    title: "2027 年预算案：DE Rantau 持有人可居留超过两年",
  },
  "/news/budget-2027-lets-employment-pass-spouses-work-in-malaysia/": {
    title: "2027 年预算案：第一类工作准证持有人的配偶可工作",
    description:
      "自 2027 年 1 月 1 日起，第一类工作准证持有人中持受养人准证的配偶，可在符合规定条件下在马来西亚工作。这是 2027 年预算案吸引外籍人才的措施。",
  },
  "/news/budget-2027-what-changes-for-foreign-retirees-and-residents/": {
    title: "2027 年预算案：外籍退休人士与居民有哪些变化",
    description:
      "2027 年预算案没有提到 MM2H 或 PVIP，但调整了外籍居民须支付的几项费用：税务居民的所得税、长者护理服务税、私立医院收费与免税购物。",
  },
  "/news/immigration-says-266-foreigners-in-forest-city-have-valid-documents/": {
    title: "移民局：森林城市 266 名外籍人士持有有效文件",
  },
  "/news/xpats-gateway-adds-myfuturejobs-eppax-to-speed-employment-pass/": {
    title: "Xpats Gateway 整合 MYFutureJobs 与 ePPAx 加快审批",
  },
  "/visas/mm2h/": {
    title: "马来西亚第二家园（MM2H）2026：费用、条件与级别",
    description:
      "对照 MOTAC 官方指南，逐项列出 MM2H 各级别的定期存款、房产最低价、年限、各项费用与最低居住天数，以及大多数指南都写错的年龄规定。",
  },
  "/insights/expat-living/cost-of-living-kuala-lumpur-foreigner/": {
    description:
      "三份吉隆坡月度预算，依据 2026 年 10 月租金、公开学费与官方消费数据编制，并列出只向非公民收取的费用，以及每份预算所对应的签证类型。",
  },
  "/insights/expat-living/is-foreign-income-taxed-in-malaysia/": {
    description:
      "对个人而言，马来西亚基本不对境外收入征税，但对公司已不再如此。分界线是居住天数而非签证，而目前大家依赖的免税安排已延长至 2036 年。",
  },
  "/insights/expat-living/kl-neighbourhoods-rent-for-expats/": {
    description:
      "吉隆坡九个区域的要价租金，取自带日期的 2026 年 10 月房源样本，并说明每个区域实际适合什么样的人，以及入住之前需要预备多少现金。",
  },
  "/insights/expat-living/malaysian-tax-for-expats/": {
    description:
      "专为外籍人士整理的马来西亚税务：你实际可申请哪些减免、只因你不是公民才存在的两条规则，以及人人都警告、其实根本不会波及你的那项税。",
  },
  "/insights/expat-living/manglish-101-for-expats/": {
    description:
      "没人指望你会说 Manglish，但“can or not”和“tapau”是什么意思、为什么每句话后面都加个“lah”，你到马来西亚的第一周就得弄明白。",
  },
  "/insights/how-to/company-setup-cost-malaysia-foreigner/": {
    description:
      "在马来西亚注册公司约 RM2,500 起。外国业主第一年实际要花多少，取决于你住在哪里、公司是否须为你的工作准证担保，以及公司经营什么业务。",
  },
  "/insights/how-to/foreigner-100-percent-ownership-sdn-bhd/": {
    description:
      "通常可以。大多数行业已不需要马来西亚合伙人；你真正需要的是一名居住在马来西亚的董事，少数行业还需要一张附带自身资本规定的执照。",
  },
  "/insights/how-to/mm2h-fixed-deposit-withdrawal/": {
    description:
      "MM2H 定期存款有一半可以提取，但 MOTAC 指南对提取时间给出了两种说法。可以提取多少、可用于什么用途、必须保留多少，本文逐项说明。",
  },
  "/insights/how-to/mm2h-renewal-requirements-and-fees/": {
    description:
      "MOTAC 指南描述了两种不同的 MM2H 续签。每种续签在白银、黄金、白金级及特区路线上何时适用、费用多少、当天须符合哪些条件，以及常见延误。",
  },
  "/insights/how-to/pvip-and-company-incorporation-malaysia/": {
    description:
      "PVIP 让你凭一张准证在马来西亚居留、拥有公司并担任居民董事。签证如何运作、选哪种公司架构、如何注册，以及开出第一张发票前要准备什么。",
  },
  "/insights/how-to/sdn-bhd-annual-running-costs/": {
    description:
      "无论是否营业，马来西亚 Sdn Bhd 每年都要花钱，直到正式注销为止；停用的公司仍会持续产生账单。本文逐项列出外资公司每一年的固定开支。",
  },
  "/news/mm2h-programme-revamp-raises-entry-bars/": {
    description:
      "2025–26 年的 MM2H 改革推出白银、黄金、白金三级，定期存款分别为 USD 150,000、500,000 与 1,000,000，并强制经代理办理，或会削弱对中等收入者的吸引力。",
  },
  "/news/pvip-agency-mypvip-to-hold-webinar-on-running-a-business-in-malaysia/": {
    description:
      "PVIP 持有人凭一张准证即可在马来西亚居住、工作和经营企业。MYPVIP 于 11 月 1 日（星期日）举办 Zoom 讲座，讲解从签证到公司运营的完整路径。",
  },
};

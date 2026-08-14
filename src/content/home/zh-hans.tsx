import Link from "next/link";
import type { HomeCopy } from "./types";

/**
 * Simplified Chinese home page copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Programme names stay in Latin (PVIP, MM2H, DE Rantau). They are what the
 *   government, the agencies and the applicants write, and what Chinese
 *   searchers type. A Chinese gloss goes beside them on first use, not instead.
 * - Figures, currency and dates are never re-expressed. RM200,000 stays
 *   RM200,000 — not 20万令吉 — because the reader will be comparing it against
 *   a bank form and an official page that both say RM200,000.
 * - The house voice is pain first, then the choice. That survives translation
 *   as directness: short sentences, the cost named early, no 我们致力于.
 */
export const copy: HomeCopy = {
  hero: {
    eyebrow: "独立运营 · 每项数据都核对官方来源",
    heading: (
      <>
        马来西亚长期居留签证
        <br />
        <span className="font-display accent-text font-medium">
          把话说清楚
        </span>
      </>
    ),
    lead: "PVIP、MM2H、砂拉越 MM2H 和 DE Rantau 都能让你长期住在马来西亚 —— 但它们在费用、年限和适合的人群上差别极大。本站的每一个数字，都核对过官方来源。",
    chips: ["六项计划全覆盖", "费用全部列明", "每月复核"],
    ctaPrimary: "看看你符合哪一种",
    ctaSecondary: "对比各项计划",
    cardEyebrow: "这份指南是什么",
    cardTitle: (
      <>
        不是宣传册 ——{" "}
        <span className="text-forest-700">是一份你可以自己核对的参考</span>
      </>
    ),
    promises: [
      {
        title: "每个数字都对得上官方出处",
        body: "费用、门槛和年限都追溯到设定它的政府页面，并注明我们最后一次查证的日期。",
      },
      {
        title: "PVIP 和 MM2H 并排对比",
        body: "同样的字段、同样的单位、同一张表 —— 取舍一目了然，而不是埋在大段文字里。",
      },
      {
        title: "写来是为了说明，不是为了成交",
        body: "某个计划如果并不适合你，指南会直说。商业关系在每一页都有披露。",
      },
    ],
  },

  blurbs: {
    "/visas/pvip/": "20 年居留、完整工作权，最高端的一档。",
    "/visas/mm2h/": "白银、黄金、白金 —— 以定期存款为核心的经典方案。",
    "/visas/sarawak-mm2h/": "认真考虑长住时，最便宜的一条路，走砂拉越。",
    "/visas/de-rantau/": "为远程工作、收入来自海外的人准备的游民准证。",
    "/visas/employment-pass/": "受雇于马来西亚雇主时申请。",
    "/visas/student-pass/": "在马来西亚院校注册就读时申请。",
  },

  // Two characters each, matching the English one-word device. These are mood
  // labels, not translations of the programme names.
  displayWords: {
    "/visas/pvip/": "尊享",
    "/visas/mm2h/": "经典",
    "/visas/sarawak-mm2h/": "超值",
    "/visas/de-rantau/": "远程",
    "/visas/employment-pass/": "就业",
    "/visas/student-pass/": "求学",
  },

  programmes: {
    eyebrow: "选择你的路径",
    title: (
      <>
        哪一种马来西亚签证
        <br />
        <span className="accent-text">才真的适合你</span>
      </>
    ),
    body: (
      <>
        三种长期居留计划的费用相差一个数量级，而工作准证和学生准证解决的完全是另一类问题。先从符合
        <strong className="font-bold text-forest-700">你为什么要来</strong>
        的那一种开始看。
      </>
    ),
  },

  workStudy: {
    eyebrow: "工作与留学",
    title: (
      <>
        为了一份工作、
        <br />
        <span className="accent-text">一个课程，或远程办公</span>
      </>
    ),
    body: "这些不是居留计划 —— 它们绑定在雇主、院校或一份海外薪水上。规则不同，时程也不同。",
  },

  freshness: {
    eyebrow: "可信度与依据",
    heading: (date) => (
      <>
        每一项费用与门槛
        <br />
        <span className="font-display accent-text font-medium">
          最后核对于 {date}
        </span>
      </>
    ),
    body: "马来西亚的签证规则经常变动 —— 而大多数网站会悄悄过时。本站的数字要改，只在一个地方改；复核日期会告诉你，你正在读的内容有多新。",
  },

  sources: {
    eyebrow: "资料来源",
    title: (
      <>
        这些数字
        <br />
        <span className="accent-text">究竟从哪里来</span>
      </>
    ),
    body: "本站的每一个数字都能追溯到一份政府文件。下面就是它们所依据的文件 —— 如果某个数字对你的决定很重要，请自己读一遍。",
    prose: (
      <>
        <p>
          马来西亚的长期居留签证由好几个不同的机构管辖，这正是大部分混乱的根源。PVIP
          归马来西亚移民局；MM2H 则由旅游、艺术及文化部及其一站式中心负责办理。把这两者搞混，是二手报道里最常见的错误。砂拉越
          MM2H 是州属计划，有自己的部门、自己的存款要求和自己的批准流程 ——
          所以拿联邦页面上的数字来讲 S-MM2H，通常都是错的。DE Rantau 归 MDEC，工作准证归外籍人士服务局，学生准证则归移民局与
          EMGS。
        </p>
        <p>
          这里说「已核对」，意思是：有人打开了这段文字旁边列出的那份文件，在里面找到了该项费用、门槛或年限，并记下了日期。那个日期会公布在对应的计划指南上。如果某项规定只在新闻发布会上宣布过、却从未写进官方文件，指南就会照实这么说，而不是悄悄挑一个读起来更好看的数字。
        </p>
        <p>
          这件事比想象中更要紧，因为这些计划改得很频繁，而互联网跟不上。光是 MM2H
          近年就重组过两次，存款档次、最低居住天数和代理要求全都动过。2023
          年准确的页面今天照样排在前面，代理也照旧引用旧门槛 ——
          因为旧门槛更好拿来做对比推销。一个没有日期、没有出处的数字，不是你能据以规划的信息，那只是一种说法。
        </p>
        <p>
          所以：去读原始文件。如果其中某一份和本站写的内容相抵触，那就是本站的错误，
          <Link
            href="/zh-hans/contact/"
            className="font-semibold text-forest-700 underline"
          >
            联系页面
          </Link>
          的存在，有一部分正是为了让你能指出来。
          <Link
            href="/zh-hans/editorial-policy/"
            className="font-semibold text-forest-700 underline"
          >
            编辑方针
          </Link>
          说明了更正是怎么处理的，以及本站背后的商业关系是什么。
        </p>
      </>
    ),
  },

  tools: {
    eyebrow: "实用工具",
    title: (
      <>
        先弄清楚{" "}
        <span className="font-display accent-text font-medium">
          你现在的位置
        </span>
      </>
    ),
    body: "花三分钟用一下这些工具，胜过读一个小时 —— 它们跑的是和指南同一套经过核对的数字。",
    indexLink: "哪个工具回答哪个问题",
    indexTail: "—— 以及为什么要先看资格、再算费用。",
  },

  insights: {
    eyebrow: "深度观点",
    title: (
      <>
        写自{" "}
        <span className="font-display accent-text font-medium">
          500+ 个真实案例
        </span>
      </>
    ),
    body: (
      <>
        指南讲的是每个计划「是什么」。这些文章讲的是该选哪一个，以及选定之后要办的材料到底是什么样子。{" "}
        <Link
          href="/zh-hans/insights/"
          className="font-semibold text-forest-700 underline"
        >
          全部观点
        </Link>
        。
      </>
    ),
  },

  closing: {
    eyebrow: "一对一咨询",
    heading: (
      <>
        还是拿不准
        <br />
        <span className="font-display accent-text font-medium">
          哪一种签证适合你？
        </span>
      </>
    ),
    body: "Jason 经手过 500+ 宗迁居个案。有问题就问 —— 没有任何义务，也没有非得用他公司服务的义务。",
    cta: "咨询提问",
  },
};

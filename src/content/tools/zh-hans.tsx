import type { ToolsCopy } from "./types";

/**
 * Simplified Chinese /tools/ copy. Traditional is generated — run
 * `npm run i18n:hant`, never edit the zh-hant sibling.
 *
 * The cost calculator has no Chinese page yet. Its card is still shown, in
 * Chinese, and `linkPath` sends it to the English tool — hiding the card would
 * hide the tool, which is worse than crossing languages for it.
 */
export const copy: ToolsCopy = {
  meta: { title: "签证工具" },

  description:
    "两个免费的马来西亚长期居留签证工具：一个六道题的资格检测，告诉你符合哪些计划；一个逐项列出的费用计算器，把能拿回的存款和拿不回的费用分开算清楚。",

  eyebrow: "工具",

  heading: (
    <>
      看清楚
      <span className="font-display accent-text font-medium">
        自己的位置
      </span>
    </>
  ),

  order: {
    eyebrow: "从这里开始",
    title: (
      <>
        先看资格，
        <span className="font-display accent-text font-medium">
          再算费用
        </span>
      </>
    ),
    sub: "请按这个顺序来。费用是每个人开口就问的问题，也恰恰是最不该先问的：如果第一道流动资产门槛就把你排除在外，那么 MM2H 白金级的总价算得再准也没有意义。先弄清楚哪些计划对你开放，再去算这几个的钱。",
  },

  tools: {
    "/tools/eligibility/": {
      title: "资格检测",
      question: "我到底能申请哪几种？",
      body: "最多六道题 —— 年龄、收入、资金，以及你打算来做什么。它会列出你符合的计划、你只差一点的计划以及差多少，并且不保存任何资料。",
      minutes: "约 2 分钟",
    },
    "/tools/cost-calculator/": {
      title: "费用计算器",
      question: "实际要花我多少钱？",
      body: "按计划和家庭人数逐项列出的总额，用的是与各指南相同的官方数字。可退还的定期存款与一去不回的费用严格分开列示 —— 这正是大多数报价含混带过的区别。",
      minutes: "约 1 分钟",
    },
  },

  openLabel: "打开",

  footnote: {
    before:
      "两个工具都不会问你的姓名或电邮，也都不保存任何答案。如果你宁可直接并排看数字，而不想回答问题，那就看",
    compareLink: "对比表",
    between: "。如果你已经确定要哪一个计划，可以直接看",
    guideLink: "它的指南",
    after: "。",
  },

  schemaName: "马来西亚签证工具",
};

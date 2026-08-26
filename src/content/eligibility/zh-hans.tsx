import type { EligibilityCopy } from "./types";

/**
 * Simplified Chinese eligibility-checker copy. Traditional is generated — run
 * `npm run i18n:hant`, never edit the zh-hant sibling.
 *
 * The `patch` values are identical to the English file by necessity: they are
 * the answer's meaning, not its wording. A band edited here without its patch
 * would score a Chinese reader against a different tier than an English reader
 * giving the same answer.
 */
export const copy: EligibilityCopy = {
  meta: {
    title: "你符合哪一种马来西亚签证？",
    description:
      "一份简短的测试，根据你的年龄、财力与计划，告诉你实际符合哪些马来西亚长期居留计划与工作、留学准证 —— 以及你只差一点的是哪些。",
  },

  heading: "你符合哪一种签证？",
  lead: "最多六道题。无需注册、不保存任何资料、没有推销 —— 只是老实告诉你哪些计划适合你的情况，依据的是本站各处所用的同一批官方数字。",

  steps: {
    goal: {
      prompt: "你来马来西亚，主要打算做什么？",
      help: "这一题决定了哪些计划对你开放。",
      choices: [
        {
          label: "长期定居",
          hint: "退休、举家搬迁，或设立家庭基地 —— 不需要本地工作",
          patch: { goal: "live" },
        },
        {
          label: "为国外雇主或客户远程工作",
          hint: "收入由马来西亚境外支付",
          patch: { goal: "remote" },
        },
        {
          label: "受聘于马来西亚雇主",
          hint: "由本地公司聘用并担保",
          patch: { goal: "job" },
        },
        {
          label: "在马来西亚院校就读",
          hint: "中学、学院或大学的学额",
          patch: { goal: "study" },
        },
      ],
    },
    age: {
      prompt: "你今年多大？",
      help: "有两个长期居留计划设有最低年龄。",
      choices: [
        { label: "25 岁以下", patch: { ageFloor: 24 } },
        { label: "25 – 29 岁", patch: { ageFloor: 25 } },
        { label: "30 – 49 岁", patch: { ageFloor: 30 } },
        { label: "50 岁或以上", patch: { ageFloor: 50 } },
      ],
    },
    capital: {
      prompt: "你大概能拿出多少钱作为存款或投资？",
      help: "可以锁进定期存款或投入房产的钱。这笔钱仍然是你的 —— 存款不是费用。",
      choices: [
        { label: "RM 500,000 以下", patch: { capitalMYR: 0 } },
        { label: "RM 500,000 – RM 100 万", patch: { capitalMYR: 500_000 } },
        {
          label: "RM 100 万 – RM 205 万",
          hint: "≈ USD 150,000 – 500,000",
          patch: { capitalMYR: 1_000_000 },
        },
        {
          label: "RM 205 万 – RM 410 万",
          hint: "≈ USD 500,000 – 100 万",
          patch: { capitalMYR: 2_050_000 },
        },
        {
          label: "RM 410 万以上",
          hint: "≈ USD 100 万以上",
          patch: { capitalMYR: 4_100_000 },
        },
      ],
    },
    income: {
      prompt: "你的税前收入是多少？",
      help: "如果你以其他货币计薪，请换算成马币的等值金额。",
      choices: [
        { label: "每月 RM 5,000 以下", patch: { incomeMYR: 0 } },
        { label: "每月 RM 5,000 – RM 10,000", patch: { incomeMYR: 5_000 } },
        { label: "每月 RM 10,000 – RM 40,000", patch: { incomeMYR: 10_000 } },
        { label: "每月 RM 40,000 或以上", patch: { incomeMYR: 40_000 } },
      ],
    },
    property: {
      prompt: "为了取得资格，你愿意购买马来西亚房产吗？",
      help: "MM2H 要求购买房产，其他计划则一律不要求。",
      choices: [
        { label: "愿意，我会买房产", patch: { buyProperty: true } },
        { label: "不愿意，或宁可不买", patch: { buyProperty: false } },
      ],
    },
    sponsor: {
      prompt: "你是否已经有雇主或院校接洽好了？",
      help: "没有的话，这张准证无法提出申请。",
      choices: [
        { label: "已经有了", patch: { hasSponsor: true } },
        { label: "还没有", patch: { hasSponsor: false } },
      ],
    },
  },

  progress: {
    counter: (current, total) => `第 ${current} 题，共 ${total} 题`,
    start: "开始吧",
    back: "上一题",
  },

  results: {
    heading: "你的结果",
    goalIntro: {
      live: "根据你填的答案，以下是你在四个长期居留计划上的情况。",
      remote: "以下是远程工作的路径，以及你的财力同样可能打开的长期居留计划。",
      job: "受聘于马来西亚雇主只有一条路径 —— 就业准证。",
      study: "在马来西亚求学只有一条路径 —— 学生准证。",
    },
    fitsHeading: (count) => `符合 ${count} 个计划`,
    nearMissHeading: "只差一点",
    nearMissLead: "只被一项条件挡下 —— 如果你的情况可能改变，值得留意。",
    needsOnly: "只差：",
    readGuide: "阅读完整指南",
    nothingFits:
      "以你填的答案，没有哪一个计划完全对得上 —— 这很常见，也不代表没有路可走。这些计划经常变动，而边缘个案正是有经验的代理真正值那笔费用的地方。",
  },

  cta: {
    title: "想听听办过 500 多宗案子的人怎么说吗？",
    body: "Jason 会亲自审阅个案 —— 没有任何义务；如果自己办对你确实更好，他也会直说。",
    ask: "提出问题",
    compare: "并排对比",
  },

  disclaimer: (rate) =>
    `这是一份指引，并非裁定，也不构成法律意见。美元门槛以 USD 1 ≈ RM${rate} 的参考汇率换算比较 —— 你实际换到的汇率本身就是真实成本的一部分。这些结果背后的每一个数字，都出自各计划指南页所引用的官方来源。`,

  startOver: "重新开始",
};

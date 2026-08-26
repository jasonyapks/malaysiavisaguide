import type { CalculatorCopy } from "./types";

/**
 * Simplified Chinese cost-calculator copy. Traditional is generated — run
 * `npm run i18n:hant`, never edit the zh-hant sibling.
 *
 * No figure is written here. The line items, their amounts and the programme
 * prose behind them all come from `programmes.ts` by way of `lib/cost.ts` and
 * `localiseProgramme`.
 */
export const copy: CalculatorCopy = {
  meta: {
    title: "各类马来西亚签证的真实花费",
    description:
      "为每一项马来西亚长期居留计划与工作、留学准证提供逐项、诚实的费用估算 —— 按家庭人数计算，并把可退还的存款与一去不回的费用严格分开。",
  },

  heading: "实际要花多少钱？",
  lead: "选一个计划，再选家庭人数。每一个数字都取自该计划指南页上的官方数字 —— 而能拿回来的钱（定期存款），与拿不回来的钱清楚分开。",

  steps: {
    programme: "选择计划",
    dependants: "有多少名家属？",
    dependantTerm: (years) => `有多少人选择 ${years} 年期？`,
    nationality: "你持有哪一国护照？",
  },

  plusMainApplicant: "另加你本人，即主申请人",
  ofTotal: (total) => `／共 ${total} 名`,
  othersTakeTerm: (count, years) => ` —— 其余 ${count} 名选择 ${years} 年期`,
  termsMix: (options, ownTerm) =>
    `每名家属各自选择，所以一个家庭可以两种并存：${options}。你本人的年期固定为 ${ownTerm} 年，没有选择余地。`,
  termOption: (amount, years) => `${years} 年期 ${amount}`,
  termOptionSeparator: "，或 ",
  feesDoNotScale: (programme) =>
    `${programme}公布的费用不随家庭人数变化 —— 家属可加入准证，但官方来源并未列出按人头计算的费用。`,
  nationalityNote:
    "多次入境签证费与主申请人的保证金按护照订定，而非按计划订定 —— 单是保证金就从 RM200 到 RM2,000 不等。",
  nationalityAriaLabel: "国籍",

  results: {
    fullGuide: "完整指南",
    feesHeading: "费用 —— 拿不回来的钱",
    noFeesPublished:
      "这张准证没有公布参与费或处理费 —— 成本在于担保方的申请手续，以及你另行聘请的代理，两者都不是政府订定的数字。",
    capitalHeading: "资金 —— 可退还，或成为你的资产",
    capitalLead:
      "这不是开销。定期存款仍然是你的钱；房产成为你的资产。你需要准备好这笔钱，但并没有花掉它。",
    totalFees: "费用合计",
    totalCapital: "投入资金合计",
    readyHeading: "第一年需要准备好的金额",
    feesPlusCapital: "费用 + 资金",
    currenciesNote:
      "马币与美元数字分开列示，绝不相加 —— 你换到的汇率本身就是真实成本的一部分。MM2H 以美元计价，PVIP 与 S-MM2H 以马币计价。",
  },

  footer: {
    leavesOutLabel: "本估算未包含：",
    leavesOutWithAgency: (paymentTerms) =>
      `首个年期之后的续签费、医疗保险、体检费，以及生活费。代理费不在此列：${paymentTerms}`,
    leavesOutWithoutAgency:
      "代理费（此计划的代理费并非政府订定，也从未公布 —— 请在承诺之前拿到书面报价）、首个年期之后的续签费、保险，以及生活费。",
    everyFigureBefore: "以上每一个数字，都出自",
    guideLinkLabel: (programme) => `${programme}指南`,
    everyFigureAfter: "所引用的官方来源。",
    pricedOverTerm: (years) => `按 ${years} 年的首次批准期计价。`,
    pricedOverTermBody:
      "准证费与签证费按人头、按年期内的每一年收取，于事前一次性缴付，续签时再缴一次。",
    agencyFeeWrittenAgainst: (years) => `代理费正是按 ${years} 年订定的。`,
    passportCapped:
      "你的批准期以护照剩余有效期为上限，因此可能更短或更长 —— 请按比例调整准证费。",
    nationalityAttribution: (by, asAt) =>
      `签证费与保证金数字来自${by}，截至 ${asAt}。这些收费表并未在政府网址上公布，因此附上出处说明而非链接。`,
  },

  stepper: {
    fewer: (label) => `减少${label}`,
    more: (label) => `增加${label}`,
    dependants: "家属人数",
    dependantsOnLongerTerm: "选择较长年期的家属人数",
  },
};

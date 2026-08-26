// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
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
    title: "各類馬來西亞簽證的真實花費",
    description:
      "為每一項馬來西亞長期居留計劃與工作、留學準證提供逐項、誠實的費用估算 —— 按家庭人數計算，並把可退還的存款與一去不回的費用嚴格分開。",
  },

  heading: "實際要花多少錢？",
  lead: "選一個計劃，再選家庭人數。每一個數字都取自該計劃指南頁上的官方數字 —— 而能拿回來的錢（定期存款），與拿不回來的錢清楚分開。",

  steps: {
    programme: "選擇計劃",
    dependants: "有多少名家屬？",
    dependantTerm: (years) => `有多少人選擇 ${years} 年期？`,
    nationality: "你持有哪一國護照？",
  },

  plusMainApplicant: "另加你本人，即主申請人",
  ofTotal: (total) => `／共 ${total} 名`,
  othersTakeTerm: (count, years) => ` —— 其餘 ${count} 名選擇 ${years} 年期`,
  termsMix: (options, ownTerm) =>
    `每名家屬各自選擇，所以一個家庭可以兩種並存：${options}。你本人的年期固定為 ${ownTerm} 年，沒有選擇餘地。`,
  termOption: (amount, years) => `${years} 年期 ${amount}`,
  termOptionSeparator: "，或 ",
  feesDoNotScale: (programme) =>
    `${programme}公佈的費用不隨家庭人數變化 —— 家屬可加入準證，但官方來源並未列出按人頭計算的費用。`,
  nationalityNote:
    "多次入境簽證費與主申請人的保證金按護照訂定，而非按計劃訂定 —— 單是保證金就從 RM200 到 RM2,000 不等。",
  nationalityAriaLabel: "國籍",

  results: {
    fullGuide: "完整指南",
    feesHeading: "費用 —— 拿不回來的錢",
    noFeesPublished:
      "這張準證沒有公佈參與費或處理費 —— 成本在於擔保方的申請手續，以及你另行聘請的代理，兩者都不是政府訂定的數字。",
    capitalHeading: "資金 —— 可退還，或成為你的資產",
    capitalLead:
      "這不是開銷。定期存款仍然是你的錢；房產成為你的資產。你需要準備好這筆錢，但並沒有花掉它。",
    totalFees: "費用合計",
    totalCapital: "投入資金合計",
    readyHeading: "第一年需要準備好的金額",
    feesPlusCapital: "費用 + 資金",
    currenciesNote:
      "馬幣與美元數字分開列示，絕不相加 —— 你換到的匯率本身就是真實成本的一部分。MM2H 以美元計價，PVIP 與 S-MM2H 以馬幣計價。",
  },

  footer: {
    leavesOutLabel: "本估算未包含：",
    leavesOutWithAgency: (paymentTerms) =>
      `首個年期之後的續簽費、醫療保險、體檢費，以及生活費。代理費不在此列：${paymentTerms}`,
    leavesOutWithoutAgency:
      "代理費（此計劃的代理費並非政府訂定，也從未公佈 —— 請在承諾之前拿到書面報價）、首個年期之後的續簽費、保險，以及生活費。",
    everyFigureBefore: "以上每一個數字，都出自",
    guideLinkLabel: (programme) => `${programme}指南`,
    everyFigureAfter: "所引用的官方來源。",
    pricedOverTerm: (years) => `按 ${years} 年的首次批准期計價。`,
    pricedOverTermBody:
      "準證費與簽證費按人頭、按年期內的每一年收取，於事前一次性繳付，續簽時再繳一次。",
    agencyFeeWrittenAgainst: (years) => `代理費正是按 ${years} 年訂定的。`,
    passportCapped:
      "你的批准期以護照剩餘有效期為上限，因此可能更短或更長 —— 請按比例調整準證費。",
    nationalityAttribution: (by, asAt) =>
      `簽證費與保證金數字來自${by}，截至 ${asAt}。這些收費表並未在政府網址上公佈，因此附上出處說明而非鏈接。`,
  },

  stepper: {
    fewer: (label) => `減少${label}`,
    more: (label) => `增加${label}`,
    dependants: "家屬人數",
    dependantsOnLongerTerm: "選擇較長年期的家屬人數",
  },
};

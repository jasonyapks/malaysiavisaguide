// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
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
    title: "你符合哪一種馬來西亞簽證？",
    description:
      "一份簡短的測試，根據你的年齡、財力與計劃，告訴你實際符合哪些馬來西亞長期居留計劃與工作、留學準證 —— 以及你只差一點的是哪些。",
  },

  heading: "你符合哪一種簽證？",
  lead: "最多六道題。無需註冊、不保存任何資料、沒有推銷 —— 只是老實告訴你哪些計劃適合你的情況，依據的是本站各處所用的同一批官方數字。",

  steps: {
    goal: {
      prompt: "你來馬來西亞，主要打算做什麼？",
      help: "這一題決定了哪些計劃對你開放。",
      choices: [
        {
          label: "長期定居",
          hint: "退休、舉家搬遷，或設立家庭基地 —— 不需要本地工作",
          patch: { goal: "live" },
        },
        {
          label: "為國外僱主或客戶遠程工作",
          hint: "收入由馬來西亞境外支付",
          patch: { goal: "remote" },
        },
        {
          label: "受聘於馬來西亞僱主",
          hint: "由本地公司聘用並擔保",
          patch: { goal: "job" },
        },
        {
          label: "在馬來西亞院校就讀",
          hint: "中學、學院或大學的學額",
          patch: { goal: "study" },
        },
      ],
    },
    age: {
      prompt: "你今年多大？",
      help: "有兩個長期居留計劃設有最低年齡。",
      choices: [
        { label: "25 歲以下", patch: { ageFloor: 24 } },
        { label: "25 – 29 歲", patch: { ageFloor: 25 } },
        { label: "30 – 49 歲", patch: { ageFloor: 30 } },
        { label: "50 歲或以上", patch: { ageFloor: 50 } },
      ],
    },
    capital: {
      prompt: "你大概能拿出多少錢作為存款或投資？",
      help: "可以鎖進定期存款或投入房產的錢。這筆錢仍然是你的 —— 存款不是費用。",
      choices: [
        { label: "RM 500,000 以下", patch: { capitalMYR: 0 } },
        { label: "RM 500,000 – RM 100 萬", patch: { capitalMYR: 500_000 } },
        {
          label: "RM 100 萬 – RM 205 萬",
          hint: "≈ USD 150,000 – 500,000",
          patch: { capitalMYR: 1_000_000 },
        },
        {
          label: "RM 205 萬 – RM 410 萬",
          hint: "≈ USD 500,000 – 100 萬",
          patch: { capitalMYR: 2_050_000 },
        },
        {
          label: "RM 410 萬以上",
          hint: "≈ USD 100 萬以上",
          patch: { capitalMYR: 4_100_000 },
        },
      ],
    },
    income: {
      prompt: "你的稅前收入是多少？",
      help: "如果你以其他貨幣計薪，請換算成馬幣的等值金額。",
      choices: [
        { label: "每月 RM 5,000 以下", patch: { incomeMYR: 0 } },
        { label: "每月 RM 5,000 – RM 10,000", patch: { incomeMYR: 5_000 } },
        { label: "每月 RM 10,000 – RM 40,000", patch: { incomeMYR: 10_000 } },
        { label: "每月 RM 40,000 或以上", patch: { incomeMYR: 40_000 } },
      ],
    },
    property: {
      prompt: "為了取得資格，你願意購買馬來西亞房產嗎？",
      help: "MM2H 要求購買房產，其他計劃則一律不要求。",
      choices: [
        { label: "願意，我會買房產", patch: { buyProperty: true } },
        { label: "不願意，或寧可不買", patch: { buyProperty: false } },
      ],
    },
    sponsor: {
      prompt: "你是否已經有僱主或院校接洽好了？",
      help: "沒有的話，這張準證無法提出申請。",
      choices: [
        { label: "已經有了", patch: { hasSponsor: true } },
        { label: "還沒有", patch: { hasSponsor: false } },
      ],
    },
  },

  progress: {
    counter: (current, total) => `第 ${current} 題，共 ${total} 題`,
    start: "開始吧",
    back: "上一題",
  },

  results: {
    heading: "你的結果",
    goalIntro: {
      live: "根據你填的答案，以下是你在四個長期居留計劃上的情況。",
      remote: "以下是遠程工作的路徑，以及你的財力同樣可能打開的長期居留計劃。",
      job: "受聘於馬來西亞僱主只有一條路徑 —— 就業準證。",
      study: "在馬來西亞求學只有一條路徑 —— 學生準證。",
    },
    fitsHeading: (count) => `符合 ${count} 個計劃`,
    nearMissHeading: "只差一點",
    nearMissLead: "只被一項條件擋下 —— 如果你的情況可能改變，值得留意。",
    needsOnly: "只差：",
    readGuide: "閱讀完整指南",
    nothingFits:
      "以你填的答案，沒有哪一個計劃完全對得上 —— 這很常見，也不代表沒有路可走。這些計劃經常變動，而邊緣個案正是有經驗的代理真正值那筆費用的地方。",
  },

  cta: {
    title: "想聽聽辦過 500 多宗案子的人怎麼說嗎？",
    body: "Jason 會親自審閱個案 —— 沒有任何義務；如果自己辦對你確實更好，他也會直說。",
    ask: "提出問題",
    compare: "並排對比",
  },

  disclaimer: (rate) =>
    `這是一份指引，並非裁定，也不構成法律意見。美元門檻以 USD 1 ≈ RM${rate} 的參考匯率換算比較 —— 你實際換到的匯率本身就是真實成本的一部分。這些結果背後的每一個數字，都出自各計劃指南頁所引用的官方來源。`,

  startOver: "重新開始",
};

// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
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
  meta: { title: "簽證工具" },

  description:
    "兩個免費的馬來西亞長期居留簽證工具：一個六道題的資格檢測，告訴你符合哪些計劃；一個逐項列出的費用計算器，把能拿回的存款和拿不回的費用分開算清楚。",

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
    eyebrow: "從這裡開始",
    title: (
      <>
        先看資格，
        <span className="font-display accent-text font-medium">
          再算費用
        </span>
      </>
    ),
    sub: "請按這個順序來。費用是每個人開口就問的問題，也恰恰是最不該先問的：如果第一道流動資產門檻就把你排除在外，那麼 MM2H 白金級的總價算得再準也沒有意義。先弄清楚哪些計劃對你開放，再去算這幾個的錢。",
  },

  tools: {
    "/tools/eligibility/": {
      title: "資格檢測",
      question: "我到底能申請哪幾種？",
      body: "最多六道題 —— 年齡、收入、資金，以及你打算來做什麼。它會列出你符合的計劃、你只差一點的計劃以及差多少，並且不保存任何資料。",
      minutes: "約 2 分鐘",
    },
    "/tools/cost-calculator/": {
      title: "費用計算器",
      question: "實際要花我多少錢？",
      body: "按計劃和家庭人數逐項列出的總額，用的是與各指南相同的官方數字。可退還的定期存款與一去不回的費用嚴格分開列示 —— 這正是大多數報價含混帶過的區別。",
      minutes: "約 1 分鐘",
    },
  },

  openLabel: "打開",

  footnote: {
    before:
      "兩個工具都不會問你的姓名或電郵，也都不保存任何答案。如果你寧可直接並排看數字，而不想回答問題，那就看",
    compareLink: "對比表",
    between: "。如果你已經確定要哪一個計劃，可以直接看",
    guideLink: "它的指南",
    after: "。",
  },

  schemaName: "馬來西亞簽證工具",
};

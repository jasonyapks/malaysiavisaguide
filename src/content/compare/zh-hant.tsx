// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import type { CompareCopy } from "./types";

/**
 * Simplified Chinese compare copy. Traditional is generated from this file —
 * run `npm run i18n:hant`, never edit the zh-hant sibling.
 *
 * Every figure is a hole filled from `programmes.ts`, so a corrected fee moves
 * here and in English together. Nothing in this file states a number.
 */
export const copy: CompareCopy = {
  meta: {
    title: "馬來西亞各簽證計劃並排對比",
    description:
      "所有長期居留計劃與工作、留學準證，按真正決定取捨的數字並排對比 —— 定期存款、房產、年限、費用、最短居留與工作權。",
  },

  heading: "計劃對比",

  intro:
    "馬來西亞的長期居留計劃以存款為門檻：你靠投入資金取得資格。工作與留學準證則以擔保為門檻：由僱主或院校擔保你，不存在存款要求。",

  longStay: {
    heading: "長期居留計劃",
    note: "存款以該計劃本身計價的貨幣列出。MM2H 以美元計價，PVIP 與 S-MM2H 以馬幣計價 —— 所以你換到的匯率本身就是成本的一部分。",
  },

  workStudy: {
    heading: "工作與留學準證",
    intro:
      "兩者分開對比，是因為定期存款與薪資門檻並非同一類數字，放進同一張表會讓人誤以為它們是。",
    note: (f) => (
      <>
        表中的就業準證門檻為第三類（Category III）。第二類起於 {f.epCategoryII}
        ，第一類起於 {f.epCategoryI}。DE Rantau 的數字是科技類門檻；非科技類專業
        需達到 {f.deRantauNonTech}。
      </>
    ),
  },

  essay: {
    heading: "表格無法告訴你的事",
    items: [
      {
        title: "定期存款不是開銷。",
        body: (f) => (
          <>
            那筆錢仍然是你的。費用才是真正離開你口袋的錢。以 MM2H 銀級為例，這個
            差別是承諾投入 {f.mm2hSilverDeposit}，而實際支出{" "}
            {f.mm2hSilverSpend} —— 其中 {f.mm2hSilverParticipation} 為參與費、
            {f.mm2hSilverProcessing} 為處理費，另有政府訂定的代理費{" "}
            {f.mm2hSilverAgency} —— 而強制購買的 {f.mm2hSilverProperty}{" "}
            房產，又是第三類支出。
          </>
        ),
      },
      {
        title: "代理費在 MM2H 是固定的，在 PVIP 不是。",
        body: (f) => (
          <>
            這與市場上慣常的說法正好相反。MM2H 的代理費由政府訂定 —— 銀級{" "}
            {f.mm2hSilverAgency}、金級 {f.mm2hGoldAgency}、白金級{" "}
            {f.mm2hPlatinumAgency}，均已含 8% 銷售與服務稅 —— 所以更高的報價是
            錯的，而不是貴。PVIP 的代理費屬商業定價，官方從未公佈，也是本頁唯一
            一個你必須自己拿到書面報價的數字。
          </>
        ),
      },
      {
        title: "房產最低價不等於你實際要付的價格。",
        body: (f) => (
          <>
            MM2H 的數字是全國最低標準。外國買家還必須達到房產所在州屬自訂的門檻
            ——{" "}
            {f.stateFloors.map((s, i) => (
              <span key={s.name}>
                {i > 0 && "、"}
                {s.name}為 {s.amount}
              </span>
            ))}
            —— 兩者取其高者為準。銀級的 {f.mm2hSilverProperty}{" "}
            是最容易被這一條卡住的數字。
          </>
        ),
      },
      {
        title: "工作權是級別問題，不是計劃問題。",
        body: () => (
          <>
            PVIP 與 MM2H 白金級都具備工作權 —— 旅遊部 2025 年 12
            月的指南將白金級的商業、投資與職業活動標註為<em>允許</em>。MM2H
            銀級與金級則完全禁止，S-MM2H 屬受限。所以「MM2H
            不讓你工作」這句話，三個級別中只對其中兩個成立；如果你打算在馬來西亞
            謀生，上面那一行會把範圍縮小到 PVIP 與白金級，而不是隻剩 PVIP。
          </>
        ),
      },
    ],
  },

  quizCta: "不確定自己符合哪一種？用資格檢測工具跑一次 →",

  sourcesNote: (lastReviewed) =>
    `以上每一個數字，都出自各計劃指南頁所引用的官方來源。最後複核於 ${lastReviewed}。`,
};

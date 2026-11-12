// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { AuthorCopy } from "./types";

/**
 * Simplified Chinese author page. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs. Company, programme and association names stay in
 * Latin, as on /about/. The same rule as en.tsx applies: nothing unconfirmed.
 */
export const copy: AuthorCopy = {
  meta: {
    title: "Jason Yap：本站作者",
    description:
      "Jason Yap 撰寫並複核本站每一頁內容。他是 MPVIPCA 會長，也是 MYPVIP 與 MY Premium MM2H 的董事總經理。",
  },

  qualifier: "MPVIPCA 會長 · MYPVIP 董事總經理",
  portraitAlt: "Jason Yap，MYPVIP 董事總經理。",

  schemaDescription:
    "MPVIPCA 會長，兩家馬來西亞持牌長期居留簽證代理機構的董事總經理，自 2022 年以來成功辦理 PVIP 與 MM2H 申請 300+ 宗。",

  bio: (
    <>
      <p>
        Jason Yap 以辦理馬來西亞長期居留簽證申請為業。他是{" "}
        <strong>MYPVIP</strong>（MY PR Program Sdn Bhd）的董事總經理，這是一家辦理
        PVIP高級簽證計劃的持牌代理機構；他同時是{" "}
        <strong>MY Premium MM2H</strong>（My Premium (MM2H) Sdn Bhd）的董事總經理，這是一家辦理
        Malaysia My Second Home（MM2H）的持牌代理機構。自 2022
        年以來，兩家公司已成功辦理超過 300 宗 PVIP 與 MM2H 申請。
      </p>
      <p>
        他也是 <strong>MPVIPCA</strong>（Pertubuhan Perunding Program Visa Premium
        Malaysia）的會長，這是已註冊的 PVIP 顧問協會。
      </p>
      <p>
        本站每一頁都由他研究、撰寫並複核。數字來自官方文件的，頁面會附上鍊接；來自他公司實際辦理經驗的，頁面會註明並標上日期。
      </p>
    </>
  ),

  roles: {
    heading: "職務",
    items: [
      {
        role: "董事總經理",
        where: (
          <>
            <a href="https://mypvip.com" rel="noopener">
              MYPVIP
            </a>
            （MY PR Program Sdn Bhd）—— 辦理 Premium Visa Programme 申請
          </>
        ),
      },
      {
        role: "董事總經理",
        where: (
          <>
            MY Premium MM2H（My Premium (MM2H) Sdn Bhd）—— 辦理 Malaysia My Second
            Home 申請
          </>
        ),
      },
      {
        role: "會長",
        where: (
          <>
            MPVIPCA（Pertubuhan Perunding Program Visa Premium Malaysia）—— PVIP
            顧問協會
          </>
        ),
      },
    ],
  },

  work: {
    heading: "他在本站撰寫和複核的內容",
    intro: "本站每一頁都有他的署名和複核日期。這份清單由網站自動生成，所以始終完整。",
    guides: "簽證指南",
    insights: "深度觀點",
    news: (count) => (
      <>
        每一則新聞在發佈前也都由他複核 —— <Link href="/news/">至今共 {count} 則</Link>。
      </>
    ),
  },

  conflicts: {
    heading: "利益衝突",
    body: (
      <>
        <p>
          本站刊登官方的{" "}
          <Link href="/agents/">MM2H 持牌代理與 PVIP 授權代理名單</Link>
          。刊登這些名單的人，自己經營著兩家名列其中的代理機構，並且擔任 PVIP
          顧問協會的會長。閱讀名單時，你應該知道這一點。
        </p>
        <p>
          為此本站的做法是：每一條都照錄政府公佈的登記冊，並附上原始鏈接；他自己的公司與其他機構一樣按字母順序排列；列入名單不代表推薦。其餘做法見{" "}
          <Link href="/editorial-policy/">編輯方針</Link>。
        </p>
      </>
    ),
  },

  contact: {
    heading: "聯繫",
    body: (
      <>
        提問、更正和媒體查詢請通過 <Link href="/contact/">聯繫頁面</Link>
        ，他會親自閱讀。
      </>
    ),
  },

  aboutLink: (
    <>
      本站如何維持運作、與他的公司是什麼關係，見{" "}
      <Link href="/about/">關於這份指南</Link>。
    </>
  ),
};

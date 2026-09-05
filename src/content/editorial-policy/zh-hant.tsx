// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { EditorialPolicyCopy } from "./types";

/**
 * Simplified Chinese editorial policy copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Programme names follow src/locales/programmes/zh-hant.ts exactly:
 *   高端簽證計劃（PVIP）, MM2H, 砂拉越 MM2H（S-MM2H）, DE Rantau 數字遊民準證,
 *   學生準證（Student Pass）, 工作準證（Employment Pass）. This page names the
 *   authorities that own each figure, so the reader who goes to check must be
 *   able to match the name here against the guide and against the official
 *   page — which is in English or Malay.
 * - Authorities get the Chinese name with the English or acronym beside it, for
 *   the same reason. 移民局 is the word for the Immigration Department; do not
 *   introduce a second one.
 * - 複核 is "review", matching `bylineLastReviewed` in the UI dictionary. Not
 *   審核 (which reads as approval) and not 審閱.
 * - Domain names, currencies and the word ringgit stay as written: a reader
 *   comparing against a bank form needs the string, not a translation of it.
 */
export const copy: EditorialPolicyCopy = {
  meta: {
    title: "編輯方針",
    description:
      "本站的內容如何查證、註明出處、複核與標註日期，以及規則變動時會怎麼處理。",
  },

  title: "編輯方針",

  standfirst: (
    <>
      本站的每一個數字都能追溯到官方出處，由具名的人複核，並標註最後查證的日期。這一頁說明這套做法怎麼運作，以及規則變動時會怎麼處理
      —— 馬來西亞的簽證規則，變動得很頻繁。
    </>
  ),

  oneSourceOfTruth: {
    heading: "每個數字只有一個出處",
    body: (href) => (
      <>
        <p>
          費用、存款、收入門檻、簽證年期和房產最低價，正是本站存在的理由；數字寫錯，比缺一頁更糟。所以每一個數字都只存放在一份經過查證的資料檔裡，各份指南、
          <Link href={href("/compare/")}>對比表</Link>、
          <Link href={href("/tools/eligibility/")}>資格自查工具</Link>和
          <Link href={href("/tools/cost-calculator/")}>費用計算器</Link>
          全部讀取同一份檔案。改一處，所有引用之處同時更新 ——
          這四個地方不可能悄悄各說各話。
        </p>
        <p>
          這份檔案背後的規則很簡單：
          <strong>沒有官方出處的數字，一律不上線</strong>
          。如果一個數字無法對照政府頁面確認，它會被標記待查，而不是先發布再說。
        </p>
      </>
    ),
  },

  sources: {
    heading: "這些數字從哪裡來",
    body: (
      <>
        <p>每個數字都對照該項目的主管機關查證：</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>高端簽證計劃（PVIP）</strong> ——
            馬來西亞移民局（Immigration Department of Malaysia），該計劃完全由移民局主管。旅遊、藝術及文化部（MOTAC）與它無關，那是
            MM2H。
          </li>
          <li>
            <strong>MM2H</strong> —— 旅遊、藝術及文化部（MOTAC）轄下的 MM2H
            中心（
            <span className="font-mono text-[0.95em]">mm2h.motac.gov.my</span>
            ）。
          </li>
          <li>
            <strong>砂拉越 MM2H（S-MM2H）</strong> ——
            砂拉越移民局與州級項目辦公室，與聯邦計劃各自獨立運作。
          </li>
          <li>
            <strong>DE Rantau 數字遊民準證</strong> ——
            馬來西亞數字經濟機構（MDEC），由它主管這項準證。
          </li>
          <li>
            <strong>學生準證（Student Pass）</strong> —— EMGS（
            <span className="font-mono text-[0.95em]">
              educationmalaysia.gov.my
            </span>
            ），學生申請由它受理。
          </li>
          <li>
            <strong>工作準證（Employment Pass）</strong> ——
            移民局轄下的外籍人士服務組（Expatriate Services Division）。
          </li>
        </ul>
        <p>
          官方以美元公佈的數字，本站就以美元呈現；以令吉公佈的，就以令吉呈現。本站不做兩者之間的換算
          —— 匯率會動，官方門檻不會。
        </p>
      </>
    ),
  },

  review: {
    heading: "複核與日期",
    body: (
      <p>
        每份指南的頁尾都會註明
        <strong>「最後複核」日期和具名的複核人</strong> —— Jason Yap，
        <a href="https://mypvip.com" rel="nofollow noopener">
          MYPVIP
        </a>{" "}
        董事總經理。這個日期有實際用途，不是裝飾：兩年前的簽證數字，很可能就是錯的；讀者和
        AI
        助手更信任近期查證過的頁面，是合理的。如果一份頁面近期沒有複核過，它的日期會照實寫出來，而不是把日期藏起來。
      </p>
    ),
  },

  changes: {
    heading: "規則變動時",
    body: (
      <p>
        馬來西亞的簽證規則往往說改就改 ——
        費用調整、級別新增、申請管道開放又關閉。發生這種情況時，改動寫進那份唯一的資料檔，所有引用該數字的頁面隨之更新，受影響指南的複核日期也重設為查證當天。被取代的舊數字是直接替換掉，而不是與新數字並排留著，所以不會有陳舊的數字殘留在某個次要頁面上。
      </p>
    ),
  },

  independence: {
    heading: "獨立性與更正",
    body: (href) => (
      <>
        <p>
          經營本站的人，在其中部分項目上有商業利益；這層關係在
          <Link href={href("/about/")}>關於頁</Link>
          上已完整披露。隨之而來的編輯承諾是：更便宜的路線和自行申請的做法，會和代理機構收費代辦的路線一樣如實說明；每份指南里「哪些人不適合」那一節，也照直寫。
        </p>
        <p>
          發現某個數字看起來不對，或某項規則已經改了？
          <Link href={href("/contact/")}>告訴我們</Link> ——
          對數字的更正，是本站最有用的一類來信；我們會對照官方出處查證，一經確認就立即修正。
        </p>
      </>
    ),
  },
};

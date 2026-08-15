// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
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
 *   RM200,000 — not 20萬令吉 — because the reader will be comparing it against
 *   a bank form and an official page that both say RM200,000.
 * - The house voice is pain first, then the choice. That survives translation
 *   as directness: short sentences, the cost named early, no 我們致力於.
 */
export const copy: HomeCopy = {
  hero: {
    eyebrow: "獨立運營 · 每項數據都核對官方來源",
    heading: (
      <>
        馬來西亞長期居留簽證
        <br />
        <span className="font-display accent-text font-medium">
          把話說清楚
        </span>
      </>
    ),
    lead: "PVIP、MM2H、砂拉越 MM2H 和 DE Rantau 都能讓你長期住在馬來西亞 —— 但它們在費用、年限和適合的人群上差別極大。本站的每一個數字，都核對過官方來源。",
    chips: ["六項計劃全覆蓋", "費用全部列明", "每月複核"],
    ctaPrimary: "看看你符合哪一種",
    ctaSecondary: "對比各項計劃",
    cardEyebrow: "這份指南是什麼",
    cardTitle: (
      <>
        不是宣傳冊 ——{" "}
        <span className="text-forest-700">是一份你可以自己核對的參考</span>
      </>
    ),
    promises: [
      {
        title: "每個數字都對得上官方出處",
        body: "費用、門檻和年限都追溯到設定它的政府頁面，並註明我們最後一次查證的日期。",
      },
      {
        title: "PVIP 和 MM2H 並排對比",
        body: "同樣的字段、同樣的單位、同一張表 —— 取捨一目瞭然，而不是埋在大段文字裡。",
      },
      {
        title: "寫來是為了說明，不是為了成交",
        body: "某個計劃如果並不適合你，指南會直說。商業關係在每一頁都有披露。",
      },
    ],
  },

  blurbs: {
    "/visas/pvip/": "20 年居留、完整工作權，最高端的一檔。",
    "/visas/mm2h/": "白銀、黃金、白金 —— 以定期存款為核心的經典方案。",
    "/visas/sarawak-mm2h/": "認真考慮長住時，最便宜的一條路，走砂拉越。",
    "/visas/de-rantau/": "為遠程工作、收入來自海外的人準備的遊民準證。",
    "/visas/employment-pass/": "受僱於馬來西亞僱主時申請。",
    "/visas/student-pass/": "在馬來西亞院校註冊就讀時申請。",
  },

  // Two characters each, matching the English one-word device. These are mood
  // labels, not translations of the programme names.
  displayWords: {
    "/visas/pvip/": "尊享",
    "/visas/mm2h/": "經典",
    "/visas/sarawak-mm2h/": "超值",
    "/visas/de-rantau/": "遠程",
    "/visas/employment-pass/": "就業",
    "/visas/student-pass/": "求學",
  },

  programmes: {
    eyebrow: "選擇你的路徑",
    title: (
      <>
        哪一種馬來西亞簽證
        <br />
        <span className="accent-text">才真的適合你</span>
      </>
    ),
    body: (
      <>
        三種長期居留計劃的費用相差一個數量級，而工作準證和學生準證解決的完全是另一類問題。先從符合
        <strong className="font-bold text-forest-700">你為什麼要來</strong>
        的那一種開始看。
      </>
    ),
  },

  workStudy: {
    eyebrow: "工作與留學",
    title: (
      <>
        為了一份工作、
        <br />
        <span className="accent-text">一個課程，或遠程辦公</span>
      </>
    ),
    body: "這些不是居留計劃 —— 它們綁定在僱主、院校或一份海外薪水上。規則不同，時程也不同。",
  },

  freshness: {
    eyebrow: "可信度與依據",
    heading: (date) => (
      <>
        每一項費用與門檻
        <br />
        <span className="font-display accent-text font-medium">
          最後核對於 {date}
        </span>
      </>
    ),
    body: "馬來西亞的簽證規則經常變動 —— 而大多數網站會悄悄過時。本站的數字要改，只在一個地方改；複核日期會告訴你，你正在讀的內容有多新。",
  },

  sources: {
    eyebrow: "資料來源",
    title: (
      <>
        這些數字
        <br />
        <span className="accent-text">究竟從哪裡來</span>
      </>
    ),
    body: "本站的每一個數字都能追溯到一份政府文件。下面就是它們所依據的文件 —— 如果某個數字對你的決定很重要，請自己讀一遍。",
    prose: (href) => (
      <>
        <p>
          馬來西亞的長期居留簽證由好幾個不同的機構管轄，這正是大部分混亂的根源。PVIP
          歸馬來西亞移民局；MM2H 則由旅遊、藝術及文化部及其一站式中心負責辦理。把這兩者搞混，是二手報道里最常見的錯誤。砂拉越
          MM2H 是州屬計劃，有自己的部門、自己的存款要求和自己的批准流程 ——
          所以拿聯邦頁面上的數字來講 S-MM2H，通常都是錯的。DE Rantau 歸 MDEC，工作準證歸外籍人士服務局，學生準證則歸移民局與
          EMGS。
        </p>
        <p>
          這裡說「已核對」，意思是：有人打開了這段文字旁邊列出的那份文件，在裡面找到了該項費用、門檻或年限，並記下了日期。那個日期會公佈在對應的計劃指南上。如果某項規定只在新聞發佈會上宣佈過、卻從未寫進官方文件，指南就會照實這麼說，而不是悄悄挑一個讀起來更好看的數字。
        </p>
        <p>
          這件事比想像中更要緊，因為這些計劃改得很頻繁，而互聯網跟不上。光是 MM2H
          近年就重組過兩次，存款檔次、最低居住天數和代理要求全都動過。2023
          年準確的頁面今天照樣排在前面，代理也照舊引用舊門檻 ——
          因為舊門檻更好拿來做對比推銷。一個沒有日期、沒有出處的數字，不是你能據以規劃的資訊，那只是一種說法。
        </p>
        <p>
          所以：去讀原始文件。如果其中某一份和本站寫的內容相牴觸，那就是本站的錯誤，
          <Link
            href={href("/contact/")}
            className="font-semibold text-forest-700 underline"
          >
            聯繫頁面
          </Link>
          的存在，有一部分正是為了讓你能指出來。
          <Link
            href={href("/editorial-policy/")}
            className="font-semibold text-forest-700 underline"
          >
            編輯方針
          </Link>
          說明了更正是怎麼處理的，以及本站背後的商業關係是什麼。
        </p>
      </>
    ),
  },

  tools: {
    eyebrow: "實用工具",
    title: (
      <>
        先弄清楚{" "}
        <span className="font-display accent-text font-medium">
          你現在的位置
        </span>
      </>
    ),
    body: "花三分鐘用一下這些工具，勝過讀一個小時 —— 它們跑的是和指南同一套經過核對的數字。",
    indexLink: "哪個工具回答哪個問題",
    indexTail: "—— 以及為什麼要先看資格、再算費用。",
  },

  insights: {
    eyebrow: "深度觀點",
    title: (
      <>
        寫自{" "}
        <span className="font-display accent-text font-medium">
          500+ 個真實案例
        </span>
      </>
    ),
    body: (href) => (
      <>
        指南講的是每個計劃「是什麼」。這些文章講的是該選哪一個，以及選定之後要辦的材料到底是什麼樣子。{" "}
        <Link
          href={href("/insights/")}
          className="font-semibold text-forest-700 underline"
        >
          全部觀點
        </Link>
        。
      </>
    ),
  },

  closing: {
    eyebrow: "一對一諮詢",
    heading: (
      <>
        還是拿不準
        <br />
        <span className="font-display accent-text font-medium">
          哪一種簽證適合你？
        </span>
      </>
    ),
    body: "Jason 經手過 500+ 宗遷居個案。有問題就問 —— 沒有任何義務，也沒有非得用他公司服務的義務。",
    cta: "諮詢提問",
  },
};

// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { ThankYouCopy } from "./types";

/**
 * Simplified Chinese thank-you page copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Programme names stay in Latin: PVIP, MM2H. Same rule as the about page.
 * - Terminology follows the chrome: 指南, 編輯方針, 資格自測, 計劃.
 * - Do not write the two characters for "state clearly" followed by the perfect
 *   particle. The S2T generator reads that pair as the word meaning "to
 *   understand clearly" and converts the second character to its Traditional
 *   form, which is wrong here — it did exactly that on the about page until
 *   2026-09-16. The verb used below for "sets out the reason" regenerates clean.
 * - House voice is pain first, then the choice: short sentences, the awkward
 *   fact named rather than softened.
 */
export const copy: ThankYouCopy = {
  meta: {
    title: "資訊已送出",
    description: "你的諮詢已經送出。接下來會發生什麼，以及等待期間可以先讀些什麼。",
  },

  title: "資訊已送出",

  standfirst: (
    <>
      你的諮詢已經送出，回覆會寄到你填寫的郵箱。回信的就是研究並複核這些指南的那個人
      —— 不是客服中心，也不是自動回覆。
    </>
  ),

  body: (href) => (
    <>
      <p>
        等回覆的時候，有一點值得知道：發出這條資訊並沒有啟動任何簽證申請，也不構成任何承諾。本站是一份獨立指南。如果結論是你自己辦更划算，或者更便宜的計劃更適合你，那就會這樣告訴你
        —— <Link href={href("/editorial-policy/")}>編輯方針</Link> 和{" "}
        <Link href={href("/about/")}>已公開披露的商業關係</Link> 都交代了原因。
      </p>
      <p>
        如果你問的是某一項計劃，對應的那篇指南大概就是你今天能拿到的最快答案：
        <Link href={href("/visas/pvip/")}>PVIP</Link>、
        <Link href={href("/visas/mm2h/")}>MM2H</Link>、
        <Link href={href("/visas/sarawak-mm2h/")}>砂拉越 MM2H</Link>
        ；如果還在幾項之間拿不定主意，就看
        <Link href={href("/compare/")}>並排對比</Link>。
      </p>
      <p>
        什麼都沒收到？先翻一下垃圾郵件文件夾，別急著認定回覆丟了 ——
        如果確實不在其中，就<Link href={href("/contact/")}>再發一次</Link>。
      </p>
    </>
  ),

  cta: {
    text: "還在比較哪一種適合你？",
    label: "做一次資格自測",
    tail: "—— 它讀取的是和每篇指南同一套核對過的數據，而且完全免費。",
  },
};

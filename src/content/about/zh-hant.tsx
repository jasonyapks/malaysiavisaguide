// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { AboutCopy } from "./types";

/**
 * Simplified Chinese about page copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Company and programme names stay in Latin: MYPVIP, MY PR Program Sdn Bhd,
 *   MY Premium MM2H, Premium Visa Programme, Malaysia My Second Home. These are
 *   the registered identities on the licences, and this is the page whose whole
 *   job is letting a sceptical reader verify them. A Chinese rendering of a
 *   company name cannot be looked up in the SSM register.
 * - Same for the authorities in the last section — the Chinese name is given
 *   with the official English or acronym beside it, because the reader who
 *   checks will land on an English or Malay page.
 * - Terminology follows what the chrome already uses: 董事總經理, 持牌代理機構,
 *   遷居個案, 移民局. Do not introduce a second word for any of these.
 * - The house voice is pain first, then the choice. In translation that means
 *   directness: short sentences, the awkward fact named rather than softened,
 *   and none of the 我們致力於 register a Chinese corporate page would use —
 *   which matters most here, on the page that claims to be candid.
 */
export const copy: AboutCopy = {
  meta: {
    title: "關於這份指南",
    description:
      "誰在寫這個網站、背後的資歷，以及與 MYPVIP 和 MY Premium MM2H 之間已公開披露的商業關係。",
  },

  title: "關於這份指南",

  standfirst: (
    <>
      這是一份關於馬來西亞長期居留簽證的獨立參考，撰寫人以辦理這類申請為業。本站不是政府網站，也不迴避自己的商業關係
      —— 下面都會說清楚。
    </>
  ),

  portraitAlt: "Jason Yap，MYPVIP 董事總經理。",

  schemaDescription:
    "兩家馬來西亞持牌長期居留簽證代理機構的董事總經理，經手遷居個案 500+ 宗。",

  who: {
    heading: "誰在寫這些內容",
    beside: (
      <p>
        <strong>Jason Yap</strong> 是兩家馬來西亞持牌代理機構的董事總經理，專辦長期居留簽證申請
        —— 一家做 Premium Visa Programme（PVIP），一家做 Malaysia My Second
        Home（MM2H）。經他手的遷居個案超過 500
        宗。本站每一頁都由他研究、撰寫並複核，他的署名和複核日期就在每篇指南的末尾。
      </p>
    ),
    body: (
      <p>
        這份經驗就是本站存在的理由。網上的簽證內容，要麼是政府通告 ——
        簡短到沒法照著做；要麼是代理機構的推廣頁 ——
        悄悄略去那些會讓客戶卻步的部分。這份指南想補上缺的那一塊：真實的數字、真實的時間線，以及每項計劃到底適合誰的坦白判斷。
      </p>
    ),
  },

  disclosure: {
    heading: "商業關係 —— 公開披露",
    body: (href) => (
      <>
        <p>
          Jason 是{" "}
          <strong>
            <a href="https://mypvip.com" rel="nofollow noopener">
              MYPVIP
            </a>
          </strong>
          （MY PR Program Sdn Bhd）的董事總經理，該公司辦理 Premium Visa
          Programme 申請；他同時也是 <strong>MY Premium MM2H</strong>（My
          Premium (MM2H) Sdn Bhd）的董事總經理，該公司辦理 Malaysia My Second
          Home
          申請。兩家都是馬來西亞持牌代理機構。如果你決定找代理，那是他經營的生意，請帶著這一點來讀本站的每一句話。
        </p>
        <p>
          由此有兩件事，都是有意為之。第一，你讀本站，本站一分錢也賺不到 ——
          沒有廣告，沒有聯盟鏈接。本站確實統計頁面瀏覽量，用的是 Google Analytics
          和 Cloudflare，好讓 Jason 知道哪些指南真的有人讀；Google Analytics
          會為此設置 cookie。這些數據不賣給任何人。第二，本站對{" "}
          <Link href={href("/visas/sarawak-mm2h/")}>自己動手辦理的路徑</Link>{" "}
          和那些更便宜的計劃，寫得和代理機構收費承辦的計劃一樣詳細 ——
          因為一份迴避了不利選項的參考，根本算不上參考。
          <Link href={href("/editorial-policy/")}>編輯方針</Link>
          寫明瞭這份獨立性是怎麼守住的。
        </p>
      </>
    ),
  },

  government: {
    heading: "本站不是政府機構",
    body: (
      <p>
        本站與馬來西亞移民局（Immigration Department of
        Malaysia）、旅遊藝術文化部（MOTAC）、馬來西亞數字經濟發展機構（MDEC）、砂拉越州政府、EMGS
        或任何其他公共機構均無隸屬關係。本站公佈的每一個數字都能追溯到官方出處，但本站本身是一份私人運營的獨立指南。正式申請要通過相關主管機構或持牌代理辦理
        —— 這份指南的作用，是讓你在走進去之前就知道會遇到什麼。
      </p>
    ),
  },

  cta: {
    text: "不確定哪一種適合你？",
    label: "做一次資格自測",
    tail: "—— 它讀取的是和每篇指南同一套核對過的數據，而且完全免費。",
  },
};

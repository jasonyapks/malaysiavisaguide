// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { PrivacyCopy } from "./types";

/**
 * Simplified Chinese privacy copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Product and vendor names stay in Latin: Cloudflare Web Analytics, Google
 *   Analytics 4, Web3Forms, Google. A reader who wants to check what a tool
 *   does searches the Latin name; a Chinese rendering is unsearchable.
 * - Statute names get the Chinese with the English beside it — UK GDPR, EU
 *   GDPR, and 2010 年個人資料保護法令（Personal Data Protection Act 2010）. The
 *   reader asserting a right will be citing the English title.
 * - Cookie is 「Cookie」 throughout, not 緩存 and not 曲奇. It is the word that
 *   appears in the browser's own Chinese UI, which is where the reader goes to
 *   clear them.
 * - Region names follow the site's usage: 歐洲經濟區（EEA）、英國、瑞士.
 * - The email address and the two cookie identifiers are strings the reader
 *   will type or search for. Never translated, and the identifiers are not even
 *   in this file — see the note on `stored` in types.ts.
 */
export const copy: PrivacyCopy = {
  meta: {
    title: "隱私",
    description:
      "本站會統計什麼、儲存什麼、還有誰能看到，以及怎麼關掉分析功能 —— 用大白話說明。",
  },

  title: "隱私",

  standfirst: (
    <>
      本站不賣任何東西，不投放廣告，也沒有登錄功能。它收集的只有兩樣：哪些頁面被讀過的計數；以及你如果發來諮詢，你在表單裡填寫的資料。分析
      Cookie 在歐洲經濟區（EEA）、英國和瑞士默認關閉，在其他地方默認開啟。無論你在哪，下面那個開關都由你自己決定。
    </>
  ),

  who: {
    heading: "誰在運營本站",
    body: (href) => (
      <p>
        馬來西亞簽證指南由 <strong>Jason Yap</strong> 撰寫與運營，他同時經營兩家馬來西亞持牌簽證代理機構 ——
        <Link href={href("/about/")}>關於頁</Link>
        上已完整說明這層利益衝突。本頁涉及的任何事情，包括要求查看或刪除本站持有的關於你的資料，請電郵至{" "}
        <a href="mailto:admin@malaysiavisaguide.com">
          admin@malaysiavisaguide.com
        </a>
        。
      </p>
    ),
  },

  measured: {
    heading: "本站會統計什麼",
    body: (
      <>
        <p>本站用了兩套統計工具，兩者的行為並不相同。</p>
        <p>
          <strong>Cloudflare Web Analytics</strong>{" "}
          在每一次訪問時運行。它不設置任何 Cookie，不對你的瀏覽器做指紋識別，也無法跟著你到別的網站去。它只報告彙總數字
          —— 頁面瀏覽量、國家、來源網站、大致的設備類型。因為它不識別任何人，也不在你的設備上存放任何東西，所以無需徵得同意，也沒有開關。
        </p>
        <p>
          <strong>Google Analytics 4</strong>{" "}
          在歐洲經濟區（EEA）、英國和瑞士以外默認開啟；在這三地則要等你同意後才啟用
          —— 而且無論你在哪，下面那個開關始終優先於這個默認值。它會在你的瀏覽器裡寫入
          Cookie，並把你瀏覽過的頁面、由 IP
          地址推算出的大致位置，以及你的設備和瀏覽器類型發送給 Google。Google
          本身不儲存你的 IP
          地址，但它是本站唯一一處涉及第三方拼湊出一次訪問全貌的環節，這也正是它有開關的原因。Google
          對這些數據的處理，適用它自己的
          <a
            href="https://policies.google.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            隱私政策
          </a>
          。
        </p>
        <p>
          在分析功能關閉的狀態下，Google
          的代碼仍會加載，也仍會為每個頁面發送一個不含 Cookie
          的信號，內容是你當前所在頁面的網址和標題。它不會做的是寫入 Cookie
          或在你的設備上存放任何東西，所以沒有任何標識符把一個頁面和下一個頁面、或一次訪問和下一次訪問串起來。在這種狀態下發出的信號，不會出現在本站的報表裡。
        </p>
      </>
    ),
  },

  stored: {
    heading: "你的設備上存了什麼",
    columns: { name: "名稱", what: "是什麼", when: "何時寫入" },
    consentCookie: {
      what: <>你對 Cookie 提示條的回答。存在你的瀏覽器裡，不會發送到任何地方。</>,
      when: <>你點擊接受或拒絕時</>,
    },
    analyticsCookies: {
      what: (
        <>
          Google Analytics。用來區分不同的瀏覽器，使重複訪問不被算成新的人。
        </>
      ),
      when: (
        <>在歐洲經濟區（EEA）、英國和瑞士默認關閉；在其他地方默認開啟</>
      ),
    },
    after: (
      <p>
        全部就這些。本站沒有廣告 Cookie，沒有社交媒體像素，也沒有跨站追蹤器。
      </p>
    ),
  },

  enquiry: {
    heading: "如果你發來諮詢",
    body: (href) => (
      <>
        <p>
          <Link href={href("/contact/")}>諮詢表單</Link>
          會收集你的姓名、電郵地址、你選擇的項目，以及你的留言。表單由{" "}
          <strong>Web3Forms</strong> 負責投遞，這是一項把提交內容轉發到電郵收件箱的服務
          —— 所以你的留言途中會經過 Web3Forms 的系統，適用他們的
          <a
            href="https://web3forms.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            隱私政策
          </a>
          。
        </p>
        <p>
          這些資料只用來回復你，別無他用。它們不會被加進郵件名單，不會被出售，除非你要求引薦，否則也不會轉交給那兩家簽證代理機構中的任何一家。發問不等於開始辦理簽證申請。
        </p>
      </>
    ),
  },

  control: {
    heading: "開啟或關閉分析功能",
    intro: (
      <p>你隨時可以改變主意；改回來，不會比當初同意更麻煩。</p>
    ),
    preferences: {
      heading: "你的 Cookie 設置",
      checking: "正在讀取你當前的設置……",
      on: "分析 Cookie 在這個瀏覽器上是「開啟」的。",
      off: "分析 Cookie 在這個瀏覽器上是「關閉」的。",
      unchosenOn:
        "你還沒有選擇。在你所在的地區，分析 Cookie 默認開啟 —— 想關掉，點一下就行。",
      unchosenOff: "你還沒有選擇，所以分析 Cookie 是關閉的。",
      saved: " 已保存。",
      turnOff: "關閉",
      turnOn: "開啟",
      turnOnInactive: "「開啟」無法點擊，因為分析功能已經是開著的。",
      turnOffInactive: "「關閉」無法點擊，因為分析功能已經是關著的。",
      storageNote:
        "這項設置只存在這個瀏覽器裡，不會跟著你到另一臺設備。關閉分析功能會停止繼續發送數據；但它無法清除已經寫入的 Cookie —— 想徹底清掉，請在瀏覽器設置裡清除。",
    },
  },

  rights: {
    heading: "你的權利",
    body: (
      <>
        <p>
          本站的讀者來自很多國家，其中兩套法規值得點名。如果你身在英國或歐盟，
          <strong>UK GDPR 與 EU GDPR</strong>
          賦予你以下權利：查詢本站持有關於你的哪些資料、要求更正或刪除、反對處理，以及隨時撤回同意
          —— 上面那個控制項就是分析功能的撤回途徑。你也可以向所在國的數據保護機關投訴。如果你身在馬來西亞，
          <strong>2010 年個人資料保護法令（Personal Data Protection Act 2010）</strong>
          賦予你相當的查閱權與更正權。
        </p>
        <p>
          實際上，本站持有的個人資料只有一樣：你自己選擇發來的諮詢。發電郵到{" "}
          <a href="mailto:admin@malaysiavisaguide.com">
            admin@malaysiavisaguide.com
          </a>
          ，我們會把它找出來、發給你，或按你的要求刪除。
        </p>
      </>
    ),
  },

  changes: {
    heading: "本政策的變更",
    body: (
      <p>
        如果本站收集的內容有變，這一頁會隨之更新，下方的日期也會往後移。若某項變更擴大了收集範圍，本站會重新徵求同意，而不會當作舊的答覆仍然涵蓋它。
      </p>
    ),
    lastUpdatedLabel: "最後更新：",
  },
};

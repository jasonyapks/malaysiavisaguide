// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { EventsCopy } from "./types";

/** SOURCE for zh-hant — see scripts/gen-zh-hant.mjs. Same rule as en.tsx:
 *  nothing here that the two news stories do not already say. */
export const copy: EventsCopy = {
  meta: {
    title: "線上講座與活動",
    description:
      "MYPVIP 舉辦的馬來西亞長期居留簽證線上講座：即將舉行的場次與報名方式，以及往期講座的完整回放和文字版。",
  },
  heading: "線上講座與活動",
  lead: "由 MYPVIP 舉辦、關於馬來西亞長期居留簽證的講座。即將舉行的場次附報名鏈接；往期場次保留在這裡，附完整錄像。",

  upcoming: {
    heading: "即將舉行",
    none: (
      <>
        目前沒有已排定的場次。新的日期會先在<Link href="/news/">新聞頁</Link>公佈。
      </>
    ),
    register: "報名",
  },

  past: {
    heading: "往期回放",
    held: (date) => `舉行於 ${date}，馬來西亞時間晚上 8 點（UTC+8）`,
    readGuide: "閱讀這場講座的文字版指南",
    announcement: "活動預告",
    replayStory: "回放報道",
  },

  disclosure:
    "利益聲明：這些講座由 MYPVIP 主辦。本站出版人 Jason Yap 是 MYPVIP 的董事總經理。",

  events: {
    "pvip-visa-to-business-owner-2026-11": {
      title:
        "From PVIP Visa to Business Owner: Unlocking Malaysia's Business Opportunities（從 PVIP 簽證到企業主：開啟馬來西亞商機）",
      format: "Zoom 線上講座 · 英語 · 免費",
      speakers:
        "主持人為 PVIP 顧問 Chee Mee Ho，嘉賓講者為 JS Partners Chartered Accountant 執行合夥人 Datin Jiniy Seelan。兩位均為 MYPVIP 的業務夥伴。",
      summary: (
        <>
          <p>
            講座分三部分。第一，PVIP 不只是居留身份：最長 20
            年、沒有最低居住天數要求，並且可以工作、經營自己的公司。第二，公司本身：為什麼多數創業者選擇
            Sdn Bhd 而不是分公司或代表處，哪些行業允許 100% 外資持股，以及通過 SSM
            註冊公司的流程。
          </p>
          <p>
            第三，公司註冊之後的事：稅務登記、公司銀行賬戶、聘用員工，以及為什麼
            2026 年 6 月起收緊的工作準證（Employment Pass）規定不適用於 PVIP
            創業者。講座最後設有現場問答。
          </p>
        </>
      ),
    },
    "pvip-business-opportunities-2026-11-18": {
      title:
        "Unlocking Malaysia's Business Opportunities: A Practical Guide for PVIP Applicants（開啟馬來西亞商機：PVIP 申請人實用指南）",
      format: "Zoom 線上講座 · 英語 · 免費",
      speakers:
        "講者為 PVIP 顧問 Chee Mee，嘉賓講者為 JS Partners Chartered Accountant 執行合夥人 Datin Jiniy Seelan。兩位均為 MYPVIP 的業務夥伴。",
      summary: (
        <>
          <p>
            11月1日講座的第二場，分三部分：PVIP
            不只是居留身份、設立公司，以及從 PVIP 到正式營運的業務啟動與發展。講座最後設有現場問答。
          </p>
        </>
      ),
    },
  },
};

// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import { Section } from "@/components/GuideLayout";
import type { GuideCopy } from "../types";

/** Simplified Chinese Student Pass guide. SOURCE for zh-hant. */
export const copy: GuideCopy = {
  meta: {
    title: "馬來西亞學生準證：EMGS、費用與打工權利",
    description:
      "馬來西亞學生準證是怎麼運作的 —— EMGS 審核、RM60 準證費、每週 20 小時的打工上限，以及哪些學生可以帶家屬。",
  },

  title: "學生準證（Student Pass）",

  answer:
    "學生準證適用於在馬來西亞就讀的非公民學生，從三歲的學前教育一直到研究生階段。高等教育方面，由 EMGS 負責審核，並由你的院校提交申請。準證費為 RM60。持有人每週可在獲准場所工作 20 小時，碩士與博士生可以帶家屬。",

  suits: {
    yes: [
      "你已拿到馬來西亞院校的錄取，而院校必須為你擔保",
      "你在讀碩士或博士，並希望家人同行",
      "你想在求學期間，有一個成本低而合法的居留依據",
    ],
    no: [
      "你想全職工作 —— 上限是每週 20 小時",
      "你要就讀的是語言中心或培訓中心；這類學生不享有打工權利",
      "你想要一條通往長期居留的路，而這不是",
      "你是本科生但想帶家屬 —— 這隻開放給研究生",
    ],
  },

  faq: [
    {
      q: "誰可以申請馬來西亞學生準證？",
      a: "三歲及以上的非公民學生，涵蓋從學前教育到高等教育。高等教育方面由 EMGS 進行審核，申請通過 STARS 系統或 EMGS 門戶提交。中小學階段，可由學校代表、家長或法定監護人提出申請。",
    },
    {
      q: "學生準證要多少錢？",
      a: "學生準證費為 RM60。家屬或監護人的社交訪問準證為 RM90。簽證費率按國籍而定，另行收取；EMGS 的手續費和體檢費用同樣另計。",
    },
    {
      q: "持學生準證可以打工嗎？",
      a: "每週最多 20 小時，且只能在獲准的場所 —— 餐廳、加油站、迷你市場、酒店，以及大學校園範圍之內。這隻適用於公立大學和私立高等院校的學生。語言中心和培訓中心的學生不在此列。",
    },
    {
      q: "持學生準證可以帶家人嗎？",
      a: "碩士和博士生可以擔保配偶、18 歲以下子女、任何年齡的殘障子女，以及父母。家屬須以三個月的銀行對賬單，或獎學金／使館資助證明信，來證明經濟能力。家屬不得工作或經商。",
    },
    {
      q: "需要哪些材料？",
      a: "一份在馬來西亞獲認可、保障期至少 12 個月的健康保險，一份已蓋章的個人保證書（personal bond），以及院校出具的證明文件。家屬還需另外提供經濟能力證明。",
    },
  ],

  cta: {
    text: "打算畢業後繼續留下來？",
    label: "對比各條長期居留路徑",
    href: "/compare/",
  },

  sections: (href) => (
    <>
      <Section title="申請實際上是怎麼走的">
        <p>
          學生準證不是你自己去申請的。高等教育方面，由你的院校提交，再由{" "}
          <abbr title="Education Malaysia Global Services">EMGS</abbr>{" "}
          審核 —— 這意味著你選哪一所院校，直接決定了流程走得順不順；院校慢，申請就慢。
        </p>
        <p>
          中小學階段，可由學校代表、家長或法定監護人代未成年子女提出申請。
        </p>
      </Section>

      <Section title="打工上限，說清楚">
        <p>
          每週二十小時，且限於一份明確的場所清單：餐廳、加油站、迷你市場、酒店和大學校園範圍。這項權利適用於公立大學和私立高等院校的學生，
          <strong>不</strong>適用於語言中心或培訓中心的學生。
        </p>
        <p>
          這是一條真實的限制，不是走個形式，也不是一條能拿來負擔學費的路。如果你的計劃要靠打工才成立，那就該去看
          <Link href={href("/visas/employment-pass/")}>工作準證</Link>。
        </p>
      </Section>

      <Section title="畢業之後會怎樣">
        <p>
          學生準證隨課程結束而終止，不會自動轉成工作或居留準證。想留下來的畢業生，通常是通過馬來西亞僱主轉到
          <Link href={href("/visas/employment-pass/")}>工作準證</Link>
          ，或者 —— 在資金允許的情況下 —— 進入其中一項
          <Link href={href("/compare/")}>長期居留計劃</Link>。
        </p>
      </Section>
    </>
  ),
};

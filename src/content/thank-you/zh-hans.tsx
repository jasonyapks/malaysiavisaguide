import Link from "next/link";
import type { ThankYouCopy } from "./types";

/**
 * Simplified Chinese thank-you page copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Programme names stay in Latin: PVIP, MM2H. Same rule as the about page.
 * - Terminology follows the chrome: 指南, 编辑方针, 资格自测, 计划.
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
    title: "信息已送出",
    description: "你的咨询已经送出。接下来会发生什么，以及等待期间可以先读些什么。",
  },

  title: "信息已送出",

  standfirst: (
    <>
      你的咨询已经送出，回复会寄到你填写的邮箱。回信的就是研究并复核这些指南的那个人
      —— 不是客服中心，也不是自动回复。
    </>
  ),

  body: (href) => (
    <>
      <p>
        等回复的时候，有一点值得知道：发出这条信息并没有启动任何签证申请，也不构成任何承诺。本站是一份独立指南。如果结论是你自己办更划算，或者更便宜的计划更适合你，那就会这样告诉你
        —— <Link href={href("/editorial-policy/")}>编辑方针</Link> 和{" "}
        <Link href={href("/about/")}>已公开披露的商业关系</Link> 都交代了原因。
      </p>
      <p>
        如果你问的是某一项计划，对应的那篇指南大概就是你今天能拿到的最快答案：
        <Link href={href("/visas/pvip/")}>PVIP</Link>、
        <Link href={href("/visas/mm2h/")}>MM2H</Link>、
        <Link href={href("/visas/sarawak-mm2h/")}>砂拉越 MM2H</Link>
        ；如果还在几项之间拿不定主意，就看
        <Link href={href("/compare/")}>并排对比</Link>。
      </p>
      <p>
        什么都没收到？先翻一下垃圾邮件文件夹，别急着认定回复丢了 ——
        如果确实不在其中，就<Link href={href("/contact/")}>再发一次</Link>。
      </p>
    </>
  ),

  cta: {
    text: "还在比较哪一种适合你？",
    label: "做一次资格自测",
    tail: "—— 它读取的是和每篇指南同一套核对过的数据，而且完全免费。",
  },
};

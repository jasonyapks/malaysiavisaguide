import Link from "next/link";
import type { EditorialPolicyCopy } from "./types";

/**
 * Simplified Chinese editorial policy copy. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs.
 *
 * Translation notes for whoever edits this next:
 *
 * - Programme names follow src/locales/programmes/zh-hans.ts exactly:
 *   高端签证计划（PVIP）, MM2H, 砂拉越 MM2H（S-MM2H）, DE Rantau 数字游民准证,
 *   学生准证（Student Pass）, 工作准证（Employment Pass）. This page names the
 *   authorities that own each figure, so the reader who goes to check must be
 *   able to match the name here against the guide and against the official
 *   page — which is in English or Malay.
 * - Authorities get the Chinese name with the English or acronym beside it, for
 *   the same reason. 移民局 is the word for the Immigration Department; do not
 *   introduce a second one.
 * - 复核 is "review", matching `bylineLastReviewed` in the UI dictionary. Not
 *   审核 (which reads as approval) and not 审阅.
 * - Domain names, currencies and the word ringgit stay as written: a reader
 *   comparing against a bank form needs the string, not a translation of it.
 */
export const copy: EditorialPolicyCopy = {
  meta: {
    title: "编辑方针",
    description:
      "本站的内容如何查证、注明出处、复核与标注日期，以及规则变动时会怎么处理。",
  },

  title: "编辑方针",

  standfirst: (
    <>
      本站的每一个数字都能追溯到官方出处，由具名的人复核，并标注最后查证的日期。这一页说明这套做法怎么运作，以及规则变动时会怎么处理
      —— 马来西亚的签证规则，变动得很频繁。
    </>
  ),

  oneSourceOfTruth: {
    heading: "每个数字只有一个出处",
    body: (href) => (
      <>
        <p>
          费用、存款、收入门槛、签证年期和房产最低价，正是本站存在的理由；数字写错，比缺一页更糟。所以每一个数字都只存放在一份经过查证的资料档里，各份指南、
          <Link href={href("/compare/")}>对比表</Link>、
          <Link href={href("/tools/eligibility/")}>资格自查工具</Link>和
          <Link href={href("/tools/cost-calculator/")}>费用计算器</Link>
          全部读取同一份档案。改一处，所有引用之处同时更新 ——
          这四个地方不可能悄悄各说各话。
        </p>
        <p>
          这份档案背后的规则很简单：
          <strong>没有官方出处的数字，一律不上线</strong>
          。如果一个数字无法对照政府页面确认，它会被标记待查，而不是先发布再说。
        </p>
      </>
    ),
  },

  sources: {
    heading: "这些数字从哪里来",
    body: (
      <>
        <p>每个数字都对照该项目的主管机关查证：</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>高端签证计划（PVIP）</strong> ——
            马来西亚移民局（Immigration Department of Malaysia），该计划完全由移民局主管。旅游、艺术及文化部（MOTAC）与它无关，那是
            MM2H。
          </li>
          <li>
            <strong>MM2H</strong> —— 旅游、艺术及文化部（MOTAC）辖下的 MM2H
            中心（
            <span className="font-mono text-[0.95em]">mm2h.motac.gov.my</span>
            ）。
          </li>
          <li>
            <strong>砂拉越 MM2H（S-MM2H）</strong> ——
            砂拉越移民局与州级项目办公室，与联邦计划各自独立运作。
          </li>
          <li>
            <strong>DE Rantau 数字游民准证</strong> ——
            马来西亚数字经济机构（MDEC），由它主管这项准证。
          </li>
          <li>
            <strong>学生准证（Student Pass）</strong> —— EMGS（
            <span className="font-mono text-[0.95em]">
              educationmalaysia.gov.my
            </span>
            ），学生申请由它受理。
          </li>
          <li>
            <strong>工作准证（Employment Pass）</strong> ——
            移民局辖下的外籍人士服务组（Expatriate Services Division）。
          </li>
        </ul>
        <p>
          官方以美元公布的数字，本站就以美元呈现；以令吉公布的，就以令吉呈现。本站不做两者之间的换算
          —— 汇率会动，官方门槛不会。
        </p>
      </>
    ),
  },

  review: {
    heading: "复核与日期",
    body: (
      <p>
        每份指南的页尾都会注明
        <strong>「最后复核」日期和具名的复核人</strong> —— Jason Yap，
        <a href="https://mypvip.com" rel="nofollow noopener">
          MYPVIP
        </a>{" "}
        董事总经理。这个日期有实际用途，不是装饰：两年前的签证数字，很可能就是错的；读者和
        AI
        助手更信任近期查证过的页面，是合理的。如果一份页面近期没有复核过，它的日期会照实写出来，而不是把日期藏起来。
      </p>
    ),
  },

  changes: {
    heading: "规则变动时",
    body: (
      <p>
        马来西亚的签证规则往往说改就改 ——
        费用调整、级别新增、申请管道开放又关闭。发生这种情况时，改动写进那份唯一的资料档，所有引用该数字的页面随之更新，受影响指南的复核日期也重设为查证当天。被取代的旧数字是直接替换掉，而不是与新数字并排留着，所以不会有陈旧的数字残留在某个次要页面上。
      </p>
    ),
  },

  independence: {
    heading: "独立性与更正",
    body: (href) => (
      <>
        <p>
          经营本站的人，在其中部分项目上有商业利益；这层关系在
          <Link href={href("/about/")}>关于页</Link>
          上已完整披露。随之而来的编辑承诺是：更便宜的路线和自行申请的做法，会和代理机构收费代办的路线一样如实说明；每份指南里「哪些人不适合」那一节，也照直写。
        </p>
        <p>
          发现某个数字看起来不对，或某项规则已经改了？
          <Link href={href("/contact/")}>告诉我们</Link> ——
          对数字的更正，是本站最有用的一类来信；我们会对照官方出处查证，一经确认就立即修正。
        </p>
      </>
    ),
  },
};

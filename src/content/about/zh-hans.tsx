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
 * - Terminology follows what the chrome already uses: 董事总经理, 持牌代理机构,
 *   迁居个案, 移民局. Do not introduce a second word for any of these.
 * - The house voice is pain first, then the choice. In translation that means
 *   directness: short sentences, the awkward fact named rather than softened,
 *   and none of the 我们致力于 register a Chinese corporate page would use —
 *   which matters most here, on the page that claims to be candid.
 */
export const copy: AboutCopy = {
  meta: {
    title: "关于这份指南",
    description:
      "谁在写这个网站、背后的资历，以及与 MYPVIP 和 MY Premium MM2H 之间已公开披露的商业关系。",
  },

  title: "关于这份指南",

  standfirst: (
    <>
      这是一份关于马来西亚长期居留签证的独立参考，撰写人以办理这类申请为业。本站不是政府网站，也不回避自己的商业关系
      —— 下面都会说清楚。
    </>
  ),

  portraitAlt: "Jason Yap，MYPVIP 董事总经理。",

  schemaDescription:
    "两家马来西亚持牌长期居留签证代理机构的董事总经理，经手迁居个案 500+ 宗。",

  who: {
    heading: "谁在写这些内容",
    beside: (
      <p>
        <strong>Jason Yap</strong> 是两家马来西亚持牌代理机构的董事总经理，专办长期居留签证申请
        —— 一家做 Premium Visa Programme（PVIP），一家做 Malaysia My Second
        Home（MM2H）。经他手的迁居个案超过 500
        宗。本站每一页都由他研究、撰写并复核，他的署名和复核日期就在每篇指南的末尾。
      </p>
    ),
    body: (
      <p>
        这份经验就是本站存在的理由。网上的签证内容，要么是政府通告 ——
        简短到没法照着做；要么是代理机构的推广页 ——
        悄悄略去那些会让客户却步的部分。这份指南想补上缺的那一块：真实的数字、真实的时间线，以及每项计划到底适合谁的坦白判断。
      </p>
    ),
  },

  disclosure: {
    heading: "商业关系 —— 公开披露",
    body: (href) => (
      <>
        <p>
          Jason 是{" "}
          <strong>
            <a href="https://mypvip.com" rel="nofollow noopener">
              MYPVIP
            </a>
          </strong>
          （MY PR Program Sdn Bhd）的董事总经理，该公司办理 Premium Visa
          Programme 申请；他同时也是 <strong>MY Premium MM2H</strong>（My
          Premium (MM2H) Sdn Bhd）的董事总经理，该公司办理 Malaysia My Second
          Home
          申请。两家都是马来西亚持牌代理机构。如果你决定找代理，那是他经营的生意，请带着这一点来读本站的每一句话。
        </p>
        <p>
          由此有两件事，都是有意为之。第一，你读本站，本站一分钱也赚不到 ——
          没有广告，没有联盟链接。本站确实统计页面浏览量，用的是 Google Analytics
          和 Cloudflare，好让 Jason 知道哪些指南真的有人读；Google Analytics
          会为此设置 cookie。这些数据不卖给任何人。第二，本站对{" "}
          <Link href={href("/visas/sarawak-mm2h/")}>自己动手办理的路径</Link>{" "}
          和那些更便宜的计划，写得和代理机构收费承办的计划一样详细 ——
          因为一份回避了不利选项的参考，根本算不上参考。
          <Link href={href("/editorial-policy/")}>编辑方针</Link>
          写明了这份独立性是怎么守住的。
        </p>
      </>
    ),
  },

  government: {
    heading: "本站不是政府机构",
    body: (
      <p>
        本站与马来西亚移民局（Immigration Department of
        Malaysia）、旅游艺术文化部（MOTAC）、马来西亚数字经济发展机构（MDEC）、砂拉越州政府、EMGS
        或任何其他公共机构均无隶属关系。本站公布的每一个数字都能追溯到官方出处，但本站本身是一份私人运营的独立指南。正式申请要通过相关主管机构或持牌代理办理
        —— 这份指南的作用，是让你在走进去之前就知道会遇到什么。
      </p>
    ),
  },

  cta: {
    text: "不确定哪一种适合你？",
    label: "做一次资格自测",
    tail: "—— 它读取的是和每篇指南同一套核对过的数据，而且完全免费。",
  },
};

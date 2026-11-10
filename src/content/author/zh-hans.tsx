import Link from "next/link";
import type { AuthorCopy } from "./types";

/**
 * Simplified Chinese author page. SOURCE for zh-hant — see
 * scripts/gen-zh-hant.mjs. Company, programme and association names stay in
 * Latin, as on /about/. The same rule as en.tsx applies: nothing unconfirmed.
 */
export const copy: AuthorCopy = {
  meta: {
    title: "Jason Yap：本站作者",
    description:
      "Jason Yap 撰写并复核本站每一页内容。他是 MPVIPCA 会长，也是 MYPVIP 与 MY Premium MM2H 的董事总经理。",
  },

  qualifier: "MPVIPCA 会长 · MYPVIP 董事总经理",
  portraitAlt: "Jason Yap，MYPVIP 董事总经理。",

  schemaDescription:
    "MPVIPCA 会长，两家马来西亚持牌长期居留签证代理机构的董事总经理，自 2022 年以来成功办理 PVIP 与 MM2H 申请 300+ 宗。",

  bio: (
    <>
      <p>
        Jason Yap 以办理马来西亚长期居留签证申请为业。他是{" "}
        <strong>MYPVIP</strong>（MY PR Program Sdn Bhd）的董事总经理，这是一家办理
        Premium Visa Programme（PVIP）的持牌代理机构；他同时是{" "}
        <strong>MY Premium MM2H</strong>（My Premium (MM2H) Sdn Bhd）的董事总经理，这是一家办理
        Malaysia My Second Home（MM2H）的持牌代理机构。自 2022
        年以来，两家公司已成功办理超过 300 宗 PVIP 与 MM2H 申请。
      </p>
      <p>
        他也是 <strong>MPVIPCA</strong>（Pertubuhan Perunding Program Visa Premium
        Malaysia）的会长，这是已注册的 PVIP 顾问协会。
      </p>
      <p>
        本站每一页都由他研究、撰写并复核。数字来自官方文件的，页面会附上链接；来自他公司实际办理经验的，页面会注明并标上日期。
      </p>
    </>
  ),

  roles: {
    heading: "职务",
    items: [
      {
        role: "董事总经理",
        where: (
          <>
            <a href="https://mypvip.com" rel="noopener">
              MYPVIP
            </a>
            （MY PR Program Sdn Bhd）—— 办理 Premium Visa Programme 申请
          </>
        ),
      },
      {
        role: "董事总经理",
        where: (
          <>
            MY Premium MM2H（My Premium (MM2H) Sdn Bhd）—— 办理 Malaysia My Second
            Home 申请
          </>
        ),
      },
      {
        role: "会长",
        where: (
          <>
            MPVIPCA（Pertubuhan Perunding Program Visa Premium Malaysia）—— PVIP
            顾问协会
          </>
        ),
      },
    ],
  },

  work: {
    heading: "他在本站撰写和复核的内容",
    intro: "本站每一页都有他的署名和复核日期。这份清单由网站自动生成，所以始终完整。",
    guides: "签证指南",
    insights: "深度观点",
    news: (count) => (
      <>
        每一则新闻在发布前也都由他复核 —— <Link href="/news/">至今共 {count} 则</Link>。
      </>
    ),
  },

  conflicts: {
    heading: "利益冲突",
    body: (
      <>
        <p>
          本站刊登官方的{" "}
          <Link href="/agents/">MM2H 持牌代理与 PVIP 授权代理名单</Link>
          。刊登这些名单的人，自己经营着两家名列其中的代理机构，并且担任 PVIP
          顾问协会的会长。阅读名单时，你应该知道这一点。
        </p>
        <p>
          为此本站的做法是：每一条都照录政府公布的登记册，并附上原始链接；他自己的公司与其他机构一样按字母顺序排列；列入名单不代表推荐。其余做法见{" "}
          <Link href="/editorial-policy/">编辑方针</Link>。
        </p>
      </>
    ),
  },

  contact: {
    heading: "联系",
    body: (
      <>
        提问、更正和媒体查询请通过 <Link href="/contact/">联系页面</Link>
        ，他会亲自阅读。
      </>
    ),
  },

  aboutLink: (
    <>
      本站如何维持运作、与他的公司是什么关系，见{" "}
      <Link href="/about/">关于这份指南</Link>。
    </>
  ),
};

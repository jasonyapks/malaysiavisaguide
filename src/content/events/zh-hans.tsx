import Link from "next/link";
import type { EventsCopy } from "./types";

/** SOURCE for zh-hant — see scripts/gen-zh-hant.mjs. Same rule as en.tsx:
 *  nothing here that the two news stories do not already say. */
export const copy: EventsCopy = {
  meta: {
    title: "线上讲座与活动",
    description:
      "MYPVIP 举办的马来西亚长期居留签证线上讲座：即将举行的场次与报名方式，以及往期讲座的完整回放和文字版。",
  },
  heading: "线上讲座与活动",
  lead: "由 MYPVIP 举办、关于马来西亚长期居留签证的讲座。即将举行的场次附报名链接；往期场次保留在这里，附完整录像。",

  upcoming: {
    heading: "即将举行",
    none: (
      <>
        目前没有已排定的场次。新的日期会先在<Link href="/news/">新闻页</Link>公布。
      </>
    ),
    register: "报名",
  },

  past: {
    heading: "往期回放",
    held: (date) => `举行于 ${date}，马来西亚时间晚上 8 点（UTC+8）`,
    readGuide: "阅读这场讲座的文字版指南",
    announcement: "活动预告",
    replayStory: "回放报道",
  },

  disclosure:
    "利益声明：这些讲座由 MYPVIP 主办。本站出版人 Jason Yap 是 MYPVIP 的董事总经理。",

  events: {
    "pvip-visa-to-business-owner-2026-11": {
      title:
        "From PVIP Visa to Business Owner: Unlocking Malaysia's Business Opportunities（从 PVIP 签证到企业主：开启马来西亚商机）",
      format: "Zoom 线上讲座 · 英语 · 免费",
      speakers:
        "主持人为 PVIP 顾问 Chee Mee Ho，嘉宾讲者为 JS Partners Chartered Accountant 执行合伙人 Datin Jiniy Seelan。两位均为 MYPVIP 的业务伙伴。",
      summary: (
        <>
          <p>
            讲座分三部分。第一，PVIP 不只是居留身份：最长 20
            年、没有最低居住天数要求，并且可以工作、经营自己的公司。第二，公司本身：为什么多数创业者选择
            Sdn Bhd 而不是分公司或代表处，哪些行业允许 100% 外资持股，以及通过 SSM
            注册公司的流程。
          </p>
          <p>
            第三，公司注册之后的事：税务登记、公司银行账户、聘用员工，以及为什么
            2026 年 6 月起收紧的工作准证（Employment Pass）规定不适用于 PVIP
            创业者。讲座最后设有现场问答。
          </p>
        </>
      ),
    },
  },
};

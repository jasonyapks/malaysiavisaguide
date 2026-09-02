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
 *   GDPR, and 2010 年个人资料保护法令（Personal Data Protection Act 2010）. The
 *   reader asserting a right will be citing the English title.
 * - Cookie is 「Cookie」 throughout, not 缓存 and not 曲奇. It is the word that
 *   appears in the browser's own Chinese UI, which is where the reader goes to
 *   clear them.
 * - Region names follow the site's usage: 欧洲经济区（EEA）、英国、瑞士.
 * - The email address and the two cookie identifiers are strings the reader
 *   will type or search for. Never translated, and the identifiers are not even
 *   in this file — see the note on `stored` in types.ts.
 */
export const copy: PrivacyCopy = {
  meta: {
    title: "隐私",
    description:
      "本站会统计什么、储存什么、还有谁能看到，以及怎么关掉分析功能 —— 用大白话说明。",
  },

  title: "隐私",

  standfirst: (
    <>
      本站不卖任何东西，不投放广告，也没有登录功能。它收集的只有两样：哪些页面被读过的计数；以及你如果发来咨询，你在表单里填写的资料。分析
      Cookie 在欧洲经济区（EEA）、英国和瑞士默认关闭，在其他地方默认开启。无论你在哪，下面那个开关都由你自己决定。
    </>
  ),

  who: {
    heading: "谁在运营本站",
    body: (href) => (
      <p>
        马来西亚签证指南由 <strong>Jason Yap</strong> 撰写与运营，他同时经营两家马来西亚持牌签证代理机构 ——
        <Link href={href("/about/")}>关于页</Link>
        上已完整说明这层利益冲突。本页涉及的任何事情，包括要求查看或删除本站持有的关于你的资料，请电邮至{" "}
        <a href="mailto:admin@malaysiavisaguide.com">
          admin@malaysiavisaguide.com
        </a>
        。
      </p>
    ),
  },

  measured: {
    heading: "本站会统计什么",
    body: (
      <>
        <p>本站用了两套统计工具，两者的行为并不相同。</p>
        <p>
          <strong>Cloudflare Web Analytics</strong>{" "}
          在每一次访问时运行。它不设置任何 Cookie，不对你的浏览器做指纹识别，也无法跟着你到别的网站去。它只报告汇总数字
          —— 页面浏览量、国家、来源网站、大致的设备类型。因为它不识别任何人，也不在你的设备上存放任何东西，所以无需征得同意，也没有开关。
        </p>
        <p>
          <strong>Google Analytics 4</strong>{" "}
          在欧洲经济区（EEA）、英国和瑞士以外默认开启；在这三地则要等你同意后才启用
          —— 而且无论你在哪，下面那个开关始终优先于这个默认值。它会在你的浏览器里写入
          Cookie，并把你浏览过的页面、由 IP
          地址推算出的大致位置，以及你的设备和浏览器类型发送给 Google。Google
          本身不储存你的 IP
          地址，但它是本站唯一一处涉及第三方拼凑出一次访问全貌的环节，这也正是它有开关的原因。Google
          对这些数据的处理，适用它自己的
          <a
            href="https://policies.google.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            隐私政策
          </a>
          。
        </p>
        <p>
          在分析功能关闭的状态下，Google
          的代码仍会加载，也仍会为每个页面发送一个不含 Cookie
          的信号，内容是你当前所在页面的网址和标题。它不会做的是写入 Cookie
          或在你的设备上存放任何东西，所以没有任何标识符把一个页面和下一个页面、或一次访问和下一次访问串起来。在这种状态下发出的信号，不会出现在本站的报表里。
        </p>
      </>
    ),
  },

  stored: {
    heading: "你的设备上存了什么",
    columns: { name: "名称", what: "是什么", when: "何时写入" },
    consentCookie: {
      what: <>你对 Cookie 提示条的回答。存在你的浏览器里，不会发送到任何地方。</>,
      when: <>你点击接受或拒绝时</>,
    },
    analyticsCookies: {
      what: (
        <>
          Google Analytics。用来区分不同的浏览器，使重复访问不被算成新的人。
        </>
      ),
      when: (
        <>在欧洲经济区（EEA）、英国和瑞士默认关闭；在其他地方默认开启</>
      ),
    },
    after: (
      <p>
        全部就这些。本站没有广告 Cookie，没有社交媒体像素，也没有跨站追踪器。
      </p>
    ),
  },

  enquiry: {
    heading: "如果你发来咨询",
    body: (href) => (
      <>
        <p>
          <Link href={href("/contact/")}>咨询表单</Link>
          会收集你的姓名、电邮地址、你选择的项目，以及你的留言。表单由{" "}
          <strong>Web3Forms</strong> 负责投递，这是一项把提交内容转发到电邮收件箱的服务
          —— 所以你的留言途中会经过 Web3Forms 的系统，适用他们的
          <a
            href="https://web3forms.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            隐私政策
          </a>
          。
        </p>
        <p>
          这些资料只用来回复你，别无他用。它们不会被加进邮件名单，不会被出售，除非你要求引荐，否则也不会转交给那两家签证代理机构中的任何一家。发问不等于开始办理签证申请。
        </p>
      </>
    ),
  },

  control: {
    heading: "开启或关闭分析功能",
    intro: (
      <p>你随时可以改变主意；改回来，不会比当初同意更麻烦。</p>
    ),
    preferences: {
      heading: "你的 Cookie 设置",
      checking: "正在读取你当前的设置……",
      on: "分析 Cookie 在这个浏览器上是「开启」的。",
      off: "分析 Cookie 在这个浏览器上是「关闭」的。",
      unchosenOn:
        "你还没有选择。在你所在的地区，分析 Cookie 默认开启 —— 想关掉，点一下就行。",
      unchosenOff: "你还没有选择，所以分析 Cookie 是关闭的。",
      saved: " 已保存。",
      turnOff: "关闭",
      turnOn: "开启",
      turnOnInactive: "「开启」无法点击，因为分析功能已经是开着的。",
      turnOffInactive: "「关闭」无法点击，因为分析功能已经是关着的。",
      storageNote:
        "这项设置只存在这个浏览器里，不会跟着你到另一台设备。关闭分析功能会停止继续发送数据；但它无法清除已经写入的 Cookie —— 想彻底清掉，请在浏览器设置里清除。",
    },
  },

  rights: {
    heading: "你的权利",
    body: (
      <>
        <p>
          本站的读者来自很多国家，其中两套法规值得点名。如果你身在英国或欧盟，
          <strong>UK GDPR 与 EU GDPR</strong>
          赋予你以下权利：查询本站持有关于你的哪些资料、要求更正或删除、反对处理，以及随时撤回同意
          —— 上面那个控制项就是分析功能的撤回途径。你也可以向所在国的数据保护机关投诉。如果你身在马来西亚，
          <strong>2010 年个人资料保护法令（Personal Data Protection Act 2010）</strong>
          赋予你相当的查阅权与更正权。
        </p>
        <p>
          实际上，本站持有的个人资料只有一样：你自己选择发来的咨询。发电邮到{" "}
          <a href="mailto:admin@malaysiavisaguide.com">
            admin@malaysiavisaguide.com
          </a>
          ，我们会把它找出来、发给你，或按你的要求删除。
        </p>
      </>
    ),
  },

  changes: {
    heading: "本政策的变更",
    body: (
      <p>
        如果本站收集的内容有变，这一页会随之更新，下方的日期也会往后移。若某项变更扩大了收集范围，本站会重新征求同意，而不会当作旧的答复仍然涵盖它。
      </p>
    ),
    lastUpdatedLabel: "最后更新：",
  },
};

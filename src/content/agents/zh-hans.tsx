import Link from "next/link";
import type { AgentsCopy } from "./types";

export const copy: AgentsCopy = {
  hub: {
    meta: {
      title: "马来西亚 MM2H 与 PVIP 持牌代理名录",
      description:
        "付款之前，先确认 MM2H 或 PVIP 代理在政府官方名单上。可搜索的名单直接取自旅游艺术文化部（MOTAC）与马来西亚移民局，并附代理核查清单。",
    },
    title: "MM2H 与 PVIP 持牌代理名录",
    standfirst: (
      <>
        任何人都可以自称签证顾问，但只有列在两份政府名单上的公司，才能真正替你递交
        MM2H 或 PVIP 申请。签约或付款之前，请先在下方名单中找到这家公司。
      </>
    ),
    cardTitle: {
      mm2h: "MM2H：持牌公司",
      pvip: "PVIP：授权代理机构",
    },
    cardBody: (count, publisher, checked) => (
      <>
        共 {count} 家公司，取自{publisher}公布的名单，核对日期为 {checked}
        。可按公司名称搜索，或按州属筛选。
      </>
    ),
    why: {
      heading: "为什么名单是唯一可靠的核查方式",
      body: (href) => (
        <>
          <p>
            <strong>PVIP：</strong>
            移民局的名单写明，申请必须通过授权代理机构递交，移民局不接受直接递交。
          </p>
          <p>
            <strong>MM2H：</strong>
            MOTAC 现行指南规定，申请应通过经该部发牌的 MM2H
            旅游业者递交。
            <Link href={href("/visas/mm2h/")}>MM2H 指南</Link>
            完整引述了这项规定。
          </p>
          <p>
            网站、WhatsApp
            号码或品牌名称都证明不了什么。真正要看的是注册公司名称，MM2H
            还要看执照编号，两者都必须与名单一致。
          </p>
        </>
      ),
    },
  },

  list: {
    mm2h: {
      meta: {
        title: "MM2H 持牌代理：MOTAC 官方名单",
        description: (n) =>
          `全部 ${n} 家经 MOTAC 发牌的 MM2H 公司，可按名称和州属搜索，列出执照编号、执照状态和联系方式，并与 mm2h.gov.my 交叉核对。`,
      },
      title: "MM2H 持牌代理",
      standfirst: (
        <>
          MOTAC 现行指南规定，每一宗 MM2H 申请都要通过经该部发牌的 MM2H
          旅游业者办理。如果与你接洽的公司不在名单上，它就无法把你的申请递交给
          MOTAC。你可以在下方按名称搜索完整名单，或按州属筛选。
        </>
      ),
      guideLabel: "MM2H 指南",
    },
    pvip: {
      meta: {
        title: "PVIP 授权代理：移民局官方名单",
        description: (n) =>
          `全部 ${n} 家获移民局授权的 PVIP 申请代理机构，可按名称和州属搜索，列出地址和联系方式，均取自官方名单。`,
      },
      title: "PVIP 授权代理机构",
      standfirst: (
        <>
          移民局不接受直接递交的 PVIP
          申请。每一宗申请都必须通过政府委任的代理机构办理，而移民局公布了这份名单。如果与你接洽的公司不在名单上，它就无法替你递交申请。你可以在下方按名称搜索完整名单，或按州属筛选。
        </>
      ),
      guideLabel: "PVIP 指南",
    },
    breadcrumb: "持牌代理名录",
    guideLine: (link) => <>费用、条件和办理时间，请参阅{link}。</>,
  },

  publisher: {
    mm2h: "旅游艺术文化部（MOTAC）",
    pvip: "马来西亚移民局",
  },

  disclosure: (href) => (
    <>
      <strong>利益披露：</strong>本指南由 MYPVIP 的董事经理撰写。其旗下两家公司
      MY PR Program Sdn. Bhd.（PVIP）和 My Premium (MM2H) Sdn.
      Bhd. 均列于这些名单中。这里的每一条资料都取自政府官方名单，公司按英文字母顺序排列，列入名单并不代表推荐。
      <Link href={href("/about/")}>关于本指南</Link>
    </>
  ),

  checklist: (href) => (
    <>
      <h2 className="font-serif text-h3 font-semibold text-ink">
        付款前如何核查代理
      </h2>
      <ol className="ml-5 list-decimal space-y-2">
        <li>
          <strong>核对公司名称，而不是品牌名称。</strong>
          合约和发票上的名称必须是名单上的公司。转介人、营销品牌或所谓的“合作伙伴”都不是代理，即使他们由代理支付佣金。
        </li>
        <li>
          <strong>MM2H：核对执照编号和有效期。</strong>
          MOTAC 名单上有好几家互不相关、名称却很相似的公司。请对方以书面形式提供执照编号，并确认执照尚未过期。
        </li>
        <li>
          <strong>PVIP：要求出示批准信。</strong>
          <Link href={href("/visas/pvip/")}>PVIP 指南</Link>
          列明了移民局对代理机构的要求，以及如何到 SSM 查证。
        </li>
        <li>
          <strong>费用要书面列明，并分项列出。</strong>
          政府费用与代理本身的服务费应分开列出。MM2H 的代理费由政府规定，
          <Link href={href("/visas/mm2h/")}>MM2H 指南</Link>
          列出了具体金额，任何高于这些金额的报价都是错误的。
        </li>
        <li>
          <strong>付款给注册公司。</strong>
          款项应汇入以公司注册名称开立的账户，而不是个人账户。
        </li>
      </ol>
      <h3 className="font-serif text-lead font-semibold text-ink">危险信号</h3>
      <ul className="ml-5 list-disc space-y-2">
        <li>保证一定获批。批准与否由政府决定，不是代理。</li>
        <li>在名单上找不到的公司名称。</li>
        <li>只给一个总价，或只作口头报价。</li>
        <li>要求你把钱付给个人，而不是公司。</li>
      </ul>
    </>
  ),

  directory: {
    source: ({ register, publisher, checked, mm2hgov }) => (
      <>
        资料来源：{publisher}的 {register}
        。已完整抄录，核对日期为 {checked}。
        {mm2hgov && (
          <>
            并已与 MOTAC 的另一份名单（{mm2hgov}
            ）交叉核对，该名单的更新较慢。两者的有效期不一致时，两个日期都会列出。只出现在
            mm2h.gov.my 上的公司也已收录并加以标注，方便你分辨执照已失效还是名称拼写有误。
          </>
        )}
        如果两家名称不同的公司在名单上登记了相同的电邮域名、电话号码或办公地址，两张卡片都会注明。这只是名单上的事实，并不表示两家公司有关联；如果这对你重要，请直接询问。执照随时可能发出或撤销，签约前请务必到官方来源再次确认。
      </>
    ),
    searchHeading: (label) => `搜索 ${label} 名单`,
    statusAsAt: (date) => <>执照状态按截至 {date} 的有效期计算。</>,
    status: {
      valid: "✓ 有效",
      expiring: "! 60 天内到期",
      expired: "✕ 已过期",
      unlisted: "! 不在 motac.gov.my 名单上",
    },
    row: {
      licence: "执照编号",
      status: "状态",
      validity: "有效期",
      address: "地址",
      phone: "电话",
      email: "电邮",
    },
    mm2hgovPrints: (licence) => <>mm2h.gov.my 上此执照编号为 {licence}</>,
    validityFrom: { motac: "motac.gov.my 名单", mm2hgov: "仅见于 mm2h.gov.my" },
    mm2hgovShows: (range) => `；mm2h.gov.my 显示为 ${range}`,
    alsoOn: (label, link) => (
      <>
        也列于 {label} 名单：{link}
      </>
    ),
    alsoOnLink: (label) => `查看 ${label} 资料`,
    shares: (shared, company) => (
      <>
        在名单上与 {company} 登记了相同的{shared}
      </>
    ),
    shared: {
      "email domain": "电邮域名",
      "phone number": "电话号码",
      "office address": "办公地址",
    },
    joinList: (xs) =>
      xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join("、")}和${xs.at(-1)}`,
    schemaName: (label, register) => `${register} 上的 ${label} 代理`,
  },

  filter: {
    searchLabel: "按公司名称搜索",
    placeholder: "例如：{label} 公司",
    stateLabel: "州属",
    allStates: "所有州属",
    statusLabel: "执照状态",
    anyStatus: "所有状态",
    validNow: "目前有效（{n}）",
    lapsed: "已过期或不在现行名单上（{n}）",
    showing: "显示 {total} 家中的 {shown} 家",
    total: "共 {total} 家公司",
    clear: "清除筛选",
    noMatch:
      "名单上没有符合的公司。请对照代理合约或信笺上的名称检查拼写（公司名称为英文）。如果仍然找不到，表示它不在本页抄录的名单上。付款前，请先到上方链接的官方来源核实。",
  },

  states: {
    "Kuala Lumpur": "吉隆坡",
    Selangor: "雪兰莪",
    Johor: "柔佛",
    Penang: "槟城",
    Melaka: "马六甲",
    Perak: "霹雳",
    "Negeri Sembilan": "森美兰",
    Sarawak: "砂拉越",
    Pahang: "彭亨",
    Sabah: "沙巴",
    Terengganu: "登嘉楼",
    Putrajaya: "布城",
    Kedah: "吉打",
    Kelantan: "吉兰丹",
    Perlis: "玻璃市",
    Labuan: "纳闽",
  },
};

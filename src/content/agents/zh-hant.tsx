// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import type { AgentsCopy } from "./types";

export const copy: AgentsCopy = {
  hub: {
    meta: {
      title: "馬來西亞 MM2H 與 PVIP 持牌代理名錄",
      description:
        "付款之前，先確認 MM2H 或 PVIP 代理在政府官方名單上。可搜索的名單直接取自旅遊藝術文化部（MOTAC）與馬來西亞移民局，並附代理核查清單。",
    },
    title: "MM2H 與 PVIP 持牌代理名錄",
    standfirst: (
      <>
        任何人都可以自稱簽證顧問，但只有列在兩份政府名單上的公司，才能真正替你遞交
        MM2H 或 PVIP 申請。簽約或付款之前，請先在下方名單中找到這家公司。
      </>
    ),
    cardTitle: {
      mm2h: "MM2H：持牌公司",
      pvip: "PVIP：授權代理機構",
    },
    cardBody: (count, publisher, checked) => (
      <>
        共 {count} 家公司，取自{publisher}公佈的名單，核對日期為 {checked}
        。可按公司名稱搜索，或按州屬篩選。
      </>
    ),
    why: {
      heading: "為什麼名單是唯一可靠的核查方式",
      body: (href) => (
        <>
          <p>
            <strong>PVIP：</strong>
            移民局的名單寫明，申請必須通過授權代理機構遞交，移民局不接受直接遞交。
          </p>
          <p>
            <strong>MM2H：</strong>
            MOTAC 現行指南規定，申請應通過經該部發牌的 MM2H 旅遊業者遞交。
            <Link href={href("/visas/mm2h/")}>MM2H 指南</Link>
            完整引述了這項規定。
          </p>
          <p>
            網站、WhatsApp
            號碼或品牌名稱都證明不了什麼。真正要看的是註冊公司名稱，MM2H
            還要看執照編號，兩者都必須與名單一致。
          </p>
        </>
      ),
    },
  },

  list: {
    mm2h: {
      meta: {
        title: "MM2H 持牌代理：MOTAC 官方名單",
        description: (n) =>
          `全部 ${n} 家經 MOTAC 發牌的 MM2H 公司，可按名稱和州屬搜索，列出執照編號、執照狀態和聯繫方式，並與 mm2h.gov.my 交叉核對。`,
      },
      title: "MM2H 持牌代理",
      standfirst: (
        <>
          MOTAC 現行指南規定，每一宗 MM2H 申請都要通過經該部發牌的 MM2H
          旅遊業者辦理。如果與你接洽的公司不在名單上，它就無法把你的申請遞交給
          MOTAC。你可以在下方按名稱搜索完整名單，或按州屬篩選。
        </>
      ),
      guideLabel: "MM2H 指南",
    },
    pvip: {
      meta: {
        title: "PVIP 授權代理：移民局官方名單",
        description: (n, t) =>
          `移民局 PVIP 名單上的全部 ${n} 家有效代理機構，可按名稱和州屬搜索，列出地址和聯繫方式。另有 ${t} 家已於 2026 年 9 月被終止，未列入本名單。`,
      },
      title: "PVIP 授權代理機構",
      standfirst: (
        <>
          移民局不接受直接遞交的 PVIP
          申請。每一宗申請都必須通過政府委任的代理機構辦理，而移民局公佈了這份名單。如果與你接洽的公司不在名單上，它就無法替你遞交申請。你可以在下方按名稱搜索完整名單，或按州屬篩選。
        </>
      ),
      guideLabel: "PVIP 指南",
    },
    breadcrumb: "持牌代理名錄",
    guideLine: (link) => <>費用、條件和辦理時間，請參閱{link}。</>,
  },

  publisher: {
    mm2h: "旅遊藝術文化部（MOTAC）",
    pvip: "馬來西亞移民局",
  },

  disclosure: (href) => (
    <>
      <strong>利益披露：</strong>本指南由 MYPVIP 的董事經理撰寫。其旗下兩家公司
      MY PR Program Sdn. Bhd.（PVIP）和 My Premium (MM2H) Sdn. Bhd.
      均列於這些名單中。這裡的每一條資料都取自政府官方名單，公司按英文字母順序排列，列入名單並不代表推薦。
      <Link href={href("/about/")}>關於本指南</Link>
    </>
  ),

  checklist: (href) => (
    <>
      <h2 className="font-serif text-h3 font-semibold text-ink">
        付款前如何核查代理
      </h2>
      <ol className="ml-5 list-decimal space-y-2">
        <li>
          <strong>核對公司名稱，而不是品牌名稱。</strong>
          合約和發票上的名稱必須是名單上的公司。轉介人、營銷品牌或所謂的“合作夥伴”都不是代理，即使他們由代理支付佣金。
        </li>
        <li>
          <strong>MM2H：核對執照編號和有效期。</strong>
          MOTAC
          名單上有好幾家互不相關、名稱卻很相似的公司。請對方以書面形式提供執照編號，並確認執照尚未過期。
        </li>
        <li>
          <strong>PVIP：要求出示批准信。</strong>
          <Link href={href("/visas/pvip/")}>PVIP 指南</Link>
          列明了移民局對代理機構的要求，以及如何到 SSM 查證。
        </li>
        <li>
          <strong>費用要書面列明，並分項列出。</strong>
          政府費用與代理本身的服務費應分開列出。MM2H 的代理費由政府規定，
          <Link href={href("/visas/mm2h/")}>MM2H 指南</Link>
          列出了具體金額，任何高於這些金額的報價都是錯誤的。
        </li>
        <li>
          <strong>付款給註冊公司。</strong>
          款項應匯入以公司註冊名稱開立的賬戶，而不是個人賬戶。
        </li>
      </ol>
      <h3 className="font-serif text-lead font-semibold text-ink">危險信號</h3>
      <ul className="ml-5 list-disc space-y-2">
        <li>保證一定獲批。批准與否由政府決定，不是代理。</li>
        <li>在名單上找不到的公司名稱。</li>
        <li>只給一個總價，或只作口頭報價。</li>
        <li>要求你把錢付給個人，而不是公司。</li>
      </ul>
    </>
  ),

  directory: {
    source: ({ register, publisher, checked, mm2hgov }) => (
      <>
        資料來源：{publisher}的 {register}
        。已完整抄錄，核對日期為 {checked}。
        {mm2hgov && (
          <>
            並已與 MOTAC 的另一份名單（{mm2hgov}
            ）交叉核對，該名單的更新較慢。兩者的有效期不一致時，兩個日期都會列出。只出現在
            mm2h.gov.my
            上的公司也已收錄並加以標註，方便你分辨執照已失效還是名稱拼寫有誤。
          </>
        )}
        如果兩家名稱不同的公司在名單上登記了相同的電郵域名、電話號碼或辦公地址，兩張卡片都會註明。這只是名單上的事實，並不表示兩家公司有關聯；如果這對你重要，請直接詢問。執照隨時可能發出或撤銷，簽約前請務必到官方來源再次確認。
      </>
    ),
    searchHeading: (label) => `搜索 ${label} 名單`,
    statusAsAt: (date) => <>執照狀態按截至 {date} 的有效期計算。</>,
    status: {
      valid: "✓ 有效",
      expiring: "! 60 天內到期",
      expired: "✕ 已過期",
      unlisted: "! 不在 motac.gov.my 名單上",
    },
    pvipStatus: {
      active: "\u2713 列於移民局名單",
    },
    pvipTerminations: ({ count, month, by, on, listDated }) => (
      <>
        名單上有 {count} 家代理機構已於 {month}
        被終止。移民局尚未重新發布名單，日期為 {listDated}
        的現行名單仍列出這些機構，因此終止狀態是根據 {by} 於 {on}
        提供的資料，而非移民局公佈。這些機構未列入本名單。
      </>
    ),
    row: {
      licence: "執照編號",
      status: "狀態",
      validity: "有效期",
      address: "地址",
      phone: "電話",
      email: "電郵",
    },
    mm2hgovPrints: (licence) => <>mm2h.gov.my 上此執照編號為 {licence}</>,
    validityFrom: { motac: "motac.gov.my 名單", mm2hgov: "僅見於 mm2h.gov.my" },
    mm2hgovShows: (range) => `；mm2h.gov.my 顯示為 ${range}`,
    alsoOn: (label, link) => (
      <>
        也列於 {label} 名單：{link}
      </>
    ),
    alsoOnLink: (label) => `查看 ${label} 資料`,
    shares: (shared, company) => (
      <>
        在名單上與 {company} 登記了相同的{shared}
      </>
    ),
    shared: {
      "email domain": "電郵域名",
      "phone number": "電話號碼",
      "office address": "辦公地址",
    },
    joinList: (xs) =>
      xs.length < 2
        ? xs.join("")
        : `${xs.slice(0, -1).join("、")}和${xs.at(-1)}`,
    schemaName: (label, register) => `${register} 上的 ${label} 代理`,
  },

  filter: {
    searchLabel: "按公司名稱搜索",
    placeholder: "例如：{label} 公司",
    stateLabel: "州屬",
    allStates: "所有州屬",
    statusLabel: "執照狀態",
    anyStatus: "所有狀態",
    validNow: "目前有效（{n}）",
    lapsed: "已過期或不在現行名單上（{n}）",
    showing: "顯示 {total} 家中的 {shown} 家",
    total: "共 {total} 家公司",
    clear: "清除篩選",
    noMatch:
      "名單上沒有符合的公司。請對照代理合約或信箋上的名稱檢查拼寫（公司名稱為英文）。如果仍然找不到，表示它不在本頁抄錄的名單上。付款前，請先到上方鏈接的官方來源核實。",
  },

  states: {
    "Kuala Lumpur": "吉隆坡",
    Selangor: "雪蘭莪",
    Johor: "柔佛",
    Penang: "檳城",
    Melaka: "馬六甲",
    Perak: "霹靂",
    "Negeri Sembilan": "森美蘭",
    Sarawak: "砂拉越",
    Pahang: "彭亨",
    Sabah: "沙巴",
    Terengganu: "登嘉樓",
    Putrajaya: "布城",
    Kedah: "吉打",
    Kelantan: "吉蘭丹",
    Perlis: "玻璃市",
    Labuan: "納閩",
  },
};

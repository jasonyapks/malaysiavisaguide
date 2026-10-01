// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { Section } from "@/components/GuideLayout";
import {
  getProgramme,
  SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION,
  SMM2H_TERMS,
} from "@/lib/data/programmes";
import { money, moneyPer, reviewDate, years } from "@/lib/format";
import { localiseProgramme } from "@/lib/programme-locale";
import type { GuideCopy } from "../types";

// 所有數字都從 programmes.ts 讀取：能放進 Programme 字段的取自 smm2h 記錄，
// MTCP 指南在此之外公佈的取自 SMM2H_TERMS。這裡沒有手打的數字。
const s = localiseProgramme(getProgramme("smm2h")!, "zh-hant");
const silver = getProgramme("mm2h-silver")!;
const T = SMM2H_TERMS;

const fd = money(s.fixedDeposit!);
const income = moneyPer(s.incomeRequirement!, "zh-hant");
const incomeDep = moneyPer(T.incomeWithDependant, "zh-hant");
const savings = money(T.savings);
const savingsDep = money(T.savingsWithDependant);
const fdFloor = money(T.fdMinimumBalance);
const term = years(s.tenureYears, "zh-hant");
const firstYears = s.governmentExtras!.defaultTermYears!;
const firstTerm = years(firstYears, "zh-hant");
const processing = money({ amount: s.processingFee!.principal, currency: "MYR" });
const agentFee = s.governmentExtras!.agencyFee!;
const agentPrincipal = money({ amount: agentFee.principal, currency: agentFee.currency });
const agentDep = money({ amount: agentFee.perDependant, currency: agentFee.currency });
const kuching = money(T.propertyFloorKuching);
const otherDiv = money(T.propertyFloorOtherDivisions);
const jvCapital = money(T.jvMinPaidUpCapital);
const bonds = T.securityBonds.map((b) => b.bond.amount);
const bondLow = money({ amount: Math.min(...bonds), currency: "MYR" });
const bondHigh = money({ amount: Math.max(...bonds), currency: "MYR" });
const bond = (slug: (typeof T.securityBonds)[number]["slug"]) =>
  money(T.securityBonds.find((b) => b.slug === slug)!.bond);
// "每年在砂拉越累計 30 天" — the stay rule without its "main applicant only" tail.
const stay = s.minStayPerYear!.split("，")[0];
const propAttr = `此說法來自 MYPVIP 的實務操作，${reviewDate(SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION.asAt, "zh-hant")}`;

/** 保證金對應的國籍名稱是文字，留在各語言的文案裡；金額在 SMM2H_TERMS。 */
const BOND_LABELS: Record<(typeof T.securityBonds)[number]["slug"], string> = {
  singapore: "新加坡",
  thailand: "泰國",
  indonesia: "印度尼西亞",
  "jp-kr-hk-mo": "日本、韓國、香港與澳門",
  "cn-au-eu-tw-other": "中國、澳洲、歐洲、臺灣，以及未列出的國家",
  "us-ca": "美國與加拿大",
};

/** Simplified Chinese S-MM2H guide. SOURCE for zh-hant. */
export const copy: GuideCopy = {
  meta: {
    title: "砂拉越第二家園（S-MM2H）2026：申請條件與費用",
    description: `砂拉越有自己的一套 MM2H，規則也自成一格：${fd} 定期存款、${income} 收入或 ${savings} 存款、${term}期、${stay}，而且不強制買房。`,
  },

  title: "砂拉越 MM2H（S-MM2H）",

  answer: `砂拉越自行運作一套 MM2H，即砂拉越第二家園，與聯邦的計劃各自獨立。它需要在砂拉越的銀行存入 ${fd} 定期存款，並且要麼有${income}的退休金或海外收入，要麼有 ${savings} 的存款。準證為期 ${term}，須${stay}，而且 —— 與聯邦 MM2H 不同 —— 不要求你買房。`,

  suits: {
    yes: [
      "你是真的想住在砂拉越 —— 居住天數要求算的是待在砂拉越的時間",
      "你不想被迫在馬來西亞買房",
      `你的資金是令吉；這裡的存款是 ${fd}，不是一筆美元`,
      `你想要 ${term}的期限，而總投入只是聯邦 MM2H 的一小部分`,
      "你的財力在存款而不在月收入 —— S-MM2H 兩者擇一即可",
    ],
    no: [
      "你想住在吉隆坡或檳城 —— 這是一個砂拉越的計劃",
      `你未滿 ${s.minAge} 歲，因此不符合資格`,
      `你沒辦法做到${stay}`,
      `你需要全職工作 —— S-MM2H 每週最多允許 ${T.partTimeHoursPerWeek} 小時，且限於四個獲批行業`,
      "你想自己遞交申請 —— 必須由砂拉越的擔保人或持牌代理代為辦理",
    ],
  },

  faq: [
    {
      q: "2026 年砂拉越第二家園（S-MM2H）的申請條件是什麼？",
      a: `主申請人須年滿 ${s.minAge} 歲，並持有與馬來西亞有邦交國家的國籍；以色列和朝鮮除外。你要在砂拉越的銀行存入 ${fd} 定期存款，並證明${income}的退休金或海外收入（帶家屬為${incomeDep}），或 ${savings} 的存款（帶家屬為 ${savingsDep}），以最近 ${T.evidenceMonths} 個月的記錄為準。申請必須由一位住在砂拉越的擔保人或一家砂拉越持牌代理擔保並遞交。遞交時護照須有至少 ${T.passportMinValidityMonths} 個月的有效期，良民證須在 ${T.goodConductMaxAgeMonths} 個月以內，體檢則須在砂拉越完成。`,
    },
    {
      q: "S-MM2H 和聯邦 MM2H 有什麼不同？",
      a: `有四點關鍵差別。存款是 ${fd}，而不是一筆美元金額。買房是可選的，而不是強制的。最低年齡是 ${s.minAge} 歲，而不是 ${silver.minAge} 歲。而且它是砂拉越的計劃，居住天數算的是砂拉越，由州政府部門而非 MOTAC 管理。`,
    },
    {
      q: "申請 S-MM2H 需要多少收入？",
      a: `個人${income}；若納入家屬，則為${incomeDep} —— 以退休金證明信加 ${T.evidenceMonths} 個月的退休金流水，或在職證明作為佐證。此外也可以用存款來符合資格：個人 ${savings}，帶家屬則為 ${savingsDep}，以 ${T.evidenceMonths} 個月的銀行對賬單佐證。`,
    },
    {
      q: "辦 S-MM2H 總共要花多少錢？",
      a: `州政府收取一筆 ${processing} 的手續費，一次性、不退還，繳清之前不會開始處理。如果由持牌代理替你遞交，代理費由政府固定：主申請人 ${agentPrincipal}，每名家屬 ${agentDep}，均已含 8% 銷售與服務稅。你的擔保人須簽署一份 ${bondLow} 至 ${bondHigh} 的保證金，按國籍而定。這裡沒有參與費。${fd} 的定期存款不算開銷 —— 錢始終是你的 —— 但持有準證期間，這筆資金不能隨意動用。`,
    },
    {
      q: "準證有效期多長？",
      a: `${term}，以 ${firstYears}+${s.tenureYears - firstYears} 的方式簽發。滿 ${term}之後不能再續，必須在到期前 ${T.freshApplicationMonthsBeforeExpiry} 個月重新遞交一份全新的申請。`,
    },
    {
      q: "定期存款可以取出來嗎？",
      a: `在計劃中滿 ${years(T.fdWithdrawalAfterYears, "zh-hant")}後，最多可提取 ${T.fdWithdrawalMaxPercent}%，用於在砂拉越購置住宅、購車、醫療支出，或子女教育。賬戶餘額任何時候都不得低於 ${fdFloor} —— 這正是提取上限被定在一半的原因。`,
    },
    {
      q: "S-MM2H 一定要買房嗎？",
      a: `不用。購置是可選的。如果你確實要買，古晉省的門檻是 ${kuching}，其他省份是 ${otherDiv}，依據 1998 年《土地法（修訂）（第 2 號）令》。`,
    },
    {
      q: "持砂拉越第二家園可以住在吉隆坡嗎？",
      a: "可以去，但如果你打算以吉隆坡為家，這就是選錯了計劃。居住要求算的是在砂拉越的天數，不是在馬來西亞的天數，所以在吉隆坡住上幾個月也一天都不算。工作許可、存放定期存款的銀行、買房門檻，也全都是砂拉越的。若你的生活重心在半島，為此而設的是聯邦 MM2H。",
    },
    {
      q: "家人可以一起申請 S-MM2H 嗎？",
      a: `可以。配偶、父母，以及 ${T.childMaxAge} 歲及以下的子女都可以納入；身心障礙的子女不設年齡上限。納入家屬後，收入門檻提高到${incomeDep}，或存款門檻提高到 ${savingsDep}。每一名家屬不論年齡都須購買本地醫療保險，主申請人未滿 ${T.principalInsuranceBelowAge} 歲也須購買。如果由代理遞交，每名家屬另加 ${agentDep} 代理費。`,
    },
    {
      q: "持 S-MM2H 可以工作嗎？",
      a: `只能兼職，而且只限獲批行業：教育、銀行與證券、製造業、醫療。工時上限為每週 ${T.partTimeHoursPerWeek} 小時，每一份申請都須經 MTCP 遞交至州秘書轄下的審批委員會。你也可以與本地夥伴合資經營，以少數股東身份持有最多 ${T.jvMaxSharePercent}% 股權，實收資本不低於 ${jvCapital}。全職受僱則不獲允許。`,
    },
    {
      q: "我需要擔保人嗎？",
      a: `需要，而且繞不過去。每一位申請人都必須由一位來自砂拉越、目前也住在砂拉越的擔保人，或一家在砂拉越註冊的 SMM2H 持牌代理來擔保。擔保人須簽署保證金，金額按國籍而定，從新加坡的 ${bond("singapore")} 到美國與加拿大的 ${bond("us-ca")} 不等，完整的表列在上方費用一節。申請由該擔保人或代理透過州政府的 MOAS 系統遞交，你無法自行提交。`,
    },
    {
      q: "每年必須在砂拉越待多少天？",
      a: `${s.minStayPerYear} 在馬來西亞其他地方度過的日子不計算在內。`,
    },
    {
      q: "在砂拉越買房，可以和馬來西亞籍配偶聯名登記嗎？",
      a: `以外國買家身份，不行。實務上，砂拉越土地與測量局（Land & Survey Sarawak）不會登記一份轉入外國人與馬來西亞人聯名的過戶 —— 不論對方是配偶、子女還是其他人 —— 而且是在登記那一步才拒絕，也就是買賣合約已經簽署並蓋印之後。產權請只登記在你一個人名下。${propAttr}；《土地法》和 MTCP 指南都沒有用這樣的字眼寫明。`,
    },
  ],

  cta: {
    text: "把 S-MM2H 和聯邦各等級並排比一比。",
    label: "打開對比表",
    href: "/compare/",
  },

  sections: (href) => (
    <>
      <Section title="S-MM2H 申請條件：兩條符合資格的路徑">
        <p>
          S-MM2H 接受收入流或一筆存款二選一，這在同類計劃裡並不常見，也讓一些被聯邦計劃擋在門外的人夠得著：
        </p>
        <ul>
          <li>
            <strong>收入：</strong>個人{income}，帶家屬則為{incomeDep}，來源可以是退休金或海外受僱收入。
          </li>
          <li>
            <strong>或者存款：</strong>個人 {savings}，帶家屬則為 {savingsDep}，以 {T.evidenceMonths} 個月的對賬單佐證。
          </li>
        </ul>
        <p>
          在兩者之外，還必須在砂拉越當地的銀行存入 {fd} 定期存款，其中 {fdFloor} 在你持有準證期間必須一直留在賬戶裡。另需向州政府部門繳付一次性手續費 {processing}；該費用不予退還，未繳清之前不會開始處理。
        </p>
        <p>
          其餘的門檻與錢無關，而是資格。主申請人須年滿 {s.minAge} 歲。凡與馬來西亞有邦交國家的公民都可申請，以色列和朝鮮除外。遞交申請時，護照須有至少 {T.passportMinValidityMonths} 個月的有效期；良民證須在 {T.goodConductMaxAgeMonths} 個月以內開具。每一名家屬都必須購買本地醫療保險，主申請人未滿 {T.principalInsuranceBelowAge} 歲也一樣。
        </p>
        <p>
          可納入的家屬是配偶、父母，以及 {T.childMaxAge} 歲及以下的子女；身心障礙的子女不設年齡上限。
        </p>
      </Section>

      <Section title="S-MM2H 費用一覽：政府收費與開支">
        <p>
          S-MM2H 的收費項目比聯邦 MM2H 少，而且完全沒有參與費。哪些要付、付給誰、替誰付：
        </p>
        <DataTable
          caption="S-MM2H 政府及州政府收費"
          idPrefix="smm2h-fee"
          locale="zh-hant"
          head={["", "主申請人", "每名家屬"]}
          rows={[
            {
              label: "手續費（MTCP）",
              cells: [
                { value: processing, note: 1 },
                { value: s.processingFee!.dependant === 0 ? "無" : money({ amount: s.processingFee!.dependant, currency: "MYR" }) },
              ],
            },
            {
              label: "代理費（含 8% SST）",
              cells: [{ value: agentPrincipal, note: 2 }, { value: agentDep }],
            },
            {
              label: "保證金",
              cells: [{ value: `${bondLow}–${bondHigh}`, note: 3 }, { value: "未公佈" }],
            },
            {
              label: "參與費",
              cells: [{ value: "無" }, { value: "無" }],
            },
            {
              label: `第 ${firstYears} 年延期`,
              cells: [{ value: "未公佈收費", note: 4 }, { value: "未公佈收費" }],
            },
          ]}
          notes={[
            "一次性收取，不予退還。須在申請開始處理之前繳付給州政府部門。",
            "由政府固定，不由代理機構訂定，所以報價高於這個數字的，是報錯了，而不是比較貴。適用於由 SMM2H 持牌代理遞交的申請。何時繳付並未公佈。",
            "按國籍而定，由擔保人或代理簽署。完整的表列在下方。",
            `準證分兩個 ${firstTerm}期簽發。從第一期轉入第二期，並沒有公佈任何收費。`,
          ]}
        />
        <p>
          保證金是唯一一個看你是誰、而不是看你買什麼的數字。它由擔保人或代理替你簽署，金額按你的國籍而定：
        </p>
        <ul>
          {T.securityBonds.map((b) => (
            <li key={b.slug}>
              <strong>{BOND_LABELS[b.slug]}</strong> —— {money(b.bond)}
            </li>
          ))}
        </ul>
        <p>
          有兩筆開銷不在任何收費表上。體檢在砂拉越的診所做，本地醫療保險向保險公司購買；兩者都按市場定價，都沒有政府公佈的數字。另外請預留至少一趟去砂拉越做體檢的行程，因為在原居地做的體檢報告不會被接受。
        </p>
        <p>
          接下來是資金。{fd} 的定期存款不是費用 —— 它始終是你的 —— 但在你持有準證期間都被鎖定。滿 {years(T.fdWithdrawalAfterYears, "zh-hant")}後，最多可提取 {T.fdWithdrawalMaxPercent}%，用於在砂拉越購屋、購車、醫療或子女教育，餘額任何時候都不得低於 {fdFloor}。由於買房是可選的，你不像申請聯邦 MM2H 那樣，在獲批之前還得備好第二筆、而且更大的資金。
        </p>
        <p>
          所以按第一期的預算算，一名單身申請人若透過代理遞交，收費部分是 {processing} 加上 {agentPrincipal}，再加保證金、體檢和保險，存款則另外備好放在一旁。每多一名家屬，代理費加 {agentDep}，外加其本人的保險。
          <Link href={href("/tools/cost-calculator/")}>費用計算器</Link>
          可以按你家庭的情況把這些數字算一遍。
        </p>
      </Section>

      <Section title="如何申請砂拉越第二家園（S-MM2H）">
        <p>
          整個申請從頭到尾都是州政府的流程，由 MTCP 負責，而不是 MOTAC 或移民局的聯邦櫃檯。以下是 MTCP 指南所列的申請內容 —— 指南並沒有把每一步都對上日期，所以後面幾步的先後只作參考：
        </p>
        <ol>
          <li>
            <strong>找擔保人或持牌代理。</strong>可以是一位來自砂拉越、目前也住在砂拉越的擔保人，或一家在砂拉越持牌並註冊的 SMM2H 代理。沒有自助申請的途徑，所以這是第一步。
          </li>
          <li>
            <strong>準備文件。</strong>護照須有至少 {T.passportMinValidityMonths} 個月的有效期，良民證須在 {T.goodConductMaxAgeMonths} 個月以內，另加你所選財力路徑的 {T.evidenceMonths} 個月證明 —— 退休金證明信與退休金流水、在職證明，或存款路徑所需的銀行對賬單。
          </li>
          <li>
            <strong>透過 MOAS 遞交。</strong>擔保人或代理在州政府的 MOAS 系統上遞交申請，並按你的國籍簽署保證金。
          </li>
          <li>
            <strong>繳付手續費。</strong>向州政府部門繳付 {processing}。繳清之前，什麼都不會動。
          </li>
          <li>
            <strong>定期存款、體檢與保險。</strong>{fd} 定期存款存入砂拉越的指定銀行。體檢在砂拉越進行，並由政府醫生背書；所有須投保的人都要買好本地醫療保險。
          </li>
          <li>
            <strong>簽發準證。</strong>第一期為 {firstTerm}，之後再延期 {firstTerm}。
          </li>
        </ol>
        <p>
          最常耽誤時間的是體檢。在原居地做的報告會被退回重做，之後才會發出準證，所以去砂拉越這一趟免不了，最好及早安排。
        </p>
        <p>
          至於要多久，本指南不給數字。MTCP 指南沒有公佈處理時間，沒有依據的數字只是猜測。請向擔保人或代理問清楚他們目前的經驗，並把任何答覆當作估計，而非承諾。唯一確定的日期在最後：滿 {term}後準證不能再續，必須在到期前 {T.freshApplicationMonthsBeforeExpiry} 個月重新遞交全新的申請。
        </p>
      </Section>

      <Section title="S-MM2H 買房規定：外國人在砂拉越可以買什麼">
        <p>
          在 S-MM2H 下，買房是可選的。定期存款才是取得資格的途徑，不買任何東西也能獲批。但不少參與者還是會買，而適用的規則來自砂拉越自己的土地法，而不是這個計劃。砂拉越實行《砂拉越土地法》，與半島適用的《國家土地法》分開，所以吉隆坡、檳城或柔佛的門檻數字在這裡一概不適用。
        </p>
        <p>
          門檻按每一處房產、按省份而定，依據 1998 年《土地法（修訂）（第 2 號）令》，MTCP 指南引用的也是同樣的數字：
        </p>
        <ul>
          <li>
            <strong>古晉省：</strong>{kuching}
          </li>
          <li>
            <strong>其他所有省份：</strong>{otherDiv}
          </li>
        </ul>
        <p>
          看的是市值，所以把成交價報低，並不能讓一處房產落到門檻之內。在門檻之上，外國人可以買公寓、共管公寓等高樓住宅，也可以買有地住宅，以及位於憲報公佈的特別發展區內的房產。空地原則上不能買，例外情況很窄。
        </p>
        <p>
          有三點依據的是實務經驗，而不是法令或指南的條文。第一，產權只登記在你一個人名下：與馬來西亞人聯名的過戶 —— 包括配偶 —— 會在登記時被砂拉越土地與測量局拒絕，而那時買賣合約早已簽署蓋印。第二，外國人可持有的房產數量，目前沒有公佈任何上限；每一宗只需各自過門檻，但要買第二、第三處之前，最好先向土地與測量局確認。第三，部分律師行和代理的網頁至今仍引用 2013 年憲報上較低的舊數字。那不是現行的法定門檻，引用它的網頁，其他內容多半也已過時。
        </p>
        <p>
          坊間還流傳一種說法，稱 S-MM2H 參與者買房後須滿五年才能出售。這在《土地法》和 MTCP 指南里都找不到，所以本指南既不肯定也不否定；到出售時再核實，並留意產業盈利稅會在出售時另行適用。
        </p>
        <p>
          <em>
            以上三點實務說明，{propAttr}。門檻數字與可購買的房產類別，則見於該法令及 MTCP 指南。
          </em>
        </p>
      </Section>

      <Section title="S-MM2H 居住要求：每年在砂拉越住滿 30 天">
        <p>
          S-MM2H 是砂拉越的計劃，它的居住要求是：{s.minStayPerYear}這些天數必須是在
          <em>砂拉越</em>度過的 —— 待在吉隆坡的時間不算數。如果你想拿馬來西亞居留權的理由在半島，那麼無論它的數字看起來多誘人，這都是選錯了計劃。
        </p>
        <p>
          工作許可也指向同一個方向。S-MM2H 允許在教育、銀行與證券、製造業或醫療領域兼職，每週最多 {T.partTimeHoursPerWeek} 小時，每一份都須經州秘書轄下的委員會批准；也允許你在實收資本不低於 {jvCapital} 的合資企業中持有最多 {T.jvMaxSharePercent}% 的少數股權。這比聯邦白銀級或黃金級所允許的要多，而全部都在砂拉越。
        </p>
      </Section>

      <Section title="砂拉越 MM2H 與聯邦 MM2H 怎麼選">
        <p>
          這是兩個政府各自運作、恰好同名的兩個計劃，持有其中一個，對你在另一個計劃下的處境說明不了什麼。單看數字，砂拉越要求的少得多：{fd} 存款、無須買房；相比之下，
          <Link href={href("/visas/mm2h/")}>聯邦 MM2H 白銀級</Link>
          要 {money(silver.fixedDeposit!)} 的存款，外加強制購買 {money(silver.propertyPurchaseMin!)} 的房產 —— 這還沒算州政府對外國買家另設的門檻，在吉隆坡和雪蘭莪還要更高。
        </p>
        <p>
          它在別的方面要求更多。砂拉越審核收入或存款，聯邦 MM2H 則沒有公佈任何收入數字。最低年齡是 {s.minAge} 歲，聯邦是 {silver.minAge} 歲。它需要一位砂拉越擔保人，準證是 {firstTerm}加 {firstTerm}，之後要重新申請。
        </p>
        <p>
          先看地理，再看成本。想住在砂拉越，州的計劃是更便宜也更靈活的路；想住在半島，它就不是同一樣東西的便宜版。完整的並排對比見
          <Link href={href("/insights/comparisons/federal-mm2h-vs-sarawak-mm2h/")}>
            聯邦 MM2H 與砂拉越 MM2H 對比
          </Link>
          。
        </p>
      </Section>
    </>
  ),
};

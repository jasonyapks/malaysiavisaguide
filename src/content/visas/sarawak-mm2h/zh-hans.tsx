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

// 所有数字都从 programmes.ts 读取：能放进 Programme 字段的取自 smm2h 记录，
// MTCP 指南在此之外公布的取自 SMM2H_TERMS。这里没有手打的数字。
const s = localiseProgramme(getProgramme("smm2h")!, "zh-hans");
const silver = getProgramme("mm2h-silver")!;
const T = SMM2H_TERMS;

const fd = money(s.fixedDeposit!);
const income = moneyPer(s.incomeRequirement!, "zh-hans");
const incomeDep = moneyPer(T.incomeWithDependant, "zh-hans");
const savings = money(T.savings);
const savingsDep = money(T.savingsWithDependant);
const fdFloor = money(T.fdMinimumBalance);
const term = years(s.tenureYears, "zh-hans");
const firstYears = s.governmentExtras!.defaultTermYears!;
const firstTerm = years(firstYears, "zh-hans");
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
// "每年在砂拉越累计 30 天" — the stay rule without its "main applicant only" tail.
const stay = s.minStayPerYear!.split("，")[0];
const propAttr = `此说法来自 MYPVIP 的实务操作，${reviewDate(SARAWAK_PROPERTY_PRACTICE_ATTRIBUTION.asAt, "zh-hans")}`;

/** 保证金对应的国籍名称是文字，留在各语言的文案里；金额在 SMM2H_TERMS。 */
const BOND_LABELS: Record<(typeof T.securityBonds)[number]["slug"], string> = {
  singapore: "新加坡",
  thailand: "泰国",
  indonesia: "印度尼西亚",
  "jp-kr-hk-mo": "日本、韩国、香港与澳门",
  "cn-au-eu-tw-other": "中国、澳洲、欧洲、台湾，以及未列出的国家",
  "us-ca": "美国与加拿大",
};

/** Simplified Chinese S-MM2H guide. SOURCE for zh-hant. */
export const copy: GuideCopy = {
  meta: {
    title: "砂拉越第二家园（S-MM2H）2026：申请条件与费用",
    description: `砂拉越有自己的一套 MM2H，规则也自成一格：${fd} 定期存款、${income} 收入或 ${savings} 存款、${term}期、${stay}，而且不强制买房。`,
  },

  title: "砂拉越 MM2H（S-MM2H）",

  answer: `砂拉越自行运作一套 MM2H，即砂拉越第二家园，与联邦的计划各自独立。它需要在砂拉越的银行存入 ${fd} 定期存款，并且要么有${income}的退休金或海外收入，要么有 ${savings} 的存款。准证为期 ${term}，须${stay}，而且 —— 与联邦 MM2H 不同 —— 不要求你买房。`,

  suits: {
    yes: [
      "你是真的想住在砂拉越 —— 居住天数要求算的是待在砂拉越的时间",
      "你不想被迫在马来西亚买房",
      `你的资金是令吉；这里的存款是 ${fd}，不是一笔美元`,
      `你想要 ${term}的期限，而总投入只是联邦 MM2H 的一小部分`,
      "你的财力在存款而不在月收入 —— S-MM2H 两者择一即可",
    ],
    no: [
      "你想住在吉隆坡或槟城 —— 这是一个砂拉越的计划",
      `你未满 ${s.minAge} 岁，因此不符合资格`,
      `你没办法做到${stay}`,
      `你需要全职工作 —— S-MM2H 每周最多允许 ${T.partTimeHoursPerWeek} 小时，且限于四个获批行业`,
      "你想自己递交申请 —— 必须由砂拉越的担保人或持牌代理代为办理",
    ],
  },

  faq: [
    {
      q: "2026 年砂拉越第二家园（S-MM2H）的申请条件是什么？",
      a: `主申请人须年满 ${s.minAge} 岁，并持有与马来西亚有邦交国家的国籍；以色列和朝鲜除外。你要在砂拉越的银行存入 ${fd} 定期存款，并证明${income}的退休金或海外收入（带家属为${incomeDep}），或 ${savings} 的存款（带家属为 ${savingsDep}），以最近 ${T.evidenceMonths} 个月的记录为准。申请必须由一位住在砂拉越的担保人或一家砂拉越持牌代理担保并递交。递交时护照须有至少 ${T.passportMinValidityMonths} 个月的有效期，良民证须在 ${T.goodConductMaxAgeMonths} 个月以内，体检则须在砂拉越完成。`,
    },
    {
      q: "S-MM2H 和联邦 MM2H 有什么不同？",
      a: `有四点关键差别。存款是 ${fd}，而不是一笔美元金额。买房是可选的，而不是强制的。最低年龄是 ${s.minAge} 岁，而不是 ${silver.minAge} 岁。而且它是砂拉越的计划，居住天数算的是砂拉越，由州政府部门而非 MOTAC 管理。`,
    },
    {
      q: "申请 S-MM2H 需要多少收入？",
      a: `个人${income}；若纳入家属，则为${incomeDep} —— 以退休金证明信加 ${T.evidenceMonths} 个月的退休金流水，或在职证明作为佐证。此外也可以用存款来符合资格：个人 ${savings}，带家属则为 ${savingsDep}，以 ${T.evidenceMonths} 个月的银行对账单佐证。`,
    },
    {
      q: "办 S-MM2H 总共要花多少钱？",
      a: `州政府收取一笔 ${processing} 的手续费，一次性、不退还，缴清之前不会开始处理。如果由持牌代理替你递交，代理费由政府固定：主申请人 ${agentPrincipal}，每名家属 ${agentDep}，均已含 8% 销售与服务税。你的担保人须签署一份 ${bondLow} 至 ${bondHigh} 的保证金，按国籍而定。这里没有参与费。${fd} 的定期存款不算开销 —— 钱始终是你的 —— 但持有准证期间，这笔资金不能随意动用。`,
    },
    {
      q: "准证有效期多长？",
      a: `${term}，以 ${firstYears}+${s.tenureYears - firstYears} 的方式签发。满 ${term}之后不能再续，必须在到期前 ${T.freshApplicationMonthsBeforeExpiry} 个月重新递交一份全新的申请。`,
    },
    {
      q: "定期存款可以取出来吗？",
      a: `在计划中满 ${years(T.fdWithdrawalAfterYears, "zh-hans")}后，最多可提取 ${T.fdWithdrawalMaxPercent}%，用于在砂拉越购置住宅、购车、医疗支出，或子女教育。账户余额任何时候都不得低于 ${fdFloor} —— 这正是提取上限被定在一半的原因。`,
    },
    {
      q: "S-MM2H 一定要买房吗？",
      a: `不用。购置是可选的。如果你确实要买，古晋省的门槛是 ${kuching}，其他省份是 ${otherDiv}，依据 1998 年《土地法（修订）（第 2 号）令》。`,
    },
    {
      q: "持砂拉越第二家园可以住在吉隆坡吗？",
      a: "可以去，但如果你打算以吉隆坡为家，这就是选错了计划。居住要求算的是在砂拉越的天数，不是在马来西亚的天数，所以在吉隆坡住上几个月也一天都不算。工作许可、存放定期存款的银行、买房门槛，也全都是砂拉越的。若你的生活重心在半岛，为此而设的是联邦 MM2H。",
    },
    {
      q: "家人可以一起申请 S-MM2H 吗？",
      a: `可以。配偶、父母，以及 ${T.childMaxAge} 岁及以下的子女都可以纳入；身心障碍的子女不设年龄上限。纳入家属后，收入门槛提高到${incomeDep}，或存款门槛提高到 ${savingsDep}。每一名家属不论年龄都须购买本地医疗保险，主申请人未满 ${T.principalInsuranceBelowAge} 岁也须购买。如果由代理递交，每名家属另加 ${agentDep} 代理费。`,
    },
    {
      q: "持 S-MM2H 可以工作吗？",
      a: `只能兼职，而且只限获批行业：教育、银行与证券、制造业、医疗。工时上限为每周 ${T.partTimeHoursPerWeek} 小时，每一份申请都须经 MTCP 递交至州秘书辖下的审批委员会。你也可以与本地伙伴合资经营，以少数股东身份持有最多 ${T.jvMaxSharePercent}% 股权，实收资本不低于 ${jvCapital}。全职受雇则不获允许。`,
    },
    {
      q: "我需要担保人吗？",
      a: `需要，而且绕不过去。每一位申请人都必须由一位来自砂拉越、目前也住在砂拉越的担保人，或一家在砂拉越注册的 SMM2H 持牌代理来担保。担保人须签署保证金，金额按国籍而定，从新加坡的 ${bond("singapore")} 到美国与加拿大的 ${bond("us-ca")} 不等，完整的表列在上方费用一节。申请由该担保人或代理透过州政府的 MOAS 系统递交，你无法自行提交。`,
    },
    {
      q: "每年必须在砂拉越待多少天？",
      a: `${s.minStayPerYear} 在马来西亚其他地方度过的日子不计算在内。`,
    },
    {
      q: "在砂拉越买房，可以和马来西亚籍配偶联名登记吗？",
      a: `以外国买家身份，不行。实务上，砂拉越土地与测量局（Land & Survey Sarawak）不会登记一份转入外国人与马来西亚人联名的过户 —— 不论对方是配偶、子女还是其他人 —— 而且是在登记那一步才拒绝，也就是买卖合约已经签署并盖印之后。产权请只登记在你一个人名下。${propAttr}；《土地法》和 MTCP 指南都没有用这样的字眼写明。`,
    },
  ],

  cta: {
    text: "把 S-MM2H 和联邦各等级并排比一比。",
    label: "打开对比表",
    href: "/compare/",
  },

  sections: (href) => (
    <>
      <Section title="S-MM2H 申请条件：两条符合资格的路径">
        <p>
          S-MM2H 接受收入流或一笔存款二选一，这在同类计划里并不常见，也让一些被联邦计划挡在门外的人够得着：
        </p>
        <ul>
          <li>
            <strong>收入：</strong>个人{income}，带家属则为{incomeDep}，来源可以是退休金或海外受雇收入。
          </li>
          <li>
            <strong>或者存款：</strong>个人 {savings}，带家属则为 {savingsDep}，以 {T.evidenceMonths} 个月的对账单佐证。
          </li>
        </ul>
        <p>
          在两者之外，还必须在砂拉越当地的银行存入 {fd} 定期存款，其中 {fdFloor} 在你持有准证期间必须一直留在账户里。另需向州政府部门缴付一次性手续费 {processing}；该费用不予退还，未缴清之前不会开始处理。
        </p>
        <p>
          其余的门槛与钱无关，而是资格。主申请人须年满 {s.minAge} 岁。凡与马来西亚有邦交国家的公民都可申请，以色列和朝鲜除外。递交申请时，护照须有至少 {T.passportMinValidityMonths} 个月的有效期；良民证须在 {T.goodConductMaxAgeMonths} 个月以内开具。每一名家属都必须购买本地医疗保险，主申请人未满 {T.principalInsuranceBelowAge} 岁也一样。
        </p>
        <p>
          可纳入的家属是配偶、父母，以及 {T.childMaxAge} 岁及以下的子女；身心障碍的子女不设年龄上限。
        </p>
      </Section>

      <Section title="S-MM2H 费用一览：政府收费与开支">
        <p>
          S-MM2H 的收费项目比联邦 MM2H 少，而且完全没有参与费。哪些要付、付给谁、替谁付：
        </p>
        <DataTable
          caption="S-MM2H 政府及州政府收费"
          idPrefix="smm2h-fee"
          locale="zh-hans"
          head={["", "主申请人", "每名家属"]}
          rows={[
            {
              label: "手续费（MTCP）",
              cells: [
                { value: processing, note: 1 },
                { value: s.processingFee!.dependant === 0 ? "无" : money({ amount: s.processingFee!.dependant, currency: "MYR" }) },
              ],
            },
            {
              label: "代理费（含 8% SST）",
              cells: [{ value: agentPrincipal, note: 2 }, { value: agentDep }],
            },
            {
              label: "保证金",
              cells: [{ value: `${bondLow}–${bondHigh}`, note: 3 }, { value: "未公布" }],
            },
            {
              label: "参与费",
              cells: [{ value: "无" }, { value: "无" }],
            },
            {
              label: `第 ${firstYears} 年延期`,
              cells: [{ value: "未公布收费", note: 4 }, { value: "未公布收费" }],
            },
          ]}
          notes={[
            "一次性收取，不予退还。须在申请开始处理之前缴付给州政府部门。",
            "由政府固定，不由代理机构订定，所以报价高于这个数字的，是报错了，而不是比较贵。适用于由 SMM2H 持牌代理递交的申请。何时缴付并未公布。",
            "按国籍而定，由担保人或代理签署。完整的表列在下方。",
            `准证分两个 ${firstTerm}期签发。从第一期转入第二期，并没有公布任何收费。`,
          ]}
        />
        <p>
          保证金是唯一一个看你是谁、而不是看你买什么的数字。它由担保人或代理替你签署，金额按你的国籍而定：
        </p>
        <ul>
          {T.securityBonds.map((b) => (
            <li key={b.slug}>
              <strong>{BOND_LABELS[b.slug]}</strong> —— {money(b.bond)}
            </li>
          ))}
        </ul>
        <p>
          有两笔开销不在任何收费表上。体检在砂拉越的诊所做，本地医疗保险向保险公司购买；两者都按市场定价，都没有政府公布的数字。另外请预留至少一趟去砂拉越做体检的行程，因为在原居地做的体检报告不会被接受。
        </p>
        <p>
          接下来是资金。{fd} 的定期存款不是费用 —— 它始终是你的 —— 但在你持有准证期间都被锁定。满 {years(T.fdWithdrawalAfterYears, "zh-hans")}后，最多可提取 {T.fdWithdrawalMaxPercent}%，用于在砂拉越购屋、购车、医疗或子女教育，余额任何时候都不得低于 {fdFloor}。由于买房是可选的，你不像申请联邦 MM2H 那样，在获批之前还得备好第二笔、而且更大的资金。
        </p>
        <p>
          所以按第一期的预算算，一名单身申请人若透过代理递交，收费部分是 {processing} 加上 {agentPrincipal}，再加保证金、体检和保险，存款则另外备好放在一旁。每多一名家属，代理费加 {agentDep}，外加其本人的保险。
          <Link href={href("/tools/cost-calculator/")}>费用计算器</Link>
          可以按你家庭的情况把这些数字算一遍。
        </p>
      </Section>

      <Section title="如何申请砂拉越第二家园（S-MM2H）">
        <p>
          整个申请从头到尾都是州政府的流程，由 MTCP 负责，而不是 MOTAC 或移民局的联邦柜台。以下是 MTCP 指南所列的申请内容 —— 指南并没有把每一步都对上日期，所以后面几步的先后只作参考：
        </p>
        <ol>
          <li>
            <strong>找担保人或持牌代理。</strong>可以是一位来自砂拉越、目前也住在砂拉越的担保人，或一家在砂拉越持牌并注册的 SMM2H 代理。没有自助申请的途径，所以这是第一步。
          </li>
          <li>
            <strong>准备文件。</strong>护照须有至少 {T.passportMinValidityMonths} 个月的有效期，良民证须在 {T.goodConductMaxAgeMonths} 个月以内，另加你所选财力路径的 {T.evidenceMonths} 个月证明 —— 退休金证明信与退休金流水、在职证明，或存款路径所需的银行对账单。
          </li>
          <li>
            <strong>透过 MOAS 递交。</strong>担保人或代理在州政府的 MOAS 系统上递交申请，并按你的国籍签署保证金。
          </li>
          <li>
            <strong>缴付手续费。</strong>向州政府部门缴付 {processing}。缴清之前，什么都不会动。
          </li>
          <li>
            <strong>定期存款、体检与保险。</strong>{fd} 定期存款存入砂拉越的指定银行。体检在砂拉越进行，并由政府医生背书；所有须投保的人都要买好本地医疗保险。
          </li>
          <li>
            <strong>签发准证。</strong>第一期为 {firstTerm}，之后再延期 {firstTerm}。
          </li>
        </ol>
        <p>
          最常耽误时间的是体检。在原居地做的报告会被退回重做，之后才会发出准证，所以去砂拉越这一趟免不了，最好及早安排。
        </p>
        <p>
          至于要多久，本指南不给数字。MTCP 指南没有公布处理时间，没有依据的数字只是猜测。请向担保人或代理问清楚他们目前的经验，并把任何答复当作估计，而非承诺。唯一确定的日期在最后：满 {term}后准证不能再续，必须在到期前 {T.freshApplicationMonthsBeforeExpiry} 个月重新递交全新的申请。
        </p>
      </Section>

      <Section title="S-MM2H 买房规定：外国人在砂拉越可以买什么">
        <p>
          在 S-MM2H 下，买房是可选的。定期存款才是取得资格的途径，不买任何东西也能获批。但不少参与者还是会买，而适用的规则来自砂拉越自己的土地法，而不是这个计划。砂拉越实行《砂拉越土地法》，与半岛适用的《国家土地法》分开，所以吉隆坡、槟城或柔佛的门槛数字在这里一概不适用。
        </p>
        <p>
          门槛按每一处房产、按省份而定，依据 1998 年《土地法（修订）（第 2 号）令》，MTCP 指南引用的也是同样的数字：
        </p>
        <ul>
          <li>
            <strong>古晋省：</strong>{kuching}
          </li>
          <li>
            <strong>其他所有省份：</strong>{otherDiv}
          </li>
        </ul>
        <p>
          看的是市值，所以把成交价报低，并不能让一处房产落到门槛之内。在门槛之上，外国人可以买公寓、共管公寓等高楼住宅，也可以买有地住宅，以及位于宪报公布的特别发展区内的房产。空地原则上不能买，例外情况很窄。
        </p>
        <p>
          有三点依据的是实务经验，而不是法令或指南的条文。第一，产权只登记在你一个人名下：与马来西亚人联名的过户 —— 包括配偶 —— 会在登记时被砂拉越土地与测量局拒绝，而那时买卖合约早已签署盖印。第二，外国人可持有的房产数量，目前没有公布任何上限；每一宗只需各自过门槛，但要买第二、第三处之前，最好先向土地与测量局确认。第三，部分律师行和代理的网页至今仍引用 2013 年宪报上较低的旧数字。那不是现行的法定门槛，引用它的网页，其他内容多半也已过时。
        </p>
        <p>
          坊间还流传一种说法，称 S-MM2H 参与者买房后须满五年才能出售。这在《土地法》和 MTCP 指南里都找不到，所以本指南既不肯定也不否定；到出售时再核实，并留意产业盈利税会在出售时另行适用。
        </p>
        <p>
          <em>
            以上三点实务说明，{propAttr}。门槛数字与可购买的房产类别，则见于该法令及 MTCP 指南。
          </em>
        </p>
      </Section>

      <Section title="S-MM2H 居住要求：每年在砂拉越住满 30 天">
        <p>
          S-MM2H 是砂拉越的计划，它的居住要求是：{s.minStayPerYear}这些天数必须是在
          <em>砂拉越</em>度过的 —— 待在吉隆坡的时间不算数。如果你想拿马来西亚居留权的理由在半岛，那么无论它的数字看起来多诱人，这都是选错了计划。
        </p>
        <p>
          工作许可也指向同一个方向。S-MM2H 允许在教育、银行与证券、制造业或医疗领域兼职，每周最多 {T.partTimeHoursPerWeek} 小时，每一份都须经州秘书辖下的委员会批准；也允许你在实收资本不低于 {jvCapital} 的合资企业中持有最多 {T.jvMaxSharePercent}% 的少数股权。这比联邦白银级或黄金级所允许的要多，而全部都在砂拉越。
        </p>
      </Section>

      <Section title="砂拉越 MM2H 与联邦 MM2H 怎么选">
        <p>
          这是两个政府各自运作、恰好同名的两个计划，持有其中一个，对你在另一个计划下的处境说明不了什么。单看数字，砂拉越要求的少得多：{fd} 存款、无须买房；相比之下，
          <Link href={href("/visas/mm2h/")}>联邦 MM2H 白银级</Link>
          要 {money(silver.fixedDeposit!)} 的存款，外加强制购买 {money(silver.propertyPurchaseMin!)} 的房产 —— 这还没算州政府对外国买家另设的门槛，在吉隆坡和雪兰莪还要更高。
        </p>
        <p>
          它在别的方面要求更多。砂拉越审核收入或存款，联邦 MM2H 则没有公布任何收入数字。最低年龄是 {s.minAge} 岁，联邦是 {silver.minAge} 岁。它需要一位砂拉越担保人，准证是 {firstTerm}加 {firstTerm}，之后要重新申请。
        </p>
        <p>
          先看地理，再看成本。想住在砂拉越，州的计划是更便宜也更灵活的路；想住在半岛，它就不是同一样东西的便宜版。完整的并排对比见
          <Link href={href("/insights/comparisons/federal-mm2h-vs-sarawak-mm2h/")}>
            联邦 MM2H 与砂拉越 MM2H 对比
          </Link>
          。
        </p>
      </Section>
    </>
  ),
};

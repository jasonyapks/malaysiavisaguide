import type { CompareCopy } from "./types";

/**
 * Simplified Chinese compare copy. Traditional is generated from this file —
 * run `npm run i18n:hant`, never edit the zh-hant sibling.
 *
 * Every figure is a hole filled from `programmes.ts`, so a corrected fee moves
 * here and in English together. Nothing in this file states a number.
 */
export const copy: CompareCopy = {
  meta: {
    title: "马来西亚各签证计划并排对比",
    description:
      "所有长期居留计划与工作、留学准证，按真正决定取舍的数字并排对比 —— 定期存款、房产、年限、费用、最短居留与工作权。",
  },

  heading: "计划对比",

  intro:
    "马来西亚的长期居留计划以存款为门槛：你靠投入资金取得资格。工作与留学准证则以担保为门槛：由雇主或院校担保你，不存在存款要求。",

  longStay: {
    heading: "长期居留计划",
    note: "存款以该计划本身计价的货币列出。MM2H 以美元计价，PVIP 与 S-MM2H 以马币计价 —— 所以你换到的汇率本身就是成本的一部分。",
  },

  workStudy: {
    heading: "工作与留学准证",
    intro:
      "两者分开对比，是因为定期存款与薪资门槛并非同一类数字，放进同一张表会让人误以为它们是。",
    note: (f) => (
      <>
        表中的就业准证门槛为第三类（Category III）。第二类起于 {f.epCategoryII}
        ，第一类起于 {f.epCategoryI}。DE Rantau 的数字是科技类门槛；非科技类专业
        需达到 {f.deRantauNonTech}。
      </>
    ),
  },

  essay: {
    heading: "表格无法告诉你的事",
    items: [
      {
        title: "定期存款不是开销。",
        body: (f) => (
          <>
            那笔钱仍然是你的。费用才是真正离开你口袋的钱。以 MM2H 银级为例，这个
            差别是承诺投入 {f.mm2hSilverDeposit}，而实际支出{" "}
            {f.mm2hSilverSpend} —— 其中 {f.mm2hSilverParticipation} 为参与费、
            {f.mm2hSilverProcessing} 为处理费，另有政府订定的代理费{" "}
            {f.mm2hSilverAgency} —— 而强制购买的 {f.mm2hSilverProperty}{" "}
            房产，又是第三类支出。
          </>
        ),
      },
      {
        title: "代理费在 MM2H 是固定的，在 PVIP 不是。",
        body: (f) => (
          <>
            这与市场上惯常的说法正好相反。MM2H 的代理费由政府订定 —— 银级{" "}
            {f.mm2hSilverAgency}、金级 {f.mm2hGoldAgency}、白金级{" "}
            {f.mm2hPlatinumAgency}，均已含 8% 销售与服务税 —— 所以更高的报价是
            错的，而不是贵。PVIP 的代理费属商业定价，官方从未公布，也是本页唯一
            一个你必须自己拿到书面报价的数字。
          </>
        ),
      },
      {
        title: "房产最低价不等于你实际要付的价格。",
        body: (f) => (
          <>
            MM2H 的数字是全国最低标准。外国买家还必须达到房产所在州属自订的门槛
            ——{" "}
            {f.stateFloors.map((s, i) => (
              <span key={s.name}>
                {i > 0 && "、"}
                {s.name}为 {s.amount}
              </span>
            ))}
            —— 两者取其高者为准。银级的 {f.mm2hSilverProperty}{" "}
            是最容易被这一条卡住的数字。
          </>
        ),
      },
      {
        title: "工作权是级别问题，不是计划问题。",
        body: () => (
          <>
            PVIP 与 MM2H 白金级都具备工作权 —— 旅游部 2025 年 12
            月的指南将白金级的商业、投资与职业活动标注为<em>允许</em>。MM2H
            银级与金级则完全禁止，S-MM2H 属受限。所以「MM2H
            不让你工作」这句话，三个级别中只对其中两个成立；如果你打算在马来西亚
            谋生，上面那一行会把范围缩小到 PVIP 与白金级，而不是只剩 PVIP。
          </>
        ),
      },
    ],
  },

  quizCta: "不确定自己符合哪一种？用资格检测工具跑一次 →",

  sourcesNote: (lastReviewed) =>
    `以上每一个数字，都出自各计划指南页所引用的官方来源。最后复核于 ${lastReviewed}。`,
};

/**
 * Chinese alt text for images, keyed by the English alt it replaces.
 *
 * Keyed by the English string rather than by slot because an image reaches a
 * page from two registries (src/lib/images.ts and the R2 manifest) and the alt
 * is the one thing both carry. If the English alt is edited, the lookup misses
 * and the page falls back to English — add the new string here.
 *
 * Official names stay in English with a Chinese gloss.
 */
export const imageAlt: Record<string, string> = {
  "A Malaysia Visa Guide graphic: a navy notebook embossed with a gold compass rose, a brass compass, a stack of blank documents and reading glasses, under the heading Malaysia Visa Guide.":
    "Malaysia Visa Guide 主视觉图：一本压印金色罗盘图案的深蓝色笔记本、一只黄铜指南针、一叠空白文件和一副老花镜，上方标题为 Malaysia Visa Guide。",
  "Business professionals meeting in a high-rise office with a city skyline view.":
    "商务人士在高层办公室开会，窗外是城市天际线。",
  "A family with a young child enjoying a lush, green tree-lined path together.":
    "一家人带着年幼的孩子，走在绿树成荫的小路上。",
  "The Sarawak State Legislative Assembly and a river cruise boat on the Kuching waterfront.":
    "古晋河畔的砂拉越州立法议会大厦与一艘游河船。",
  "A laptop and backpack on a wooden table in a bright, plant-filled tropical café.":
    "明亮、绿植环绕的热带咖啡馆里，木桌上放着笔记本电脑和背包。",
  "A diverse team collaborating over a laptop in a bright modern office.":
    "明亮的现代办公室里，来自不同背景的团队成员围着一台笔记本电脑协作。",
  "A diverse group of students walking and laughing together.":
    "一群来自不同背景的学生边走边笑。",
  "A man works at a laptop on a high-rise balcony at dusk, tax forms and printed charts spread across the table, with the Petronas Towers and the Kuala Lumpur skyline behind him.":
    "黄昏时分，一名男子在高层公寓阳台上用笔记本电脑工作，桌上摊着报税表格和打印的图表，身后是国油双峰塔与吉隆坡天际线。",
  "Graphic reading Own every share. Fill one seat, beside a gold ring marked 100% your shareholding, with notes that a resident director is required and a sector licence applies to retail, F&B and regulated businesses only.":
    "图示文字为“持有全部股份，补上一个席位”，旁边的金色圆环标注“100% 由您持股”，并注明须委任一名居民董事，行业执照仅适用于零售、餐饮及受监管行业。",
  "Chart drawn to scale for one MM2H Silver applicant: the fees, about RM41,000, are a small square beside a USD 150,000 fixed deposit and a RM600,000 minimum property purchase.":
    "按比例绘制的图表，对象为一名 MM2H Silver（银卡）申请人：约 RM41,000 的费用只是一个小方块，旁边是 USD 150,000 的定期存款和 RM600,000 的最低购房金额。",
  "Timeline graphic titled Beyond the two-year limit: a DE Rantau Nomad Pass runs 3 to 12 months, renews once for a further 12 months, and under Budget 2027 may continue past year two, subject to eligibility criteria, length not yet announced.":
    "时间线图示，标题为“超过两年期限”：DE Rantau Nomad Pass（数字游民准证）为期 3 至 12 个月，可续签一次、再延 12 个月；根据 2027 年财政预算案，符合资格者可在第二年之后继续居留，期限尚未公布。",
  "Immigration Department officers and industry representatives in front of the Malaysia Premium Visa Programme (PVIP) banner at the MIHAS press conference":
    "MIHAS 新闻发布会上，移民局官员与业界代表在 Malaysia Premium Visa Programme（PVIP高级签证计划）横幅前合影",
  "Portugal Golden Visa Investment": "葡萄牙黄金签证投资",
  "MYPVIP webinar poster: Unlocking Malaysia's Business Opportunities, a practical guide for PVIP applicants. Sunday 1 November 2026, 8:00 PM (UTC+8). Topics: PVIP, more than a residency; set up your company; launch and grow your business. Speakers: Chee Mee Ho, host and PVIP consultant, and Datin Jiniy Seelan, managing partner of JS Partners Chartered Accountant.":
    "MYPVIP 线上讲座海报：Unlocking Malaysia's Business Opportunities（开启马来西亚商机），为 PVIP 申请人准备的实用指南。2026年11月1日（星期日）晚上 8:00（UTC+8）。议题：PVIP 不只是居留身份；设立公司；开展并壮大业务。主讲人：主持人兼 PVIP 顾问 Chee Mee Ho，以及 JS Partners Chartered Accountant 执行合伙人 Datin Jiniy Seelan。",
};

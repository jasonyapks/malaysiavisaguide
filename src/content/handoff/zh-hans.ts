import type { HandoffCopy } from "./types";

/** SOURCE for zh-hant — see scripts/gen-zh-hant.mjs. */
export const copy: HandoffCopy = {
  eyebrow: "想交给专人办理？",
  heading: "MYPVIP 是本站出版人经营的代理机构",
  bodyHandles:
    "MYPVIP 是持牌代理，办理 PVIP 与 MM2H 申请。是否委托完全由你决定 —— 本页的内容，就是为了让你先自己判断。",
  bodyOther:
    "MYPVIP 是持牌的 PVIP 与 MM2H 代理，未必办理这一类准证，请先询问。是否委托完全由你决定。",
  confirmHeading: "请持牌代理帮你确认",
  confirmBody:
    "这个结果只是参考，不是定论。本站出版人经营的 MYPVIP 可以对照你的文件再核实一遍。传过去的只有计划名称，你填写的答案一概不会带上。",
  consult: "预约免费咨询",
  whatsapp: "WhatsApp 联系 MYPVIP",
  disclosure: "两个按钮都会离开本站，前往 MYPVIP —— 即本站出版人 Jason Yap 经营的代理机构。",
  whatsappText: (programme) =>
    programme
      ? `你好 MYPVIP，我是从 Malaysia Visa Guide 看到你们的，想咨询 ${programme}。`
      : "你好 MYPVIP，我是从 Malaysia Visa Guide 看到你们的，想咨询一下。",
};

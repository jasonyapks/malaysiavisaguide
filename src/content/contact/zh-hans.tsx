import type { ContactCopy } from "./types";

/**
 * Simplified Chinese contact copy. Traditional is generated — run
 * `npm run i18n:hant`, never edit the zh-hant sibling.
 */
export const copy: ContactCopy = {
  meta: {
    title: "联系我们",
    description:
      "就本站涵盖的任何一项计划提问，或指出需要更正的数字。",
  },

  heading: "联系我们",
  lead: "对某一项计划有疑问，或发现某个数字似乎已经过时？请从这里发给我们。回复你的，就是研究并复核这些指南的同一个人。",

  notConnected: {
    before: "查询表单尚未接通。在此期间，请发送电邮至",
    after: "，回复你的，就是撰写这些指南的同一个人。",
  },

  fields: {
    name: "你的姓名",
    email: "电邮地址",
    programme: "这个问题与哪一项计划有关？",
    programmeAny: "还不确定／一般咨询",
    message: "你的问题",
  },

  submit: "发送查询",
  submitting: "发送中…",
  success: "谢谢 —— 你的讯息已在发送途中。我们会回复到你填写的电邮地址。",
  errorGeneric: "出了点问题，请稍后再试一次。",
  errorNetwork: (email) => `无法发送。请直接发电邮至 ${email}。`,
  privacyNote:
    "你提供的资料仅用于回复这次查询。本站是独立指南 —— 发送问题并不等于开始办理签证申请。",
};

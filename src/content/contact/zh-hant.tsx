// GENERATED FILE — do not edit.
// Written by scripts/gen-zh-hant.mjs from the zh-hans source beside it.
// Edit that file and run `npm run i18n:hant`; edits here are overwritten.
import type { ContactCopy } from "./types";

/**
 * Simplified Chinese contact copy. Traditional is generated — run
 * `npm run i18n:hant`, never edit the zh-hant sibling.
 */
export const copy: ContactCopy = {
  meta: {
    title: "聯繫我們",
    description:
      "就本站涵蓋的任何一項計劃提問，或指出需要更正的數字。",
  },

  heading: "聯繫我們",
  lead: "對某一項計劃有疑問，或發現某個數字似乎已經過時？請從這裡發給我們。回覆你的，就是研究並複核這些指南的同一個人。",

  notConnected: {
    before: "查詢表單尚未接通。在此期間，請發送電郵至",
    after: "，回覆你的，就是撰寫這些指南的同一個人。",
  },

  fields: {
    name: "你的姓名",
    email: "電郵地址",
    programme: "這個問題與哪一項計劃有關？",
    programmeAny: "還不確定／一般諮詢",
    message: "你的問題",
  },

  submit: "發送查詢",
  submitting: "發送中…",
  success: "謝謝 —— 你的訊息已在發送途中。我們會回覆到你填寫的電郵地址。",
  errorGeneric: "出了點問題，請稍後再試一次。",
  errorNetwork: (email) => `無法發送。請直接發電郵至 ${email}。`,
  privacyNote:
    "你提供的資料僅用於回覆這次查詢。本站是獨立指南 —— 發送問題並不等於開始辦理簽證申請。",
};

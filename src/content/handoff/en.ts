import type { HandoffCopy } from "./types";

export const copy: HandoffCopy = {
  eyebrow: "Need this handled?",
  heading: "MYPVIP is the publisher's agency",
  bodyHandles:
    "MYPVIP files PVIP and MM2H applications as a licensed agent. Using it is optional. Everything on this page is here so you can decide for yourself first.",
  bodyOther:
    "MYPVIP is a licensed PVIP and MM2H agent. It may not handle this pass, so ask before assuming. Using it is optional.",
  confirmHeading: "Have a licensed agent confirm this",
  confirmBody:
    "This result is a guide, not a decision. MYPVIP, the publisher's agency, can check it against your documents. Only the programme name is passed along; none of your answers are.",
  consult: "Book a free consultation",
  whatsapp: "WhatsApp MYPVIP",
  disclosure:
    "Both buttons leave this site for MYPVIP, the agency run by Jason Yap, who publishes this guide.",
  whatsappText: (programme) =>
    programme
      ? `Hi MYPVIP, I found you through Malaysia Visa Guide and have a question about ${programme}.`
      : "Hi MYPVIP, I found you through Malaysia Visa Guide and have a question.",
};

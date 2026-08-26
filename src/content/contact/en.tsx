import type { ContactCopy } from "./types";

/** English contact copy — moved here from the page and the form component. */
export const copy: ContactCopy = {
  meta: {
    title: "Contact",
    description:
      "Ask a question about any of the programmes covered here, or flag a figure that needs correcting.",
  },

  heading: "Contact",
  lead: "A question about any of the programmes, or a figure that looks out of date? Send it here. Replies come from the same person who researches and reviews these guides.",

  notConnected: {
    before: "The enquiry form isn't connected yet. In the meantime, email",
    after:
      "and you'll get a reply from the same person who writes these guides.",
  },

  fields: {
    name: "Your name",
    email: "Email",
    programme: "Which programme is this about?",
    programmeAny: "Not sure yet / general question",
    message: "Your question",
  },

  submit: "Send enquiry",
  submitting: "Sending…",
  success:
    "Thanks — your message is on its way. You'll hear back at the email you gave.",
  errorGeneric: "Something went wrong. Please try again in a moment.",
  errorNetwork: (email) =>
    `Couldn't send that. Please email ${email} directly instead.`,
  privacyNote:
    "Your details are used only to reply to this enquiry. This is an independent guide — sending a question does not start a visa application.",
};

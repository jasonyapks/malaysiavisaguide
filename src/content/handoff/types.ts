export type HandoffCopy = {
  /** Guide module. */
  eyebrow: string;
  heading: string;
  /** For a programme MYPVIP files (PVIP, MM2H). */
  bodyHandles: string;
  /** For a pass it does not necessarily file. */
  bodyOther: string;
  /** Result screens of the two tools. */
  confirmHeading: string;
  confirmBody: string;
  consult: string;
  whatsapp: string;
  disclosure: string;
  /** Prefilled WhatsApp message. Programme name only — never an answer the
   *  reader gave the tool. */
  whatsappText: (programme?: string) => string;
};

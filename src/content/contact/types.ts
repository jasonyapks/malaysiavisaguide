export type ContactCopy = {
  meta: { title: string; description: string };
  heading: string;
  lead: string;

  /** Shown until NEXT_PUBLIC_WEB3FORMS_KEY is set. Split around the address. */
  notConnected: { before: string; after: string };

  fields: {
    name: string;
    email: string;
    programme: string;
    /** The empty option at the top of the programme select. */
    programmeAny: string;
    message: string;
  };

  submit: string;
  submitting: string;
  success: string;
  errorGeneric: string;
  errorNetwork: (email: string) => string;
  privacyNote: string;
};

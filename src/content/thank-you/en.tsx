import Link from "next/link";
import type { ThankYouCopy } from "./types";

export const copy: ThankYouCopy = {
  meta: {
    title: "Message sent",
    description:
      "Your enquiry has been sent. What happens next, and what to read while you wait.",
  },

  title: "Message sent",

  standfirst: (
    <>
      Your enquiry is on its way, and you&apos;ll hear back at the email address
      you gave. Replies come from the same person who researches and reviews
      these guides &mdash; not a call centre, and not an auto-responder.
    </>
  ),

  body: (href) => (
    <>
      <p>
        One thing worth knowing while you wait: sending that message did not
        start a visa application, and it does not commit you to anything. This
        is an independent guide. If the answer turns out to be that you are
        better off applying yourself, or under a cheaper programme, that is what
        you will be told &mdash; the{" "}
        <Link href={href("/editorial-policy/")}>editorial policy</Link> and the{" "}
        <Link href={href("/about/")}>disclosed commercial relationship</Link>{" "}
        both set out why.
      </p>
      <p>
        If your question was about a specific programme, the guide for it is
        probably the fastest answer you will get today:{" "}
        <Link href={href("/visas/pvip/")}>PVIP</Link>,{" "}
        <Link href={href("/visas/mm2h/")}>MM2H</Link>,{" "}
        <Link href={href("/visas/sarawak-mm2h/")}>Sarawak MM2H</Link>, or the{" "}
        <Link href={href("/compare/")}>side-by-side comparison</Link> if you are
        still deciding between them.
      </p>
      <p>
        Nothing arrived? Check your spam folder before assuming the reply is
        lost &mdash; and if it is not there,{" "}
        <Link href={href("/contact/")}>send it again</Link>.
      </p>
    </>
  ),

  cta: {
    text: "Still weighing up which programme fits?",
    label: "Run the eligibility checker",
    tail: "— it reads the same verified data as every guide here, and it costs nothing.",
  },
};

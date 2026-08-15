import { GuideLayout } from "@/components/GuideLayout";
import { TierTable } from "@/components/TierTable";
import { getProgramme, type ProgrammeSlug } from "@/lib/data/programmes";
import { localiseProgramme } from "@/lib/programme-locale";
import { localePath, type Locale } from "@/lib/i18n";
import type { SiteImage } from "@/lib/images";
import type { GuideCopy } from "./types";

/**
 * One programme guide, in one language.
 *
 * The six guides differ only in which programme record they read, which hero
 * they use and which copy module they load — so this wraps GuideLayout once
 * rather than each page repeating the wiring. The programme goes through
 * `localiseProgramme` on the way in, which swaps its prose fields for the
 * locale's and leaves every figure exactly as programmes.ts states it.
 */
export function VisaGuide({
  slug,
  locale,
  copy,
  hero,
  tierSlugs,
}: {
  slug: ProgrammeSlug;
  locale: Locale;
  copy: GuideCopy;
  hero?: SiteImage;
  /**
   * Show a tier table instead of the key-facts card. MM2H is one programme
   * with three tiers, so a single card cannot represent it. Passing the slugs
   * rather than a built element keeps `localiseProgramme` applied to every
   * tier — hand in a ready-made <TierTable> and its rows quietly stay English.
   */
  tierSlugs?: ProgrammeSlug[];
}) {
  const programme = localiseProgramme(getProgramme(slug)!, locale);
  const facts = tierSlugs ? (
    <TierTable
      tiers={tierSlugs.map((s) => localiseProgramme(getProgramme(s)!, locale))}
      caption={copy.tierCaption}
      locale={locale}
    />
  ) : undefined;
  const href = (path: string) => localePath(path, locale);

  return (
    <GuideLayout
      locale={locale}
      programme={programme}
      hero={hero}
      title={copy.title}
      answer={copy.answer}
      suits={copy.suits}
      faq={copy.faq}
      cta={{ ...copy.cta, href: href(copy.cta.href) }}
      facts={facts}
    >
      {copy.sections(href)}
    </GuideLayout>
  );
}

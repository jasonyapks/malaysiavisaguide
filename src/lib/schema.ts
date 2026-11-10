import { localeUrl, type Locale } from "./i18n";
import { images } from "./images";
import { site } from "./site";

/**
 * The JSON-LD identities, in one place.
 *
 * There is one Person and one Organization on this site. Each is described in
 * full exactly once — the Person on the author page, the Organization in the
 * root layout — and everything else points at it by `@id`. A page that restates
 * the author inline gives a crawler a second, thinner Jason Yap to reconcile.
 */

/** How an Article, NewsArticle or guide names its author and reviewer. */
export function authorRef(locale: Locale) {
  return {
    "@type": "Person",
    "@id": site.author.id,
    name: site.author.name,
    url: localeUrl(site.author.path, locale),
  };
}

/** How anything names the publisher. */
export const publisherRef = {
  "@type": "Organization",
  "@id": site.organizationId,
  name: site.name,
  url: site.url,
};

/**
 * The full Person node. Emitted on the author page and on /about/.
 *
 * Deliberately absent, because nobody has confirmed them yet (audit inputs I2,
 * I3): `alumniOf`, the MM2HCA council role, and any profile beyond LinkedIn.
 * Add them here when Jason supplies them — never from memory.
 */
export function personSchema(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": site.author.id,
    name: site.author.name,
    alternateName: site.author.alternateName,
    url: localeUrl(site.author.path, locale),
    image: `${site.url}${images.about.src}`,
    jobTitle: "Managing Director, MYPVIP",
    description,
    worksFor: [
      {
        "@type": "Organization",
        name: "MYPVIP (MY PR Program Sdn Bhd)",
        url: "https://mypvip.com",
      },
      {
        "@type": "Organization",
        name: "MY Premium MM2H (My Premium (MM2H) Sdn Bhd)",
      },
    ],
    memberOf: {
      "@type": "OrganizationRole",
      roleName: "President",
      memberOf: {
        "@type": "Organization",
        name: "Pertubuhan Perunding Program Visa Premium Malaysia (MPVIPCA)",
      },
    },
    knowsLanguage: ["Malay", "English", "Mandarin Chinese"],
    knowsAbout: [
      "Premium Visa Programme",
      "Malaysia My Second Home",
      "Malaysian long-stay visas",
    ],
    sameAs: site.author.sameAs,
  };
}

import { programmes } from "@/lib/data/programmes";
import { guideHref } from "@/lib/site";
import updatedDates from "@/lib/data/updated.json";

/**
 * When a page's content last significantly changed — for `<lastmod>` in the
 * sitemap and `dateModified` in the Article schema.
 *
 * ## Not the build time, and not the reviewed date either
 *
 * Three dates get confused here, and they answer three different questions:
 *
 *   `lastVerified`    when someone last opened the official document and
 *                     checked the figures against it. This is what the byline
 *                     shows the reader, and it moves only after a real review.
 *   `changedOn`       when the programme's terms themselves changed.
 *   this function     when the page a reader loads last said something
 *                     different from what it said before.
 *
 * The site used to publish the first as `dateModified` and the build clock as
 * `<lastmod>`, which got both wrong in opposite directions. MM2H declared
 * `dateModified: 2026-07-28` while carrying an update notice dated 3 August and
 * a withdrawal item restated on 23 August — understating a page that had
 * changed twice since. Meanwhile every static page's `<lastmod>` moved on every
 * deploy, overstating fourteen pages that had not changed at all.
 *
 * ## Why the two inputs
 *
 * `updated.json` is generated from git: the commit that last touched the page's
 * own copy files (see scripts/emit-updated-dates.mjs). That catches edits to the
 * page's prose but deliberately ignores `programmes.ts`, which is shared by all
 * eight programmes — attributing a PVIP fee edit to the MM2H page would inflate
 * five dates to fix one.
 *
 * So a guide also takes the later of its curated programme dates, which is
 * exactly where a change to that one programme's substance is already recorded
 * by hand. A figure correction moves `lastVerified` or `changedOn`; this picks
 * it up without any file in the guide's own directory being touched.
 *
 * The result is monotonic in practice and never synthesised from the clock: if
 * nothing changed, nothing in either input changed, and the date stands.
 */
export function pageUpdated(
  path: string,
  programme?: {
    lastVerified?: string;
    superseded?: { changedOn?: string; attribution?: { asAt?: string } } | null;
  },
): Date | undefined {
  const candidates = [
    (updatedDates as Record<string, string>)[path],
    programme?.lastVerified,
    programme?.superseded?.changedOn,
    programme?.superseded?.attribution?.asAt,
  ]
    .filter((d): d is string => typeof d === "string" && d.length > 0)
    .map((d) => new Date(d).getTime())
    .filter((t) => Number.isFinite(t));

  return candidates.length ? new Date(Math.max(...candidates)) : undefined;
}

/** The same, as the `YYYY-MM-DD` that schema.org's `dateModified` wants. */
export function pageUpdatedISODate(
  path: string,
  programme?: Parameters<typeof pageUpdated>[1],
): string | undefined {
  return pageUpdated(path, programme)?.toISOString().slice(0, 10);
}

/**
 * The same, for a route in the sitemap, where no programme record is in hand.
 *
 * A guide route folds in the curated dates of every programme it documents —
 * all three tiers, for /visas/mm2h/. Without this a guide would carry no
 * <lastmod> at all wherever git history is unavailable (Cloudflare Pages clones
 * shallow), even though `lastVerified` and `changedOn` are sitting right there
 * and are exactly the dates a reader is shown. The sitemap and the Article
 * schema should not disagree about when a guide last changed.
 */
export function routeUpdated(path: string): Date | undefined {
  const documented = programmes.filter((p) => guideHref[p.slug] === path);
  if (documented.length === 0) return pageUpdated(path);

  const dates = documented
    .map((p) => pageUpdated(path, p))
    .filter((d): d is Date => d instanceof Date);

  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined;
}

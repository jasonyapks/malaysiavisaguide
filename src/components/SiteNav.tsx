"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navGroups, navRoutes } from "@/lib/site";

/**
 * Primary navigation — SPEC.md §3. The programmes were previously listed flat
 * (nine links in one row); here they are grouped into labelled dropdowns so the
 * header reads as tidy categories: long-stay visas, work & study, tools,
 * insights & news.
 *
 * Entirely data-driven: every group and every link comes from `navGroups` and
 * `routes` in lib/site.ts, and this component names no route. News used to be
 * the exception — a hardcoded link written twice, desktop and mobile — which is
 * why /insights/ could launch without anyone noticing it had no header slot.
 * Adding a section should mean editing the route table and nothing else.
 *
 * Client component because dropdowns need hover, keyboard (Escape), outside-click
 * and a mobile toggle. Desktop shows dropdowns; below `sm` it collapses to a
 * single Menu button opening a grouped panel.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelMaxHeight, setPanelMaxHeight] = useState<number | undefined>();

  // Any navigation closes every menu.
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  // Outside click and Escape close the menus.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /**
   * The panel hangs off a `sticky` header, so anything taller than the space
   * below that header is unreachable: it does not extend the page's scroll
   * height, and the header carries it down as you scroll. Eleven links across
   * four groups overflow a short phone, which is why the last group —
   * "Insights & news" — was the one nobody could reach.
   *
   * Cap it at the gap between the panel's own top edge (which sits exactly on
   * the header's bottom edge) and the bottom of the viewport, and scroll
   * inside. Measured rather than hardcoded because the header's height changes
   * with the strapline and with the user's font size. `visualViewport` is what
   * mobile browsers shrink when the URL bar shows, so track it too.
   *
   * The cookie banner is `fixed bottom-0` at a higher z-index, so on a first
   * visit it covers the bottom of the panel — the last group would scroll into
   * a region the reader cannot see. Anything marked `data-bottom-overlay` is
   * subtracted as well.
   */
  useLayoutEffect(() => {
    if (!mobileOpen) return;
    function measure() {
      const el = panelRef.current;
      if (!el) return;
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const overlay = document.querySelector("[data-bottom-overlay]");
      const covered = overlay ? overlay.getBoundingClientRect().height : 0;
      setPanelMaxHeight(
        Math.max(0, viewport - covered - el.getBoundingClientRect().top),
      );
    }
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [mobileOpen]);

  /**
   * Prefix match, not equality. A reader on /insights/comparisons/<slug>/ or
   * /news/<slug>/ is inside that section and the header should say so; exact
   * matching left every article page with nothing highlighted at all.
   *
   * No false positives against the current route table: /insights/comparisons/
   * does not begin with /compare/, and the `path !== "/"` guard keeps home from
   * matching everything. There *is* a /tools/ index route as of 2026-08-08, and
   * it would over-match both tools underneath it — which is exactly why it
   * carries no `nav` group. This function only ever sees routes returned by
   * `navRoutes()`, so a route with no group never reaches it. Give /tools/ a
   * nav group and two dropdown items light up at once.
   */
  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <div ref={ref} className="flex flex-1 items-center justify-end gap-2">
      {/* Desktop — labelled dropdowns */}
      <nav
        aria-label="Primary"
        className="hidden flex-1 items-center gap-x-1 lg:flex"
      >
        {navGroups.map((group) => {
          const items = navRoutes(group.key);
          const isOpen = openGroup === group.key;
          const hasActive = items.some((r) => isActive(r.path));
          return (
            <div
              key={group.key}
              className="relative"
              onMouseEnter={() => setOpenGroup(group.key)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={() => setOpenGroup(isOpen ? null : group.key)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-caption font-semibold transition-colors ${
                  hasActive
                    ? "relative text-forest-900 after:absolute after:inset-x-2.5 after:-bottom-2 after:h-0.5 after:rounded-full after:bg-forest-600"
                    : "text-forest-700 hover:text-forest-900"
                }`}
              >
                {group.label}
                <Chevron open={isOpen} />
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full z-30 pt-1.5">
                  <ul className="min-w-[15rem] overflow-hidden rounded-xl border border-sand-200 bg-white py-1.5 shadow-lg shadow-forest-900/10">
                    {items.map((r) => (
                      <li key={r.path}>
                        <Link
                          href={r.path}
                          className={`block px-4 py-2 text-body-sm transition-colors hover:bg-sand-100 ${
                            isActive(r.path)
                              ? "font-semibold text-forest-900"
                              : "text-forest-700"
                          }`}
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Mobile — single toggle */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        onClick={() => setMobileOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-forest-700 hover:text-forest-900 lg:hidden"
      >
        <span className="text-caption font-medium">Menu</span>
        <Burger open={mobileOpen} />
      </button>

      {/* Mobile panel — full-width, anchored to the sticky header */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={panelRef}
          style={{ maxHeight: panelMaxHeight }}
          className="absolute inset-x-0 top-full z-30 overflow-y-auto overscroll-contain border-b border-sand-200 bg-white shadow-lg shadow-forest-900/10 lg:hidden"
        >
          <div className="mx-auto max-w-6xl space-y-5 px-6 py-5">
            {navGroups.map((group) => (
              <div key={group.key}>
                <p className="mb-1.5 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {navRoutes(group.key).map((r) => (
                    <li key={r.path}>
                      <Link
                        href={r.path}
                        className={`block rounded-md px-2 py-1.5 text-body-sm ${
                          isActive(r.path)
                            ? "font-semibold text-forest-900"
                            : "text-forest-700"
                        }`}
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

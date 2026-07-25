"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  source_name: string;
  source_url: string;
  published_at: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  pvip: "PVIP",
  mm2h: "MM2H",
  "sarawak-mm2h": "Sarawak MM2H",
  "de-rantau": "DE Rantau",
  "employment-pass": "Employment Pass",
  "student-pass": "Student Pass",
  general: "Immigration",
};

/**
 * Client-side hydration of approved news items from the news Worker. Kept out of
 * the static build on purpose: the page shell (and its SEO metadata) is static,
 * the feed is live. Fails soft — if the backend isn't reachable yet, it says so
 * rather than breaking the page.
 */
export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let live = true;
    fetch(site.newsApi)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { items: NewsItem[] }) => {
        if (!live) return;
        setItems(data.items ?? []);
        setState("ready");
      })
      .catch(() => live && setState("error"));
    return () => {
      live = false;
    };
  }, []);

  if (state === "loading") {
    return <p className="text-ink-muted">Loading the latest updates…</p>;
  }

  if (state === "error" || site.newsApi.includes("PLACEHOLDER")) {
    return (
      <p className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-6 text-ink-muted">
        The news feed is being set up and will appear here shortly. In the
        meantime, the programme guides carry the current verified figures.
      </p>
    );
  }

  if (!items || items.length === 0) {
    return (
      <p className="rounded-xl border border-sand-200 bg-sand-50 px-5 py-6 text-ink-muted">
        No updates published yet — check back soon.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {items.map((it) => (
        <li
          key={it.id}
          className="border-b border-sand-200 pb-6 last:border-0 last:pb-0"
        >
          <div className="mb-2 flex items-center gap-3 text-[0.8rem]">
            <span className="rounded-full bg-forest-50 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-forest-700">
              {CATEGORY_LABEL[it.category] ?? "Immigration"}
            </span>
            {it.published_at && (
              <time className="text-ink-muted" dateTime={it.published_at}>
                {new Date(it.published_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            )}
          </div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            {it.title}
          </h2>
          <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-ink-muted">
            {it.summary}
          </p>
          <a
            href={it.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[0.9rem] font-medium text-forest-700 underline"
          >
            Read the full story at {it.source_name}
            <span aria-hidden>↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

# src/assets

Images imported by components, so Next fingerprints them.

An import here is emitted as `/_next/static/media/<name>.<hash>.webp` and served
`immutable` — the URL changes whenever the bytes change, so a replaced file can
never be served stale.

`public/` is the opposite: a stable URL, and `_headers` puts a 30-day
`max-age` on the brand assets there. That is right for a URL other people link
to (email signatures, the CMS, a press kit) and wrong for anything the site
itself renders.

**This distinction is not academic.** The v5 logo shipped to production on
2026-08-25 and visitors kept seeing the v4 Petronas Towers mark: same
`/logo-mark.webp` path, 30-day cache, so Cloudflare's edge and every returning
browser held the old bytes. Verifying with a cache-busting query string hid it,
because that bypasses the very cache that was serving the stale file.

If the site renders it, import it from here.

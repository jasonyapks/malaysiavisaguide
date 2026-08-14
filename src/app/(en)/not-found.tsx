import { NotFoundContent } from "@/components/NotFoundContent";

/**
 * 404 inside the English tree — served when a page calls `notFound()`.
 *
 * The file Cloudflare Pages actually serves for an unmatched URL is
 * `out/404.html`, and that one comes from `app/global-not-found.tsx`, not from
 * here. Both exist because they answer different questions: this one renders
 * inside the layout for a route that exists but has no content, the global one
 * replaces the whole document for a URL that matches no route at all.
 */
export default function NotFound() {
  return <NotFoundContent locale="en" />;
}

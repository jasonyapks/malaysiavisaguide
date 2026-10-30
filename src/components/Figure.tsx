import Image from "next/image";
import type { SiteImage } from "@/lib/images";

/**
 * One image slot for the whole site — SPEC.md §4.3.
 *
 * When the photo exists (`ready`), it renders a real <img> (Next static export
 * serves it unoptimised). Until then it renders a branded placeholder carrying
 * the shot brief, so the layout reads as intentional rather than broken and the
 * spot where a photo belongs is obvious.
 *
 * Readability comes first for this audience, so the image never sits behind
 * text — it is always its own block.
 */
export function Figure({
  image,
  /** Tailwind aspect class, e.g. "aspect-[3/2]". */
  aspect = "aspect-[3/2]",
  /**
   * The picture's own width ÷ height. When set it replaces `aspect`, so the box
   * is the photo's shape and `object-cover` has nothing to cut off. A portrait
   * is also narrowed and centred: at full column width a tall photo would fill
   * two screens.
   */
  ratio,
  /** What the picture shows, in the article's words. Sits above the credit. */
  caption,
  className = "",
  rounded = "rounded-2xl",
  /** Set on the one above-the-fold image per page (the hero) for LCP. */
  priority = false,
  sizes = "(min-width: 768px) 720px, 100vw",
}: {
  image: SiteImage;
  aspect?: string;
  ratio?: number;
  caption?: string;
  className?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const portrait = ratio !== undefined && ratio < 1;
  return (
    <figure className={`${className} ${portrait ? "mx-auto max-w-sm" : ""}`}>
      <div
        className={`relative ${ratio ? "" : aspect} ${rounded} overflow-hidden ring-1 ring-sand-200`}
        style={ratio ? { aspectRatio: String(ratio) } : undefined}
      >
        {image.ready ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <Placeholder brief={image.brief} />
        )}
      </div>
      {image.ready && (caption || image.credit) && (
        <figcaption className="mt-2 text-eyebrow text-ink-muted">
          {caption && <span className="block text-caption text-ink">{caption}</span>}
          {image.credit && (
            // A separate line, never replaced by the caption: most licences on
            // these photos (CC BY, CC BY-SA) require the credit to be shown.
            <span className={caption ? "mt-0.5 block" : undefined}>
              {image.credit.prefix ?? "Photo"}:{" "}
              {image.credit.url ? (
                <a
                  href={image.credit.url}
                  className="underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {image.credit.name}
                </a>
              ) : (
                image.credit.name
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function Placeholder({ brief }: { brief: string }) {
  return (
    <div
      aria-hidden
      className="grid h-full place-items-center bg-gradient-to-br from-forest-600 via-forest-700 to-forest-900 p-6 text-center text-sand-100"
    >
      <div className="max-w-xs space-y-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto size-8 opacity-70"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-sand-100/60">
          Photography
        </p>
        <p className="text-caption leading-snug text-sand-100/85">{brief}</p>
      </div>
    </div>
  );
}

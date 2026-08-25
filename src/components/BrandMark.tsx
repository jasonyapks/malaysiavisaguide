/**
 * THE MALAYSIA VISA GUIDE MARK — a vector redraw of the logo on
 * `MVG_branding_board.png`, which is the authority for it.
 *
 * ## Read this before changing anything here
 *
 * The board is a raster mock-up, not artwork: ~150×195 native pixels of the
 * icon, on a cream ground, with compression fringing and no alpha channel.
 * Cropping it would have put a faintly boxed, soft logo in the header of every
 * page. So the geometry is rebuilt here instead — same four elements, same two
 * colours, real transparency, sharp at any size.
 *
 * **It is a redraw, and a redraw is an approximation.** If the original vector
 * exists (AI/SVG/EPS from whoever produced the board), it should replace this
 * file. Proportions here were measured off the board at 4× and are close, not
 * identical.
 *
 * ## The four elements, in paint order
 *
 *   pages    the back cover fanning up and right — the book is open, not shut
 *   cover    the navy passport face
 *   crescent + 14-point star — Malaysia, straight off the flag
 *   compass  the gold rose, with its long axis running lower-left to upper-right
 *
 * The turning-page wedge on the board's lower-left is deliberately omitted: it
 * is a white-on-navy detail about 3px wide at header size, where it reads as a
 * chip out of the cover rather than as a page. Everything else survives to
 * 24px, which is the size this has to work at.
 *
 * ## Colour
 *
 * Hardcoded hex, deliberately, not the palette tokens: a logo does not
 * re-colour when a theme does. Navy here is the board's `#0B1D3A`, which is
 * the same value the palette uses for `forest-900` — the markdown template says
 * `#071D3A` instead. The board wins for both, so the mark and the page share
 * one navy. See the note on `--color-forest-900` in globals.css.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="4 2 54 58"
      className={className}
      // Decorative: the site name is rendered as real text beside it in the
      // header, so announcing the mark as well would read the brand twice.
      aria-hidden
      focusable="false"
    >
      {/* The back cover and pages, fanning up and to the right. */}
      <path
        d="M16 10.5 L48.5 5.5 A3 3 0 0 1 52 8.5 V50 A3 3 0 0 1 49.5 53 L20 57"
        fill="none"
        stroke="#0B1D3A"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* The front cover. */}
      <rect x="7" y="8" width="34" height="49" rx="4.5" fill="#0B1D3A" />

      {/* Crescent — two arcs between the same pair of horns, so the inner edge
          is a true concave sweep rather than a second shape laid on top. */}
      <path
        d="M21.56 17.4 A7.5 7.5 0 1 0 21.56 30.6 A6.6 6.6 0 0 1 21.56 17.4 Z"
        fill="#D4A017"
      />

      {/* The 14-point star. Fourteen, not eight: it is the number on the flag,
          and at header size the count is what stops this reading as a generic
          sparkle. */}
      <path
        d="M28.6 17.1 L27.99 20.52 L25.95 17.7 L26.89 21.05 L23.83 19.4 L26.12 22.01 L22.65 21.84 L25.85 23.2 L22.65 24.56 L26.12 24.39 L23.83 27 L26.89 25.35 L25.95 28.7 L27.99 25.88 L28.6 29.3 L29.21 25.88 L31.25 28.7 L30.31 25.35 L33.37 27 L31.08 24.39 L34.55 24.56 L31.35 23.2 L34.55 21.84 L31.08 22.01 L33.37 19.4 L30.31 21.05 L31.25 17.7 L29.21 20.52 Z"
        fill="#D4A017"
      />

      {/* The compass rose. Eight points on unequal radii: the long axis runs
          lower-left to upper-right and breaks the cover's edge, which is what
          keeps the mark from sitting square inside its own rectangle. */}
      <path
        d="M42.1 41.5 L36.18 40.39 L49.06 25.94 L34.61 38.82 L33.5 32.9 L32.39 38.82 L29.96 37.96 L30.82 40.39 L24.9 41.5 L30.82 42.61 L23.95 51.05 L32.39 44.18 L33.5 50.1 L34.61 44.18 L37.04 45.04 L36.18 42.61 Z"
        fill="#D4A017"
      />
      <circle
        cx="33.5"
        cy="41.5"
        r="2.6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.7"
      />
    </svg>
  );
}

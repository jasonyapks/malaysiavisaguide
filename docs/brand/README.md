# Brand

The source material the site's visual design is implemented from. Nothing here is
served to a reader — these are the masters, kept so a future change starts from
the artwork rather than from a screenshot of it.

| File | What it is |
|---|---|
| `MVG_logo.png` | The master logo Jason supplied. 2172×724 RGBA, icon + wordmark + tagline. |
| `MVG_branding_board.png` | The visual board — swatches, type specimens, the logo in context. |
| `branding-template.md` | The written system: colour, type, devices, voice. |

## What the site actually renders

Not these. `src/assets/logo-mark.webp` is the icon cropped out of `MVG_logo.png`
at x154 y23, 614×670 — a box measured off the alpha channel, not by eye. It is
imported by `RootShell.tsx` so Next fingerprints it; `src/assets/README.md`
explains why that matters, and it is not academic (the v5 mark shipped to a
stable path and returning visitors kept getting v4 out of a 30-day cache for
days).

`public/logo-mark.webp` and `public/logo-mark.png` are the same crop at stable
URLs, for email signatures, print and anyone linking the mark from outside. The
site must not render those.

## The colour disagreement

The two documents disagree on the navy: `branding-template.md` §3 says `#071D3A`,
`MVG_branding_board.png` labels its swatch `#0B1D3A`. `src/app/globals.css`
records which one won and why, next to the token. Read it there before changing a
colour — the answer is in the code, not here.

These files moved out of the repository root on 2026-09-20. Paths in `SPEC.md`
and in `globals.css` were updated with them; if you find one that says "in the
repo root", it was missed.

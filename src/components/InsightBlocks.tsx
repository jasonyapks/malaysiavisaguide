import Link from "next/link";
import type { Block, Inline } from "@shared/blocks";
import { DataTable, type Cell } from "@/components/DataTable";
import { Figure } from "@/components/Figure";
import { H2, H3, Pullquote } from "@/components/InsightLayout";
import { KeyFacts } from "@/components/KeyFacts";
import { SupersededNotice } from "@/components/SupersededNotice";
import { TierTable } from "@/components/TierTable";
import { articleImage } from "@/lib/articleImages";
import { getProgramme, type ProgrammeSlug } from "@/lib/data/programmes";
import { resolveFigure } from "@/lib/figures";

/**
 * The renderer for a stored insight document.
 *
 * This file is the *only* place that turns a stored node into an element, and
 * that is the security model. Nothing here calls `dangerouslySetInnerHTML` on
 * authored content, because there is no path by which authored content is
 * markup: an author stores a tree of typed nodes and this file decides, for each
 * kind, which element it becomes and which classes it carries. An author cannot
 * express a colour, a font, an inline style or a script tag, because there is no
 * node for any of them.
 *
 * The second job is subtler and matters more day to day: every class below comes
 * from the design system, so an article written in the dashboard is
 * typographically identical to one written in .tsx. The classes are lifted
 * verbatim from the two hand-written articles — that is what makes the Phase 5
 * transcription a diff of nothing.
 */

/** Where a node lives, for error messages that name a place rather than a type. */
function at(docPath: string, index: number): string {
  return `insight "${docPath}" block ${index}`;
}

// --- Inline ----------------------------------------------------------------

export function InlineNodes({
  nodes,
  where,
  onNavy = false,
}: {
  nodes: Inline[];
  where: string;
  /**
   * Set inside the navy CTA. Link colour is the only thing that changes, and it
   * has to: forest-700 on forest-900 is unreadable, and an author has no way to
   * say "this one is on a dark panel" — nor should they. The renderer knows
   * which block it is in; the document does not.
   */
  onNavy?: boolean;
}) {
  return (
    <>
      {nodes.map((n, i) => (
        <InlineNode key={i} node={n} where={where} onNavy={onNavy} />
      ))}
    </>
  );
}

function InlineNode({
  node,
  where,
  onNavy,
}: {
  node: Inline;
  where: string;
  onNavy: boolean;
}) {
  switch (node.t) {
    case "text":
      return <>{node.v}</>;
    case "strong":
      return (
        <strong>
          <InlineNodes nodes={node.c} where={where} onNavy={onNavy} />
        </strong>
      );
    case "em":
      return (
        <em>
          <InlineNodes nodes={node.c} where={where} onNavy={onNavy} />
        </em>
      );
    case "note":
      // The attributed caveat that has to travel next to a practice-sourced
      // figure — "MYPVIP practice, as at 28 July 2026". Typed rather than left
      // to <em> so it reads the same everywhere and can later be linted for.
      return (
        <span className="text-caption text-ink-muted">
          <InlineNodes nodes={node.c} where={where} onNavy={onNavy} />
        </span>
      );
    case "link": {
      const external = /^https?:\/\//.test(node.href);
      const cls = onNavy
        ? "font-semibold underline"
        : "text-forest-700 underline";
      // The author supplies a destination; the renderer supplies the rel and
      // the target. Outbound links are nofollow noopener without anyone having
      // to remember, and an internal link gets the client-side <Link>.
      return external ? (
        <a
          href={node.href}
          className={cls}
          rel="nofollow noopener"
          target="_blank"
        >
          <InlineNodes nodes={node.c} where={where} onNavy={onNavy} />
        </a>
      ) : (
        <Link href={node.href} className={cls}>
          <InlineNodes nodes={node.c} where={where} onNavy={onNavy} />
        </Link>
      );
    }
    case "fig":
      // Throws, and fails the build, when it cannot be resolved. See
      // src/lib/figures.ts for why an empty span is the worse outcome.
      return <>{resolveFigure(node, where)}</>;
  }
}

// --- Blocks ----------------------------------------------------------------

export function InsightBlocks({
  blocks,
  docPath,
}: {
  blocks: Block[];
  /** `<category>/<slug>` — the article's identity in an error message. */
  docPath: string;
}) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockNode key={i} block={b} where={at(docPath, i)} index={i} />
      ))}
    </>
  );
}

function BlockNode({
  block,
  where,
  index,
}: {
  block: Block;
  where: string;
  index: number;
}) {
  switch (block.t) {
    case "heading": {
      const Heading = block.level === 2 ? H2 : H3;
      return (
        <Heading>
          <InlineNodes nodes={block.c} where={where} />
        </Heading>
      );
    }

    case "paragraph":
      return (
        <p>
          <InlineNodes nodes={block.c} where={where} />
        </p>
      );

    case "pullquote":
      return (
        <Pullquote>
          <InlineNodes nodes={block.c} where={where} />
        </Pullquote>
      );

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`ml-5 space-y-2 ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineNodes nodes={item} where={`${where} item ${i}`} />
            </li>
          ))}
        </List>
      );
    }

    case "table": {
      const rows = block.rows.map((r) => ({
        label: <InlineNodes nodes={r.label} where={where} />,
        cells: r.cells.map(
          (c): Cell => ({
            value: <InlineNodes nodes={c.value} where={where} />,
            note: c.note,
          }),
        ),
      }));
      return (
        <DataTable
          caption={block.caption}
          head={block.head}
          rows={rows}
          notes={block.notes ?? []}
          // Unique per table on the page, which is what the footnote anchors
          // need. The block index is the only thing guaranteed to be unique.
          idPrefix={`b${index}`}
        />
      );
    }

    case "figure": {
      // Unslotted assets are published under `asset/<id>` in the image
      // manifest — see imageManifest() in worker/src/assets.ts — so a figure
      // block resolves through the same registry as every other picture and
      // the site keeps serving them same-origin.
      const image = articleImage(`asset/${block.assetId}`);
      if (!image) {
        throw new Error(
          `[insights] ${where}: no image for asset ${block.assetId}.\n\n` +
            `The build is stopping on purpose. A figure block that renders ` +
            `nothing leaves a caption under a gap, and the article was written ` +
            `assuming the picture is there. Run \`npm run images:pull\` if the ` +
            `asset was uploaded after the last build, or remove the block.`,
        );
      }
      return (
        <Figure
          image={block.caption ? { ...image, credit: { name: block.caption } } : image}
          aspect={block.aspect ?? "aspect-[16/9]"}
        />
      );
    }

    case "callout":
      return (
        <aside
          className={
            block.tone === "warning"
              ? "rounded-xl border-l-4 border-alert-600 bg-sand-100 px-6 py-5"
              : "rounded-xl border-l-4 border-forest-600 bg-forest-50 px-6 py-5"
          }
        >
          {block.title && (
            <p className="text-body-sm font-semibold text-forest-900">
              {block.title}
            </p>
          )}
          <div className="mt-2 space-y-3 text-body-sm leading-relaxed">
            {block.body.map((p, i) => (
              <p key={i}>
                <InlineNodes nodes={p} where={`${where} paragraph ${i}`} />
              </p>
            ))}
          </div>
        </aside>
      );

    case "programmeNotice":
      return <SupersededNotice programme={programme(block.programme, where)} />;

    case "keyFacts":
      return <KeyFacts programme={programme(block.programme, where)} />;

    case "tierTable":
      return (
        <TierTable
          tiers={block.programmes.map((p) => programme(p, where))}
          caption={block.caption}
          variant={block.variant}
        />
      );

    case "cta":
      // Never a full stop. The article answers a question; this asks the next.
      return (
        <p className="rounded-xl bg-forest-900 px-6 py-6 text-sand-50">
          <InlineNodes nodes={block.c} where={where} onNavy />
        </p>
      );
  }
}

/**
 * A programme by id, or a build failure.
 *
 * Validation already rejects an unknown id at save time, so reaching this throw
 * means a programme was deleted from programmes.ts while an article still cited
 * it — which is exactly the moment somebody needs to be told.
 */
function programme(id: string, where: string) {
  const p = getProgramme(id as ProgrammeSlug);
  if (!p) {
    throw new Error(
      `[insights] ${where}: no programme "${id}" in src/lib/data/programmes.ts. ` +
        `An article cites a programme that no longer exists; the build is stopping ` +
        `rather than rendering the block empty.`,
    );
  }
  return p;
}

/**
 * Let plain `node` run the modules in shared/.
 *
 * Node strips types from a .ts file happily enough (on by default since 23.6),
 * but it will not guess an extension: `import { … } from "./blocks"` is a hard
 * ERR_MODULE_NOT_FOUND, and every file in shared/ is written that way because
 * webpack and esbuild — its two real consumers — both resolve extensionless
 * specifiers.
 *
 * Rewriting shared/ to carry `.ts` extensions would mean turning on
 * `allowImportingTsExtensions` in two tsconfigs and changing files the Worker
 * compiles, to suit a build script. This is the smaller change: a resolve hook
 * that only fires on a specifier that has already failed, and only appends the
 * one extension. Nothing in the repo changes shape.
 *
 * Use it as `node --import ./scripts/ts-resolve.mjs scripts/whatever.mjs`.
 */
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * The two path aliases from tsconfig.json. Taught to the hook rather than
 * avoided in source: a build script that reads content has to agree with the
 * build itself about what a document is, and the only way to guarantee that is
 * for both to import the same module. Making src/lib reachable from a script is
 * what allows `sync-insight-routes.mjs` to stop reimplementing it.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const ALIASES = [
  ["@shared/", path.join(ROOT, "shared")],
  ["@/", path.join(ROOT, "src")],
];

registerHooks({
  resolve(specifier, context, nextResolve) {
    for (const [prefix, dir] of ALIASES) {
      if (!specifier.startsWith(prefix)) continue;
      const rest = specifier.slice(prefix.length);
      const abs = path.join(dir, rest);
      const url = pathToFileURL(/\.[cm]?[jt]sx?$/.test(abs) ? abs : `${abs}.ts`)
        .href;
      return nextResolve(url, context);
    }

    try {
      return nextResolve(specifier, context);
    } catch (err) {
      const bare = specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier);
      if (!bare) throw err;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

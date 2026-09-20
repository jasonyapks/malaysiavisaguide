import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored @sveltia/cms — 1.9MB of someone else's minified build, on one
    // 3,386-character line. Linting it produced ~6,000 warnings, which buried
    // the handful of real findings in this repo's own code and made
    // `npm run lint` output nobody read. Not ours to fix: upgrading the CMS is
    // a re-download, and /admin/index.html says so.
    "public/admin/sveltia-cms.js",
  ]),
  {
    rules: {
      // An underscore means "the platform hands me this and I do not want it" —
      // `scheduled(_event, env, _ctx)` cannot choose its own signature. The
      // convention is already used in worker/src/index.ts; this makes the linter
      // agree with it, so a genuinely forgotten variable still gets reported.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;

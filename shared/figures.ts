/**
 * The closed allowlist a `fig` node may address, and the pure half of resolving
 * one.
 *
 * Two consumers, which is why it lives in shared/ rather than in src/lib:
 *
 *  - `src/lib/figures.ts` resolves figures at build time and **throws** when one
 *    cannot be resolved. A missing figure must fail the build, not render an
 *    empty span — an empty span is the exact silent staleness this site exists
 *    to avoid, and it would ship a sentence with a hole in it.
 *  - `scripts/emit-figures.mjs` emits the same catalogue with its current values
 *    to `public/figures.json`, for the dashboard's figure picker.
 *
 * Nothing here imports anything. Node's type stripping runs this file directly
 * from a .mjs script, and the Worker compiles it alongside its own sources; a
 * single import of site code would break both.
 *
 * ## Why an allowlist rather than a path expression
 *
 * "Just let the author write `pvip.participationFee.principal`" is one keystroke
 * from `pvip.superseded.attribution.by` rendering as `[object Object]`, and one
 * refactor from every article breaking at once with no warning. A closed list is
 * a contract: renaming a field in programmes.ts fails this file's typecheck, and
 * that is the moment to notice.
 */

export type CurrencyLike = "MYR" | "USD";

export interface MoneyLike {
  amount: number;
  currency: CurrencyLike;
}

/**
 * The subset of `Programme` a figure can be read from.
 *
 * Structural, so the real `Programme` from src/lib/data/programmes.ts is
 * assignable to it without shared/ importing site code. Extra properties on the
 * real type are ignored; a *renamed* or *retyped* one fails to assign, which is
 * the check that keeps this file honest.
 */
export interface ProgrammeLike {
  slug: string;
  name: string;
  authority: string;
  tenureYears: number;
  minAge: number | null;
  fixedDeposit: (MoneyLike & { withdrawable?: string }) | null;
  incomeRequirement: (MoneyLike & { period: "month" | "year" }) | null;
  propertyPurchaseMin: MoneyLike | null;
  propertyStateFloorNote?: string;
  participationFee: {
    principal: number;
    dependant: number;
    currency: CurrencyLike;
  } | null;
  processingFee: {
    principal: number;
    dependant: number;
    currency: CurrencyLike;
  } | null;
  minStayPerYear: string | null;
  minStayShort: string | null;
  workRights: "full" | "restricted" | "none";
  salaryFloor: MoneyLike | null;
  governmentExtras?: {
    agencyFee?: {
      principal: number;
      currency: CurrencyLike;
      paymentTerms?: string;
      /** Whose word the fee schedule is on. See `attribution` below. */
      attribution?: AttributionLike;
    };
    passFeePerYear?: {
      principal?: number;
      dependant?: number;
      currency: CurrencyLike;
    };
  };
  /**
   * A practice that is applied but published nowhere — MM2H's absent income
   * threshold being the case this exists for.
   *
   * It carries an attribution because it has to: an unsourced claim about what
   * a ministry actually does is the one kind of sentence this site cannot
   * print. Attaching it to the programme rather than leaving it a loose module
   * constant is what makes it addressable from an article body, which is what
   * keeps §4.1 true once articles live in the CMS instead of in JSX.
   */
  incomePractice?: { note: string; attribution: AttributionLike };
  source: string;
  lastVerified: string;
}

/** Who asserted something, and when it was current. */
export interface AttributionLike {
  by: string;
  asAt: string;
}

/**
 * What a resolved field *is*, before anyone decides how to write it.
 *
 * The split between value and format is the point: the same deposit renders
 * "RM1,000,000" in prose and "RM1,000,000 a month" beside a period, and neither
 * spelling belongs in the stored document.
 */
export type FigureValue =
  | { kind: "money"; amount: number; currency: CurrencyLike }
  | {
      kind: "moneyPeriod";
      amount: number;
      currency: CurrencyLike;
      period: "month" | "year";
    }
  | { kind: "years"; n: number }
  | { kind: "count"; n: number }
  | { kind: "text"; s: string }
  | { kind: "date"; iso: string };

export type FigureValueKind = FigureValue["kind"];

/** Every way a resolved value may be written. Also a closed set. */
export const FIGURE_FORMATS = [
  "money",
  "moneyPer",
  "years",
  "number",
  "text",
  "date",
] as const;

export type FigureFormat = (typeof FIGURE_FORMATS)[number];

/** Which formats each kind of value accepts. */
export const FORMATS_FOR_KIND: Record<FigureValueKind, readonly FigureFormat[]> =
  {
    money: ["money"],
    // A period-bearing amount may be written with or without its period —
    // "RM40,000 a month" in prose, "RM40,000" in a table cell whose column
    // header already says monthly.
    moneyPeriod: ["moneyPer", "money"],
    years: ["years", "number"],
    count: ["number"],
    text: ["text"],
    date: ["date", "text"],
  };

/**
 * The fields a `fig` node may address.
 *
 * `label` is what the dashboard's picker shows. `kind` decides which formats are
 * legal, and therefore what validation accepts.
 */
export const FIGURE_FIELDS = [
  { id: "name", label: "Programme name", kind: "text" },
  { id: "authority", label: "Authority", kind: "text" },
  { id: "tenureYears", label: "Term", kind: "years" },
  { id: "minAge", label: "Minimum age", kind: "count" },
  { id: "fixedDeposit", label: "Fixed deposit", kind: "money" },
  {
    id: "fixedDepositWithdrawable",
    label: "Fixed deposit — withdrawal rule",
    kind: "text",
  },
  {
    id: "incomeRequirement",
    label: "Income requirement",
    kind: "moneyPeriod",
  },
  {
    id: "propertyPurchaseMin",
    label: "Property purchase minimum",
    kind: "money",
  },
  {
    id: "propertyStateFloorNote",
    label: "Property — state floor caveat",
    kind: "text",
  },
  {
    id: "participationFee.principal",
    label: "Participation fee — principal",
    kind: "money",
  },
  {
    id: "participationFee.dependant",
    label: "Participation fee — per dependant",
    kind: "money",
  },
  {
    id: "processingFee.principal",
    label: "Processing fee — principal",
    kind: "money",
  },
  {
    id: "processingFee.dependant",
    label: "Processing fee — per dependant",
    kind: "money",
  },
  { id: "salaryFloor", label: "Minimum salary", kind: "money" },
  {
    id: "agencyFee.principal",
    label: "Agency fee — principal",
    kind: "money",
  },
  {
    id: "passFeePerYear.principal",
    label: "Pass fee per year — principal",
    kind: "money",
  },
  {
    id: "passFeePerYear.dependant",
    label: "Pass fee per year — dependant",
    kind: "money",
  },
  {
    id: "agencyFee.paymentTerms",
    label: "Agency fee — payment terms",
    kind: "text",
  },
  {
    id: "agencyFee.attributionBy",
    label: "Agency fee — whose word it is on",
    kind: "text",
  },
  {
    id: "agencyFee.attributionAsAt",
    label: "Agency fee — attribution date",
    kind: "date",
  },
  /*
   * The three below carry a practice rather than a published figure, and they
   * are split into note / by / date rather than pre-joined into one sentence
   * for the same reason every other figure is split from its format: an article
   * writes "X, as at 28 July 2026" in prose and "X (28/07/26)" in a table
   * footnote, and neither spelling belongs in programmes.ts.
   */
  { id: "incomePractice.note", label: "Income practice — note", kind: "text" },
  {
    id: "incomePractice.attributionBy",
    label: "Income practice — whose word it is on",
    kind: "text",
  },
  {
    id: "incomePractice.attributionAsAt",
    label: "Income practice — attribution date",
    kind: "date",
  },
  { id: "minStayPerYear", label: "Minimum stay (full)", kind: "text" },
  { id: "minStayShort", label: "Minimum stay (short)", kind: "text" },
  { id: "workRights", label: "Work rights", kind: "text" },
  { id: "lastVerified", label: "Last verified", kind: "date" },
] as const satisfies readonly {
  id: string;
  label: string;
  kind: FigureValueKind;
}[];

export type FigureField = (typeof FIGURE_FIELDS)[number]["id"];

export const FIGURE_FIELD_IDS: readonly string[] = FIGURE_FIELDS.map(
  (f) => f.id,
);

export function figureFieldKind(field: string): FigureValueKind | null {
  return FIGURE_FIELDS.find((f) => f.id === field)?.kind ?? null;
}

/** How work rights read to a human. Same wording as <KeyFacts>. */
const WORK_RIGHTS_TEXT: Record<ProgrammeLike["workRights"], string> = {
  full: "Full — may work and run a business",
  restricted: "Restricted — conditions apply",
  none: "None",
};

/**
 * Read one field off a programme.
 *
 * `null` means "this programme does not have that figure" — MM2H has no income
 * requirement, a work pass has no participation fee. That is a legitimate state
 * of the data and a **fatal** state of a document: an article that references a
 * figure a programme does not have is asking for a sentence with a hole in it.
 * The caller decides how loudly to fail; both callers fail loudly.
 */
export function figureValue(
  p: ProgrammeLike,
  field: string,
): FigureValue | null {
  switch (field) {
    case "name":
      return { kind: "text", s: p.name };
    case "authority":
      return { kind: "text", s: p.authority };
    case "tenureYears":
      return { kind: "years", n: p.tenureYears };
    case "minAge":
      return p.minAge === null ? null : { kind: "count", n: p.minAge };
    case "fixedDeposit":
      return p.fixedDeposit
        ? {
            kind: "money",
            amount: p.fixedDeposit.amount,
            currency: p.fixedDeposit.currency,
          }
        : null;
    case "fixedDepositWithdrawable":
      return p.fixedDeposit?.withdrawable
        ? { kind: "text", s: p.fixedDeposit.withdrawable }
        : null;
    case "incomeRequirement":
      return p.incomeRequirement
        ? {
            kind: "moneyPeriod",
            amount: p.incomeRequirement.amount,
            currency: p.incomeRequirement.currency,
            period: p.incomeRequirement.period,
          }
        : null;
    case "propertyPurchaseMin":
      return p.propertyPurchaseMin
        ? {
            kind: "money",
            amount: p.propertyPurchaseMin.amount,
            currency: p.propertyPurchaseMin.currency,
          }
        : null;
    case "propertyStateFloorNote":
      return p.propertyStateFloorNote
        ? { kind: "text", s: p.propertyStateFloorNote }
        : null;
    case "participationFee.principal":
      return p.participationFee
        ? {
            kind: "money",
            amount: p.participationFee.principal,
            currency: p.participationFee.currency,
          }
        : null;
    case "participationFee.dependant":
      return p.participationFee && p.participationFee.dependant > 0
        ? {
            kind: "money",
            amount: p.participationFee.dependant,
            currency: p.participationFee.currency,
          }
        : null;
    case "processingFee.principal":
      return p.processingFee
        ? {
            kind: "money",
            amount: p.processingFee.principal,
            currency: p.processingFee.currency,
          }
        : null;
    case "processingFee.dependant":
      return p.processingFee && p.processingFee.dependant > 0
        ? {
            kind: "money",
            amount: p.processingFee.dependant,
            currency: p.processingFee.currency,
          }
        : null;
    case "salaryFloor":
      return p.salaryFloor
        ? {
            kind: "money",
            amount: p.salaryFloor.amount,
            currency: p.salaryFloor.currency,
          }
        : null;
    case "agencyFee.principal": {
      const fee = p.governmentExtras?.agencyFee;
      return fee
        ? { kind: "money", amount: fee.principal, currency: fee.currency }
        : null;
    }
    case "agencyFee.paymentTerms": {
      const terms = p.governmentExtras?.agencyFee?.paymentTerms;
      return terms ? { kind: "text", s: terms } : null;
    }
    case "agencyFee.attributionBy": {
      const at = p.governmentExtras?.agencyFee?.attribution;
      return at ? { kind: "text", s: at.by } : null;
    }
    case "agencyFee.attributionAsAt": {
      const at = p.governmentExtras?.agencyFee?.attribution;
      return at ? { kind: "date", iso: at.asAt } : null;
    }
    case "incomePractice.note":
      return p.incomePractice
        ? { kind: "text", s: p.incomePractice.note }
        : null;
    case "incomePractice.attributionBy":
      return p.incomePractice
        ? { kind: "text", s: p.incomePractice.attribution.by }
        : null;
    case "incomePractice.attributionAsAt":
      return p.incomePractice
        ? { kind: "date", iso: p.incomePractice.attribution.asAt }
        : null;
    case "passFeePerYear.principal": {
      const fee = p.governmentExtras?.passFeePerYear;
      return fee?.principal === undefined
        ? null
        : { kind: "money", amount: fee.principal, currency: fee.currency };
    }
    case "passFeePerYear.dependant": {
      const fee = p.governmentExtras?.passFeePerYear;
      return fee?.dependant === undefined
        ? null
        : { kind: "money", amount: fee.dependant, currency: fee.currency };
    }
    case "minStayPerYear":
      return p.minStayPerYear ? { kind: "text", s: p.minStayPerYear } : null;
    case "minStayShort":
      return p.minStayShort ? { kind: "text", s: p.minStayShort } : null;
    case "workRights":
      return { kind: "text", s: WORK_RIGHTS_TEXT[p.workRights] };
    case "lastVerified":
      return { kind: "date", iso: p.lastVerified };
    default:
      return null;
  }
}

/**
 * The formatting functions from src/lib/format.ts, passed in.
 *
 * Injected rather than imported so this file stays import-free: format.ts is
 * site code, and both the Worker and a plain Node script call in here. Every
 * caller passes the same four functions, so there is still exactly one place
 * that decides an amount renders as `RM1,000,000`.
 */
export interface FormatFns {
  money(m: MoneyLike): string;
  moneyPer(m: MoneyLike & { period: "month" | "year" }): string;
  years(n: number): string;
  reviewDate(iso: string): string;
}

/** Write a resolved value the requested way, or `null` if the pair is illegal. */
export function formatFigure(
  v: FigureValue,
  fmt: string,
  fns: FormatFns,
): string | null {
  if (!FORMATS_FOR_KIND[v.kind].includes(fmt as FigureFormat)) return null;

  switch (fmt) {
    case "money":
      // Legal for `money` and for `moneyPeriod` — both carry amount+currency.
      return "amount" in v ? fns.money({ amount: v.amount, currency: v.currency }) : null;
    case "moneyPer":
      return v.kind === "moneyPeriod"
        ? fns.moneyPer({
            amount: v.amount,
            currency: v.currency,
            period: v.period,
          })
        : null;
    case "years":
      return v.kind === "years" ? fns.years(v.n) : null;
    case "number":
      return "n" in v ? String(v.n) : null;
    case "text":
      return v.kind === "text" ? v.s : v.kind === "date" ? v.iso : null;
    case "date":
      return v.kind === "date" ? fns.reviewDate(v.iso) : null;
    default:
      return null;
  }
}

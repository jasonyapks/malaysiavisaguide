import { getProgramme } from "@/lib/data/programmes";
import { money } from "@/lib/format";

/**
 * PVIP's first-year government outlay for three household sizes (audit task
 * B5-2: the page title promises "total cost" and the page had no table that
 * added one up).
 *
 * Computed from programmes.ts, never typed: the participation fee, the two
 * dependant terms, the pass fee and the initial approval length are all read
 * from the PVIP record, so a correction there corrects this table.
 *
 * What is deliberately NOT in the totals: the multiple-entry visa fee and the
 * security bond (priced by nationality — the calculator has them), the fixed
 * deposit (capital, not a cost) and the agency fee (commercial).
 */
const p = getProgramme("pvip")!;
const pf = p.participationFee!;
const [longTerm, shortTerm] = pf.dependantTerms!;
const extras = p.governmentExtras!;
const years = extras.defaultTermYears;
const pass = extras.passFeePerYear!;

const rm = (amount: number) => money({ amount, currency: "MYR" });

function household(dependants: number) {
  const passFee =
    years * ((pass.principal ?? 0) + dependants * (pass.dependant ?? 0));
  const long = pf.principal + dependants * longTerm.amount;
  const short = pf.principal + dependants * shortTerm.amount;
  return {
    dependants,
    participationLong: rm(long),
    participationShort: rm(short),
    passFee: rm(passFee),
    totalLong: rm(long + passFee),
    totalShort: rm(short + passFee),
  };
}

export const pvipOutlay = {
  years,
  longYears: longTerm.years,
  shortYears: shortTerm.years,
  fixedDeposit: money(p.fixedDeposit!),
  single: household(0),
  couple: household(1),
  familyOfFour: household(3),
};

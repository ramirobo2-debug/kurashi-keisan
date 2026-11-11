import { parseAmount } from "../tax/tax.js";

function integer(value, min, max, label) {
  if ((typeof value !== "string" && typeof value !== "number") || !/^\d+$/.test(String(value).trim())) throw new Error(`${label}は整数で入れてください`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label}は${min}〜${max}で入れてください`);
  return n;
}
function amount(value, min, label) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`${label}を入れてください`);
  const n = parseAmount(value);
  if (n === null || n < min || n > 100000000) throw new Error(`${label}は${min}〜1億円の整数で入れてください`);
  return n;
}
/** 幹事は通常額の参加者。多めに払う人は幹事以外。 */
export function calculateWarikan(total, people, unit = 100, mode = "ceil", extraPeople = 0, extraAmount = 0) {
  total = amount(total, 1, "合計金額");
  people = integer(people, 2, 100, "人数");
  unit = integer(unit, 1, 1000, "端数の単位");
  if (![1, 10, 100, 500, 1000].includes(unit)) throw new Error("端数の単位を選んでください");
  if (!["ceil", "floor"].includes(mode)) throw new Error("端数の扱いを選んでください");
  extraPeople = integer(extraPeople === "" ? 0 : extraPeople, 0, people - 1, "多めに払う人数");
  extraAmount = amount(extraAmount === "" ? 0 : extraAmount, 0, "追加額");
  const remaining = total - extraPeople * extraAmount;
  if (remaining < 0) throw new Error("追加額の合計は合計金額以下にしてください");
  const divisor = people * unit;
  const remainder = remaining % divisor;
  const base = ((remaining - remainder) / divisor + (mode === "ceil" && remainder > 0 ? 1 : 0)) * unit;
  const extra = base + extraAmount;
  const collected = base * people + extraPeople * extraAmount;
  const difference = collected - total;
  const shortage = Math.max(0, -difference), surplus = Math.max(0, difference);
  const organizer = base + shortage;
  return { base, extra, organizer, collected, difference, shortage, surplus, settledTotal: collected + shortage, normalPeople: people - extraPeople - 1, extraPeople };
}

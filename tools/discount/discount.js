import { divRound, fromExcluded, fromIncluded, isAmount } from "../tax/tax.js";
export { parseAmount, yen } from "../tax/tax.js";

/** 入力価格と同じ基準で割引額を端数処理して引き、その後に税額を端数処理する。 */
export function calculateDiscount(price, basis, kind, value, rate = 10, mode = "floor") {
  if (!isAmount(price) || price < 0) throw new Error("価格は0以上、1兆円までの整数で入れてください");
  if (!["excluded", "included"].includes(basis)) throw new Error("税抜か税込かを選んでください");
  if (!["percent", "amount"].includes(kind)) throw new Error("割引率か値引き額かを選んでください");
  if (!["floor", "round", "ceil"].includes(mode)) throw new Error("端数の処理を選んでください");
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("割引率・値引き額は0以上の整数で入れてください");
  if (kind === "percent" && value > 100) throw new Error("割引率は0〜100%で入れてください");
  if (kind === "amount" && value > price) throw new Error("値引き額は価格以下にしてください");
  const discount = kind === "percent" ? divRound(price * value, 100, mode) : value;
  const after = price - discount;
  const totals = (basis === "excluded" ? fromExcluded : fromIncluded)(after, rate, mode);
  return { discount, after, ...totals };
}

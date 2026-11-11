import { parseAmount } from "../tax/tax.js";
function amount(value, max, label) {
  const n = parseAmount(value);
  if (n === null || n < 0 || n > max) throw new Error(`${label}は0〜${max.toLocaleString("ja-JP")}円で入れてください`);
  return n;
}
function conditions(initial, rate, years) {
  initial = amount(initial, 1000000000, "はじめの金額");
  if (!["string", "number"].includes(typeof rate) || !/^\d+(?:\.\d{1,2})?$/.test(String(rate).trim()) || Number(rate) > 20) throw new Error("年利は0〜20%、小数第2位までで入れてください");
  if (!["string", "number"].includes(typeof years) || !/^\d+$/.test(String(years).trim()) || Number(years) < 1 || Number(years) > 50) throw new Error("期間は1〜50年の整数で入れてください");
  return { initial, r: Number(rate) / 1200, years: Number(years) };
}
function simulate(monthly, initial, r, years) {
  let balance = initial;
  const yearly = [];
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + r) + monthly;
    if (month % 12 === 0) {
      const principal = initial + monthly * month, total = Math.floor(balance);
      yearly.push({ year: month / 12, principal, total, profit: total - principal });
    }
  }
  return { monthly, ...yearly.at(-1), yearly };
}
export function calculateTsumitate(monthly, initial, rate, years) {
  const c = conditions(initial, rate, years);
  monthly = amount(monthly, 10000000, "毎月の積立額");
  if (monthly === 0 && c.initial === 0) throw new Error("金額を入れてください");
  return simulate(monthly, c.initial, c.r, c.years);
}
export function calculateTarget(target, initial, rate, years) {
  const c = conditions(initial, rate, years);
  // 目標額は共通の金額入力と同じ1兆円まで。
  target = amount(target, 1000000000000, "目標額");
  if (target === 0) throw new Error("目標額を入れてください");
  const n = c.years * 12;
  const growth = Math.exp(n * Math.log1p(c.r));
  const factor = c.r === 0 ? n : Math.expm1(n * Math.log1p(c.r)) / c.r;
  let monthly = Math.max(0, Math.ceil((target - c.initial * growth) / factor));
  // 月ごとの計算でも目標に届く最小の整数円にする。
  while (simulate(monthly, c.initial, c.r, c.years).total < target) monthly++;
  while (monthly > 0 && simulate(monthly - 1, c.initial, c.r, c.years).total >= target) monthly--;
  return { ...simulate(monthly, c.initial, c.r, c.years), target };
}

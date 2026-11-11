import { parseAmount } from "../tax/tax.js";

function integer(value, min, max, label) {
  if (!["string", "number"].includes(typeof value) || !/^\d+$/.test(String(value).trim())) throw new Error(`${label}を範囲内の整数で入れてください`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label}を範囲内の整数で入れてください`);
  return n;
}

export function calculateLoan(amount, annualRate, years, months = 0, method = "annuity") {
  const principal = parseAmount(amount);
  if (principal === null || principal < 1 || principal > 1000000000) throw new Error("借入額は1円〜10億円で入れてください");
  if (!["string", "number"].includes(typeof annualRate) || !/^\d+(?:\.\d{1,3})?$/.test(String(annualRate).trim())) throw new Error("年利は0〜20%、小数第3位までで入れてください");
  const [whole, fraction = ""] = String(annualRate).trim().split(".");
  const rate = Number(whole) * 1000 + Number(fraction.padEnd(3, "0"));
  if (rate > 20000) throw new Error("年利は0〜20%で入れてください");
  const y = integer(years, 1, 50, "返済年数");
  const m = integer(months, 0, 11, "追加の月数");
  if (!["annuity", "principal"].includes(method)) throw new Error("返済方法を選んでください");
  const count = y * 12 + m, r = rate / 1200000;
  // expm1/log1p で低金利でも桁落ちを避ける。
  const monthlyPayment = rate === 0 ? Math.floor(principal / count) : Math.floor(principal * r / -Math.expm1(-count * Math.log1p(r)));
  const base = Math.floor(principal / count);
  let balance = principal, total = 0, totalInterest = 0;
  const schedule = [], yearly = [];
  for (let month = 1; month <= count; month++) {
    const interest = Math.floor(balance * rate / 1200000);
    const paidPrincipal = month === count ? balance : Math.min(balance, method === "principal" ? base : monthlyPayment - interest);
    const payment = paidPrincipal + interest;
    balance -= paidPrincipal;
    total += payment; totalInterest += interest;
    schedule.push({ month, payment, interest, principal: paidPrincipal, balance });
    const year = Math.floor((month - 1) / 12);
    if (!yearly[year]) yearly.push({ year: year + 1, payment: 0, interest: 0, balance: 0 });
    yearly[year].payment += payment;
    yearly[year].interest += interest;
    yearly[year].balance = balance;
  }
  return { monthlyPayment, firstPayment: schedule[0].payment, lastPayment: schedule.at(-1).payment, total, totalInterest, schedule, yearly };
}

// 小数を整数比に直し、表示の直前にだけ四捨五入する。
function decimal(value, digits, min, max, label) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`${label}を入れてください`);
  const text = String(value).trim();
  const pattern = digits ? new RegExp(`^\\+?(?:\\d+(?:\\.\\d{1,${digits}})?|\\.\\d{1,${digits}})$`) : /^\+?\d+$/;
  if (text.length > 30 || !pattern.test(text)) throw new Error(`${label}は小数第${digits}位までで入れてください`);
  const [whole, fraction = ""] = text.replace(/^\+/, "").split(".");
  const d = 10n ** BigInt(digits);
  const n = BigInt(whole || "0") * d + BigInt(fraction.padEnd(digits, "0") || "0");
  if (n < min || n > max) throw new Error(`${label}が入力範囲を超えています`);
  return { n, d };
}
function money(n, d) {
  const rounded = n * 10n / d + (n * 10n % d * 2n >= d ? 1n : 0n);
  return `${rounded / 10n}.${rounded % 10n}`;
}
/** unit: hours / minutes。月の日数は1〜31の整数。結果は小数第1位の円表示用文字列。 */
export function calculateDenki(watts, time, rate = "31", days = "30", unit = "hours") {
  if (!["hours", "minutes"].includes(unit)) throw new Error("時間か分を選んでください");
  const w = decimal(watts, 1, 1n, 1000000n, "消費電力(W、0.1〜100,000)");
  const t = decimal(time, 2, unit === "hours" ? 1n : 60n, unit === "hours" ? 2400n : 144000n, "使用時間(0.01〜24時間、0.6〜1,440分)");
  const r = decimal(rate, 2, 1n, 100000n, "単価(0.01〜1,000円/kWh)");
  const m = decimal(days, 0, 1n, 31n, "1か月の日数(1〜31日)");
  const hn = w.n * r.n, hd = w.d * r.d * 1000n;
  const dn = hn * t.n, dd = hd * t.d * (unit === "minutes" ? 60n : 1n);
  return { hourly: money(hn, hd), daily: money(dn, dd), monthly: money(dn * m.n, dd), yearly: money(dn * 365n, dd) };
}

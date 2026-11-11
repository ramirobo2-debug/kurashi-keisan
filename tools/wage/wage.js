export const LABELS = { hourly: "時給", daily: "日給", monthly: "月給", yearly: "年収" };
// 小数第2位までの数を100倍した整数(BigInt)にする。min・max は100倍前の値
function decimal(value, name, min, max, places) {
  const s = ["string", "number"].includes(typeof value) ? String(value).trim() : "";
  const re = places === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${places}})?$`);
  const unit = places === 0 ? "整数" : `小数第${places}位までの数`;
  if (!re.test(s)) throw new Error(`${name}は${unit}で入力してください`);
  const [i, f = ""] = s.split(".");
  const scaled = BigInt(i) * 100n + BigInt((f + "00").slice(0, 2));
  if (scaled < BigInt(Math.round(min * 100)) || scaled > BigInt(Math.round(max * 100))) throw new Error(`${name}は${min}〜${max}の${unit}で入力してください`);
  return scaled;
}
// 1万倍した整数を小数の文字列にする(末尾の0は省く)
function show(scaled) {
  const i = scaled / 10000n, f = String(scaled % 10000n).padStart(4, "0").replace(/0+$/, "");
  return i.toLocaleString("ja-JP") + (f ? "." + f : "");
}
export function calculateWage(amount, unit = "hourly", hours = 8, days = 20, bonus = 0) {
  const a = decimal(amount, "金額", 0, 1000000000000, 0) / 100n;
  const h = decimal(hours, "1日の時間", 0.25, 24, 2);
  const d = decimal(days, "月の日数", 1, 31, 0) / 100n;
  const b = decimal(bonus, "賞与の月数", 0, 120, 2);
  if (!Object.hasOwn(LABELS, unit)) throw new Error("入力する単位を選んでください");
  // 倍率(時給を1とする)を1万倍した整数で持つ
  const factors = { hourly: 10000n, daily: h * 100n, monthly: h * d * 100n, yearly: h * d * (1200n + b) };
  const values = {}, formulas = {};
  for (const key of Object.keys(LABELS)) {
    values[key] = a * factors[key] / factors[unit];
    const parts = [a.toLocaleString("ja-JP")];
    if (factors[key] !== 10000n) parts.push(`× ${show(factors[key])}`);
    if (factors[unit] !== 10000n) parts.push(`÷ ${show(factors[unit])}`);
    formulas[key] = key === unit ? "入力した金額" : `${parts.join(" ")} = ${values[key].toLocaleString("ja-JP")}円`;
  }
  return { ...values, formulas };
}

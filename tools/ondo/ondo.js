// 入力は100倍の整数、途中は整数比で計算する。
function parseTemperature(value) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error("入力の範囲・小数桁・単位を確認してください");
  const text = String(value).trim();
  if (text.length > 20 || !/^[+-]?(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(text)) throw new Error("入力の範囲・小数桁・単位を確認してください");
  const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  const n = Number(whole || 0) * 100 + Number(fraction.padEnd(2, "0"));
  const signed = text.startsWith("-") ? -n : n;
  if (signed < -27315 || signed > 1000000) throw new Error("入力の範囲・小数桁・単位を確認してください");
  return signed;
}
function format(n, d, digits) {
  const scale = 10 ** digits, negative = n < 0;
  const a = Math.abs(n) * scale;
  const rounded = Math.floor(a / d) + (a % d * 2 >= d ? 1 : 0);
  const fraction = String(rounded % scale).padStart(digits, "0").replace(/0+$/, "");
  return `${negative && rounded ? "-" : ""}${Math.floor(rounded / scale)}${fraction ? "." + fraction : ""}`;
}
export function calculateOndo(value, unit = "C", digits = 1) {
  if (!["C", "F", "K"].includes(unit)) throw new Error("入力の範囲・小数桁・単位を確認してください");
  if (![1, 2].includes(digits)) throw new Error("入力の範囲・小数桁・単位を確認してください");
  const input = parseTemperature(value);
  // n/d は摂氏を100倍した値。9で割る際も丸めない。
  const n = unit === "F" ? (input - 3200) * 5 : unit === "K" ? input - 27315 : input;
  const d = unit === "F" ? 9 : 1;
  if (n < -27315 * d) throw new Error("絶対零度より低い温度は入れられません");
  return { C: format(n, d * 100, digits), F: format(n * 9 + 16000 * d, d * 500, digits), K: format(n + 27315 * d, d * 100, digits) };
}

// 整数比で計算し、表示時に四捨五入する。
const UNITS = { monme: 15n, kan: 15000n, kin: 2400n, g: 4n, kg: 4000n };
function decimal(value) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error("0より大きい数値と正しい単位を入れてください(100文字以内・カンマは3桁区切り)");
  const text = String(value).trim().replace(/[０-９．＋－，]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (text.length > 100 || !/^[+]?(?:(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?|\.[0-9]+)$/.test(text)) throw new Error("0より大きい数値と正しい単位を入れてください(100文字以内・カンマは3桁区切り)");
  const [whole, fraction = ""] = text.replace(/^\+/, "").replaceAll(",", "").split(".");
  const n = BigInt((whole || "0") + fraction);
  if (n <= 0n) throw new Error("0より大きい数値と正しい単位を入れてください(100文字以内・カンマは3桁区切り)");
  return { n, d: 10n ** BigInt(fraction.length) };
}
function format(n, d) {
  const scaled = n * 1000n;
  const rounded = scaled / d + (scaled % d * 2n >= d ? 1n : 0n);
  const whole = String(rounded / 1000n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = String(rounded % 1000n).padStart(3, "0").replace(/0+$/, "");
  return whole + (fraction ? "." + fraction : "");
}
export function calculateMonme(value, unit = "monme") {
  if (typeof unit !== "string" || !Object.hasOwn(UNITS, unit)) throw new Error("0より大きい数値と正しい単位を入れてください(100文字以内・カンマは3桁区切り)");
  const { n, d } = decimal(value);
  return Object.fromEntries(Object.entries(UNITS).map(([key, factor]) => [key, format(n * UNITS[unit], d * factor)]));
}

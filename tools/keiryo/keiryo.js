// 小数を整数の比で扱い、表示の直前にだけ四捨五入する。
function decimal(value) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error("数値を入れてください");
  const text = String(value).trim();
  if (text.length > 40 || !/^[+-]?(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(text)) {
    throw new Error("数値は小数点以下3桁までで入れてください(指数表記は使えません)");
  }
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  const d = 10n ** BigInt(fraction.length);
  const n = BigInt((whole || "0") + fraction) * (negative ? -1n : 1n);
  if (n > 1000000n * d || n < 0n) throw new Error("量は0〜100万で入れてください");
  return { n, d };
}

// digits: 表示する小数点以下の桁数(0〜12)。その桁で四捨五入する。
function format(n, d, digits = 12) {
  if (d < 0n) { n = -n; d = -d; }
  const scale = 10n ** BigInt(digits);
  const negative = n < 0n;
  const absolute = negative ? -n : n;
  const scaled = absolute * scale;
  const rounded = scaled / d + (scaled % d * 2n >= d ? 1n : 0n);
  const fraction = digits ? String(rounded % scale).padStart(digits, "0").replace(/0+$/, "") : "";
  return `${negative && rounded !== 0n ? "-" : ""}${rounded / scale}${fraction ? "." + fraction : ""}`;
}

function checkDigits(digits) {
  if (!Number.isInteger(digits) || digits < 0 || digits > 12) throw new Error("表示する桁数は0〜12にしてください");
  return digits;
}

// 各単位をmLの整数比で定義する。
const UNITS = {
  mL: [1n, 1n], cc: [1n, 1n], L: [1000n, 1n],
  tablespoon: [15n, 1n], teaspoon: [5n, 1n], cup: [200n, 1n],
  riceCup: [240100n, 1331n], go: [240100n, 1331n],
  sho: [2401000n, 1331n], shaku: [24010n, 1331n],
};

/** 整数比で換算し、表示の直前に丸める。 */
export function calculateKeiryo(value, unit = "mL", digits = 2) {
  checkDigits(digits);
  if (!Object.hasOwn(UNITS, unit)) throw new Error("量の単位を選んでください");
  const a = decimal(value);
  const [un, ud] = UNITS[unit];
  return Object.fromEntries(Object.entries(UNITS).map(([key, [n, d]]) =>
    [key, format(a.n * un * d, a.d * ud * n, digits)]));
}

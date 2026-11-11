// 小数を整数の比で扱い、表示の直前にだけ四捨五入する。
function decimal(value) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error("数値を入れてください");
  const text = String(value).trim();
  if (text.length > 40 || !/^[+-]?(?:\d+(?:\.\d{1,12})?|\.\d{1,12})$/.test(text)) {
    throw new Error("数値は小数点以下12桁までで入れてください(指数表記は使えません)");
  }
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  const d = 10n ** BigInt(fraction.length);
  const n = BigInt((whole || "0") + fraction) * (negative ? -1n : 1n);
  if (n > 1000000000000n * d || n < 0n) throw new Error("長さは0〜1兆で入れてください");
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

// 各単位をメートルの整数比で定義する。
const UNITS = {
  mm: [1n, 1000n], cm: [1n, 100n], m: [1n, 1n],
  bu: [1n, 330n], sun: [1n, 33n], shaku: [10n, 33n],
  ken: [20n, 11n], jo: [100n, 33n], kujira: [25n, 66n],
};

/** 整数比で換算し、表示の直前に丸める。 */
export function calculateShaku(value, unit = "cm", digits = 2) {
  checkDigits(digits);
  if (!Object.hasOwn(UNITS, unit)) throw new Error("長さの単位を選んでください");
  const a = decimal(value);
  const [un, ud] = UNITS[unit];
  return Object.fromEntries(Object.entries(UNITS).map(([key, [n, d]]) =>
    [key, format(a.n * un * d, a.d * ud * n, digits)]));
}

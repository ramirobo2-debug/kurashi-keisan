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
  if (n > 1000000000000n * d || n < 0n) throw new Error("面積は0〜1兆で入れてください");
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

// 寸法はmm。面積は寸法の積から求める。
export const TATAMI = Object.freeze({
  edo: Object.freeze({ name: "江戸間", length: 1760, width: 880 }),
  chukyo: Object.freeze({ name: "中京間", length: 1820, width: 910 }),
  kyo: Object.freeze({ name: "京間", length: 1910, width: 955 }),
  danchi: Object.freeze({ name: "団地間", length: 1700, width: 850 }),
  // 不動産広告の決まり(1畳あたり1.62㎡以上)。1800 × 900mm で 1.62㎡ になる。
  ad: Object.freeze({ name: "不動産広告の基準", length: 1800, width: 900 }),
});

/** 入力単位から㎡・坪・畳へ換算し、表示用の文字列を返す。 */
export function calculateArea(value, unit = "tsubo", kind = "edo", digits = 12) {
  checkDigits(digits);
  if (!Object.hasOwn(TATAMI, kind)) throw new Error("面積の単位と畳の種類を選んでください");
  if (!["sqm", "tsubo", "tatami"].includes(unit)) throw new Error("面積の単位と畳の種類を選んでください");
  const a = decimal(value);
  const mat = TATAMI[kind];
  const matN = BigInt(mat.length) * BigInt(mat.width), matD = 1000000n;
  let n = a.n, d = a.d;
  if (unit === "tsubo") { n *= 400n; d *= 121n; }
  if (unit === "tatami") { n *= matN; d *= matD; }
  return {
    sqm: format(n, d, digits),
    tsubo: format(n * 121n, d * 400n, digits),
    tatami: format(n * matD, d * matN, digits),
  };
}

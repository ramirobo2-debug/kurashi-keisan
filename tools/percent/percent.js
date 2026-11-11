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
  if (n > 1000000000000n * d || n < -1000000000000n * d) throw new Error("数値は-1兆〜1兆で入れてください");
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

/** kind: part / ratio / change / adjust。結果と式は表示用の文字列。 */
export function calculatePercent(kind, first, second, direction = "increase", digits = 12) {
  checkDigits(digits);
  const a = decimal(first), b = decimal(second);
  // 式の中の負の数はかっこで囲む
  const p = (v) => (v.startsWith("-") ? `(${v})` : v);
  const x = p(format(a.n, a.d)), y = p(format(b.n, b.d));
  let n, d, expression, unit = "", trend = "";
  if (kind === "part") {
    n = a.n * b.n; d = a.d * b.d * 100n;
    expression = `${x} × ${y} ÷ 100`;
  } else if (kind === "ratio") {
    if (b.n === 0n) throw new Error("基準の値Bは0以外にしてください");
    n = a.n * b.d * 100n; d = a.d * b.n;
    expression = `${x} ÷ ${y} × 100`; unit = "%";
  } else if (kind === "change") {
    if (a.n <= 0n) throw new Error("増減前の値Aは0より大きくしてください");
    n = (b.n * a.d - a.n * b.d) * 100n; d = b.d * a.n;
    expression = `(${y} − ${x}) ÷ ${x} × 100`; unit = "%";
    trend = n > 0n ? "増加" : n < 0n ? "減少" : "増減なし";
  } else if (kind === "adjust") {
    if (!["increase", "decrease"].includes(direction)) throw new Error("増しか減らしかを選んでください");
    if (b.n < 0n || (direction === "decrease" && b.n > 100n * b.d)) throw new Error("割合は0以上、減らす場合は100%以下にしてください");
    const sign = direction === "increase" ? 1n : -1n;
    n = a.n * (100n * b.d + sign * b.n); d = a.d * b.d * 100n;
    expression = `${x} × (1 ${sign === 1n ? "+" : "−"} ${y} ÷ 100)`;
  } else {
    throw new Error("計算の種類を選んでください");
  }
  const value = format(n, d, digits);
  return { value, formula: `${expression} = ${value}${unit}`, unit, trend };
}

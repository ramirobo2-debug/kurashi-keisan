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
  if (n > 1000000000000n * d || n < 0n) throw new Error("数値は0〜1兆で入れてください");
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

// 長さはm、重さはkgを基準とする正確な定義値。
const LENGTH = {mm:[1n,1000n],cm:[1n,100n],m:[1n,1n],km:[1000n,1n],in:[254n,10000n],ft:[3048n,10000n],yd:[9144n,10000n],mi:[1609344n,1000n]};
const WEIGHT = {g:[1n,1000n],kg:[1n,1n],lb:[45359237n,100000000n],oz:[45359237n,1600000000n]};
export function calculateInch(kind, value, unit = "in", digits = 2, extra = "0", ratio = "16:9") {
  checkDigits(digits);
  const a = decimal(value);
  if (kind === "tv") {
    if (!["16:9", "4:3", "21:9"].includes(ratio)) throw new Error("縦横比を選んでください");
    const [w,h] = ratio.split(":").map(BigInt);
    const n = a.n * 254n, d = a.d * 100n;
    // sqrt(A/B)を整数比のまま比較して四捨五入する。
    const dimension = (side) => {
      const scale = 10n ** BigInt(digits);
      const A = (n * side * scale) ** 2n, B = d*d*(w*w+h*h);
      const target = A/B;
      let lo=0n, hi=target+1n;
      while (hi-lo>1n) { const mid=(lo+hi)/2n; if(mid*mid<=target) lo=mid; else hi=mid; }
      const rounded=lo+(4n*A>=B*(2n*lo+1n)**2n?1n:0n);
      return format(rounded,scale,digits);
    };
    return {diagonal:format(n,d,digits),width:dimension(w),height:dimension(h)};
  }
  const units = kind === "length" ? LENGTH : kind === "weight" ? WEIGHT : null;
  if (!units) throw new Error("種類と単位を選んでください");
  let n=a.n, d=a.d;
  const compound = unit === "ft-in" ? ["ft","in"] : unit === "lb-oz" ? ["lb","oz"] : null;
  let from=unit;
  if (compound) {
    if (!Object.hasOwn(units,compound[0])) throw new Error("種類と単位を選んでください");
    const b=decimal(extra), factor=unit === "ft-in" ? 12n : 16n;
    n=a.n*b.d*factor+b.n*a.d; d=a.d*b.d; from=compound[1];
  }
  if (!Object.hasOwn(units,from)) throw new Error("種類と単位を選んでください");
  const [un,ud]=units[from];
  return Object.fromEntries(Object.entries(units).map(([key,[tn,td]])=>[key,format(n*un*td,d*ud*tn,digits)]));
}

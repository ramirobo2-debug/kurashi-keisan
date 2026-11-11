// 消費税の計算(ブラウザと Node の両方で使う ES モジュール)
// 金額は円の整数、税率は 8 か 10 の整数で扱う。小数を使わず、整数の割り算と余りで端数を処理する
// 端数処理: "floor"(切り捨て)/ "round"(四捨五入)/ "ceil"(切り上げ)

export const RATES = [10, 8];
export const MAX_AMOUNT = 1e12; // 1行あたりの上限(1兆円)。整数の計算が正確な範囲に収める
export const MAX_LINES = 100;
const MODES = ["floor", "round", "ceil"];

export const isAmount = (v) => Number.isSafeInteger(v) && Math.abs(v) <= MAX_AMOUNT;

function check(amount, rate, mode, allowNegative = false) {
  if (!isAmount(amount) || (!allowNegative && amount < 0)) throw new Error("金額は 0 以上、1兆円までの整数で入れてください");
  if (!RATES.includes(rate)) throw new Error("税率は 10% か 8% にしてください");
  if (!MODES.includes(mode)) throw new Error("端数の処理を選んでください");
}

/** 0 以上の整数 n を d で割り、端数を mode で処理した整数を返す */
export function divRound(n, d, mode) {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(d) || d <= 0) throw new Error("計算できない値です");
  const r = n % d, q = (n - r) / d;
  if (r === 0 || mode === "floor") return q;
  if (mode === "ceil") return q + 1;
  return 2 * r >= d ? q + 1 : q; // 四捨五入(0.5 は切り上げ)
}

/** 税抜の金額から: { excluded, tax, included } */
export function fromExcluded(excluded, rate, mode = "floor") {
  check(excluded, rate, mode);
  const tax = divRound(excluded * rate, 100, mode);
  return { excluded, tax, included: excluded + tax };
}

/** 税込の金額から: 税額 = 税込 × 税率 / (100 + 税率) を端数処理し、税抜 = 税込 − 税額 */
export function fromIncluded(included, rate, mode = "floor") {
  check(included, rate, mode);
  const tax = divRound(included * rate, 100 + rate, mode);
  return { excluded: included - tax, tax, included };
}

/**
 * 8% と 10% が混ざった明細を、インボイス(適格請求書)の決まりどおり「税率ごとに合計してから1回だけ」端数処理する
 * lines: [{ amount, rate }](amount は値引きならマイナスでよい。ただし税率ごとの合計は 0 以上)
 * basis: "excluded"(明細の金額は税抜)/ "included"(税込)
 * 返り値: { byRate: [{ rate, subtotal, excluded, tax, included, count }], excluded, tax, included }
 */
export function invoice(lines, basis = "excluded", mode = "floor") {
  if (!Array.isArray(lines)) throw new Error("明細がありません");
  if (lines.length > MAX_LINES) throw new Error(`明細は ${MAX_LINES} 行までです`);
  if (basis !== "excluded" && basis !== "included") throw new Error("金額が税抜か税込かを選んでください");
  const sums = new Map(RATES.map((r) => [r, { sum: 0, count: 0 }]));
  for (const { amount, rate } of lines) {
    check(amount, rate, mode, true);
    const s = sums.get(rate); s.sum += amount; s.count++;
  }
  const byRate = [];
  for (const rate of RATES) {
    const { sum, count } = sums.get(rate);
    if (count === 0) continue;
    if (sum < 0) throw new Error(`${rate}% の明細の合計がマイナスです`);
    if (sum > MAX_AMOUNT) throw new Error(`${rate}% の明細の合計は1兆円までです`);
    const r = basis === "excluded" ? fromExcluded(sum, rate, mode) : fromIncluded(sum, rate, mode);
    byRate.push({ rate, subtotal: sum, count, ...r });
  }
  const total = (k) => byRate.reduce((a, b) => a + b[k], 0);
  return { byRate, excluded: total("excluded"), tax: total("tax"), included: total("included") };
}

/** 1行ずつ端数処理して足した場合の税額(インボイスでは認められない数え方。比べるために使う) */
export function perLineTax(lines, basis = "excluded", mode = "floor") {
  let tax = 0;
  for (const { amount, rate } of lines) {
    check(Math.abs(amount), rate, mode);
    const f = basis === "excluded" ? fromExcluded : fromIncluded;
    const t = f(Math.abs(amount), rate, mode).tax;
    tax += amount < 0 ? -t : t;
  }
  return tax;
}

export const yen = (n) => `${n.toLocaleString("ja-JP")}円`;

/** 入力の文字列(全角数字・カンマ・「円」を含んでよい)を整数に。読めなければ null */
export function parseAmount(s) {
  const t = String(s).trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角数字
    .replace(/[－−ー]/g, "-") // 全角のマイナス・長音
    .replace(/，/g, ",").replace(/\s*円$/, "");
  // カンマは3けたごとの区切りだけを認める(「1,5」「1 000」のような入力ミスは読まない)
  if (!/^-?(\d+|\d{1,3}(,\d{3})+)$/.test(t)) return null;
  const n = Number(t.replace(/,/g, ""));
  return isAmount(n) ? n : null;
}

// 和暦・西暦の変換と年齢の計算(ブラウザと Node の両方で使う ES モジュール)
// 対応範囲: 1873年1月1日(明治6年、日本でグレゴリオ暦が使われ始めた日)以降

export const ERAS = [
  // start: その元号が始まった日(グレゴリオ暦)
  { name: "令和", roman: "R", start: [2019, 5, 1] },
  { name: "平成", roman: "H", start: [1989, 1, 8] },
  { name: "昭和", roman: "S", start: [1926, 12, 25] },
  { name: "大正", roman: "T", start: [1912, 7, 30] },
  { name: "明治", roman: "M", start: [1868, 1, 25] }, // 明治元年は1868年1月1日に遡って適用(年の計算に使う)
];

export const MIN_DATE = [1873, 1, 1];
const ETO = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ETO_YOMI = ["ね", "うし", "とら", "う", "たつ", "み", "うま", "ひつじ", "さる", "とり", "いぬ", "い"];

const cmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);

export function isValidDate(y, m, d) {
  if (![y, m, d].every(Number.isInteger)) return false;
  if (y < 1 || m < 1 || m > 12 || d < 1) return false;
  const days = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  return d <= days;
}

export function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function inRange(date) {
  return cmp(date, MIN_DATE) >= 0;
}

/** 西暦の日付 → 和暦 { era, year, label }。範囲外は null */
export function toWareki(y, m, d) {
  if (!isValidDate(y, m, d) || !inRange([y, m, d])) return null;
  const era = ERAS.find((e) => cmp([y, m, d], e.start) >= 0);
  const year = y - era.start[0] + 1;
  return { era: era.name, year, label: `${era.name}${year === 1 ? "元" : year}年${m}月${d}日` };
}

/** 和暦 → 西暦の日付 [y, m, d]。その元号に存在しない日付や範囲外は null */
export function toSeireki(eraName, eraYear, m, d) {
  const idx = ERAS.findIndex((e) => e.name === eraName);
  if (idx < 0 || !Number.isInteger(eraYear) || eraYear < 1) return null;
  const era = ERAS[idx];
  const y = era.start[0] + eraYear - 1;
  if (!isValidDate(y, m, d) || !inRange([y, m, d])) return null;
  if (cmp([y, m, d], era.start) < 0) return null; // 元号が始まる前
  const next = ERAS[idx - 1]; // ひとつ新しい元号
  if (next && cmp([y, m, d], next.start) >= 0) return null; // 次の元号に変わったあと
  return [y, m, d];
}

/** 西暦の年 → その年にあった和暦の一覧(改元の年は2つ) */
export function yearToWareki(y) {
  if (!Number.isInteger(y) || y < 1868) return [];
  const out = [];
  for (const era of [...ERAS].reverse()) {
    const lastEraYear = ERAS[ERAS.indexOf(era) - 1]?.start[0] ?? Infinity;
    if (y >= era.start[0] && y <= lastEraYear) {
      const n = y - era.start[0] + 1;
      out.push(`${era.name}${n === 1 ? "元" : n}年`);
    }
  }
  return out; // 古い元号から順。改元の年だけ2つになる
}

/** 満年齢(基準日の時点)。日本の法律に合わせ、誕生日の前日が終わった時点で1つ増える
 *  → 2月29日生まれは、うるう年でない年は3月1日に1つ増える扱い(誕生日の「当日」判定と同じ結果) */
export function age(birth, ref) {
  if (!isValidDate(...birth) || !isValidDate(...ref) || !inRange(birth)) return null;
  if (cmp(ref, birth) < 0) return null;
  let a = ref[0] - birth[0];
  if (ref[1] < birth[1] || (ref[1] === birth[1] && ref[2] < birth[2])) a -= 1;
  return a;
}

/** 数え年(生まれた年を1歳とし、元日ごとに1つ増える) */
export function kazoe(birthYear, refYear) {
  if (refYear < birthYear) return null;
  return refYear - birthYear + 1;
}

/** 干支(十二支) */
export function eto(y) {
  const i = (((y - 4) % 12) + 12) % 12;
  return { kanji: ETO[i], yomi: ETO_YOMI[i] };
}

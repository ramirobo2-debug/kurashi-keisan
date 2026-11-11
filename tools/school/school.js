// 入学・卒業年の計算(ブラウザと Node の両方で使う ES モジュール)
import { toWareki, toSeireki } from "../wareki/wareki.js";

/** 生年月日 → 標準的な進学の一覧。不正な日付・範囲外は null */
export function schoolYears(y, m, d) {
  if (!toWareki(y, m, d) || y > 9976) return null;
  const first = y + (m < 4 || (m === 4 && d === 1) ? 6 : 7);
  const term = (year, month) => {
    const w = toWareki(year, month, 1);
    return { year, month, wareki: `${w.era}${w.year === 1 ? "元" : w.year}年` };
  };
  return [
    ["小学校", 0, 6], ["中学校", 6, 9],
    ["高校", 9, 12], ["大学(4年制)", 12, 16],
  ].map(([school, start, end]) => ({
    school, entrance: term(first + start, 4), graduation: term(first + end, 3),
  }));
}

/** 和暦の生年月日 → 標準的な進学の一覧 */
export function warekiSchoolYears(era, year, month, day) {
  const date = toSeireki(era, year, month, day);
  return date ? schoolYears(...date) : null;
}

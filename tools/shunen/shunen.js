import { ERAS, isValidDate, yearToWareki, toWareki, toSeireki } from "../wareki/wareki.js";
import { diffDays } from "../days/days.js";

export function integer(value) {
  const s = String(value).trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/，/g, ',');
  if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(s)) throw new RangeError("正しい整数・年・日付を入力してください");
  return Number(s.replace(/,/g, ''));
}
export function today() {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}
export function parseReference(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError("正しい整数・年・日付を入力してください");
  return value.split('-').map(Number);
}
const anniversary = (y, m, d) => [y, m, Math.min(d, new Date(Date.UTC(y, m, 0)).getUTCDate())];
export function calculateShunen({ year, era = '', month = '', day = '' }, reference = today()) {
  let y = integer(year);
  const hasDate = String(month).trim() !== '' || String(day).trim() !== '';
  const m = hasDate ? integer(month) : null;
  const d = hasDate ? integer(day) : null;
  if (era) {
    const e = ERAS.find(e => e.name === era);
    if (!e || y < 1) throw new RangeError("正しい整数・年・日付を入力してください");
    const n = y;
    y = e.start[0] + n - 1;
    if (!yearToWareki(y).includes(`${era}${n === 1 ? '元' : n}年`)) throw new RangeError("正しい整数・年・日付を入力してください");

    if (hasDate && !toSeireki(era, n, m, d)) throw new RangeError("正しい整数・年・日付を入力してください");
  }
  if (y < 1868 || y > 2099) throw new RangeError("始まりの年は1868〜2099年で入れてください");
  if (!Array.isArray(reference) || reference.length !== 3 || !isValidDate(...reference) || reference[0] < 1868 || reference[0] > 9999) throw new RangeError("正しい整数・年・日付を入力してください");
  if (hasDate && !isValidDate(y, m, d)) throw new RangeError("正しい整数・年・日付を入力してください");
  if (reference[0] < y || (hasDate && diffDays([y, m, d], reference) < 0)) throw new RangeError("基準日は始まり以降にしてください");
  const years = reference[0] - y;
  const result = { year: y, years, ordinal: years + 1,
    wareki: hasDate && toWareki(y, m, d) ? toWareki(y, m, d).label : yearToWareki(y).join('・'),
    milestones: [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 100].filter(n => n > years).map(n => ({ years: n, year: y + n, after: y + n - reference[0] })) };
  if (hasDate) {
    result.anniversary = anniversary(reference[0], m, d);
    result.until = diffDays(reference, result.anniversary);
    result.next = result.until < 0 ? anniversary(reference[0] + 1, m, d) : result.anniversary;
    result.untilNext = diffDays(reference, result.next);
  }
  return result;
}

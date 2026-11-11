import { isValidDate, diffDays, addDays, toDayNum } from "../days/days.js";

export function today() {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}
const clamp = (y, m, d) => [y, m, Math.min(d, new Date(Date.UTC(y, m, 0)).getUTCDate())];
function check(date, birth = false) {
  if (!Array.isArray(date) || date.length !== 3 || !isValidDate(...date) || date[0] < 1900 || date[0] > (birth ? 2099 : 9999)) {
    throw new RangeError(birth ? "生年月日は1900〜2099年の存在する日付を入れてください" : "基準日は1900〜9999年の存在する日付を入れてください");
  }
}
/** 同じ日がない月は月末にそろえて満年齢を計算する。 */
export function calculateBirthDays(birth, reference = today()) {
  check(birth, true); check(reference);
  const elapsed = diffDays(birth, reference);
  if (elapsed < 0) throw new RangeError("基準日は生年月日以降にしてください");
  const [y, m, d] = birth;
  let years = reference[0] - y;
  if (toDayNum(clamp(y + years, m, d)) > toDayNum(reference)) years--;
  let months = 0;
  const anniversary = n => {
    const total = m - 1 + n;
    return clamp(y + years + Math.floor(total / 12), total % 12 + 1, d);
  };
  while (months < 11 && toDayNum(anniversary(months + 1)) <= toDayNum(reference)) months++;
  const age = { years, months, days: diffDays(anniversary(months), reference) };
  let nextBirthday = clamp(reference[0], m, d);
  if (diffDays(reference, nextBirthday) < 0) nextBirthday = clamp(reference[0] + 1, m, d);
  return { elapsed, ordinal: elapsed + 1, age, nextBirthday,
    untilBirthday: diffDays(reference, nextBirthday), leapDay: m === 2 && d === 29,
    milestones: [100, 1000, 5000, 10000, 20000, 30000].map(days => {
      const date = addDays(birth, days);
      return { days, date, passed: diffDays(date, reference) >= 0 };
    }) };
}

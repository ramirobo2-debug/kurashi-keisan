import { toWareki } from "../wareki/wareki.js";
import { addDays, weekdayName, holidayName } from "../days/days.js";

/** 生まれた日を1日目として計算。不正入力は null。 */
export function babyEvents(y, m, d, sex = "none") {
  if (!toWareki(y, m, d) || y > 9998 || !["none", "male", "female"].includes(sex)) return null;
  const row = (name, date, note = "") => ({ name, date, wareki: toWareki(...date).label,
    weekday: weekdayName(date), holiday: holidayName(date), note });
  const rows = [row("お七夜", addDays([y, m, d], 6))];
  if (sex !== "female") rows.push(row("お宮参り(男の子)", addDays([y, m, d], 30)));
  if (sex !== "male") rows.push(row("お宮参り(女の子)", addDays([y, m, d], 31)));
  rows.push(row("生後100日目(お食い初め・百日祝い)", addDays([y, m, d], 99)));
  const halfYear = y + (m > 6 ? 1 : 0), halfMonth = (m + 5) % 12 + 1;
  const lastDay = new Date(Date.UTC(halfYear, halfMonth, 0)).getUTCDate();
  rows.push(row("ハーフバースデー", [halfYear, halfMonth, Math.min(d, lastDay)],
    d > lastDay ? "同じ日がないため、その月の末日と表示しています。" : ""));
  const leapDay = m === 2 && d === 29;
  rows.push(row("1歳の誕生日", [y + 1, m, leapDay ? 28 : d],
    leapDay ? "2月29日生まれのため2月28日と表示。法律上は2月28日の終わりに1歳になる。" : ""));
  for (const [kind, month, day] of [["女の子", 3, 3], ["男の子", 5, 5]]) {
    if ((sex === "male" && month === 3) || (sex === "female" && month === 5)) continue;
    const year = y + (m > month || (m === month && d > day) ? 1 : 0);
    rows.push(row(`初節句(${kind})`, [year, month, day], "生後すぐの場合は翌年にすることも多い行事です。"));
  }
  return rows;
}

import { isValidDate, addDays, diffDays, formatDate, holidayName } from "../days/days.js";
import { toWareki } from "../wareki/wareki.js";

/** 日付は [年, 月, 日]。周期補正を含む概算。 */
export function calculateDueDate(start, cycle = 28, reference = start, multiple = false) {
  for (const date of [start, reference]) {
    if (!Array.isArray(date) || date.length !== 3 || !isValidDate(...date) || !toWareki(...date) || date[0] > 9998)
      throw new RangeError("日付を1873〜9998年の有効な日付で入力してください。");
  }
  if (!Number.isInteger(cycle) || cycle < 21 || cycle > 45) throw new RangeError("月経周期は21〜45日の整数で入力してください。");
  if (typeof multiple !== "boolean") throw new TypeError("多胎の指定が不正です。");
  const due = addDays(start, 280 + cycle - 28);
  const remaining = diffDays(reference, due);
  const gestationDays = 280 - remaining;
  const weeks = gestationDays >= 0 && gestationDays <= 308 ? Math.floor(gestationDays / 7) : null;
  const row = (name, date) => ({ name, date, wareki: toWareki(...date).label, weekday: formatDate(date), holiday: holidayName(date) });
  return {
    due, remaining, gestationDays, weeks,
    days: weeks === null ? null : gestationDays % 7,
    // 妊娠月数は10か月(36〜39週)までで、40週以降も10か月として扱う
    months: weeks === null ? null : Math.min(Math.floor(weeks / 4) + 1, 10),
    rows: [row("出産予定日", due),
      ...[[12, 0], [16, 0], [22, 0], [28, 0], [37, 0], [41, 6]].map(([w, d]) =>
        row(`${w}週${d}日${w === 37 ? "(正期産の始まり)" : w === 41 ? "(正期産の終わり)" : ""}`, addDays(due, w * 7 + d - 280))),
      row("産前休業の開始(目安)", addDays(due, multiple ? -97 : -41)),
      row("産後休業の終わり(予定日に出産した場合)", addDays(due, 56))],
  };
}

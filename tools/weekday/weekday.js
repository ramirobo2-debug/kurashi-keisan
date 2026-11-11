import { isValidDate, toWareki, toSeireki } from "../wareki/wareki.js";
import { weekdayName, toDayNum, holidayName } from "../days/days.js";

// 和暦ツールと同じ開始日。Date の表現範囲を超えないよう上限を定める。
export function dateInfo(y, m, d) {
  if (!isValidDate(y, m, d) || y < 1873 || y > 9999) return null;
  const date = [y, m, d];
  return {
    date,
    wareki: toWareki(y, m, d).label,
    weekday: `${weekdayName(date)}曜日`,
    dayOfYear: toDayNum(date) - toDayNum([y, 1, 1]) + 1,
    holiday: holidayName(date),
  };
}

export function warekiDateInfo(era, year, m, d) {
  const date = toSeireki(era, year, m, d);
  return date ? dateInfo(...date) : null;
}

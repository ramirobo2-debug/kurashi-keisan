import { toWareki, toSeireki, isLeap } from "../wareki/wareki.js";
import { addDays, weekdayName, holidayName } from "../days/days.js";

/** 命日から三十三回忌まで。不正入力は null。 */
export function houyouDates(y, m, d, previous = false) {
  if (!toWareki(y, m, d) || y > 9967 || typeof previous !== "boolean") return null;
  const days = [["初七日", 7], ["二七日", 14], ["三七日", 21], ["四七日", 28],
    ["五七日", 35], ["六七日", 42], ["四十九日", 49], ["百か日", 100]];
  const years = [["一周忌", 1], ["三回忌", 2], ["七回忌", 6], ["十三回忌", 12],
    ["十七回忌", 16], ["二十三回忌", 22], ["二十七回忌", 26], ["三十三回忌", 32]];
  const row = (name, date, note = "") => ({ name, date, wareki: toWareki(...date).label,
    weekday: weekdayName(date), holiday: holidayName(date), note });
  return [
    ...days.map(([name, n]) => row(name, addDays([y, m, d], n - (previous ? 2 : 1)))),
    ...years.map(([name, n]) => {
      const adjusted = m === 2 && d === 29 && !isLeap(y + n);
      return row(name, [y + n, m, adjusted ? 28 : d],
        adjusted ? "命日が2月29日のため、平年は2月28日と表示しています。" : "");
    }),
  ];
}

export function warekiHouyouDates(era, year, month, day, previous = false) {
  const date = toSeireki(era, year, month, day);
  return date ? houyouDates(...date, previous) : null;
}

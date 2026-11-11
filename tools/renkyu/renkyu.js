import { weekday, holidayName, toDayNum, fromDayNum } from "../days/days.js";

export function calculateRenkyu(year, minimum = 3, yearEnd = false, paidLeave = false) {
  if ((typeof year !== "string" && typeof year !== "number") || !/^[0-9]{4}$/.test(String(year)) || Number(year) < 2000 || Number(year) > 2099) throw new RangeError("年は2000〜2099の整数を入れてください");
  year = Number(year);
  if (![3, 4, 5].includes(minimum) || typeof yearEnd !== "boolean" || typeof paidLeave !== "boolean") throw new RangeError("日数と休みの設定を確認してください");
  const first = toDayNum([year, 1, 1]), last = toDayNum([year, 12, 31]);
  const name = date => date[0] < 2000 || date[0] > 2099 ? (date[1] === 1 && date[2] === 1 ? "元日" : null) : holidayName(date);
  const off = n => { const d = fromDayNum(n), w = weekday(d); return w === 0 || w === 6 || !!name(d) || (yearEnd && ((d[1] === 12 && d[2] >= 29) || (d[1] === 1 && d[2] <= 3))); };
  const make = (a, b) => {
    const holidays = [];
    for (let n = a; n <= b; n++) { const h = name(fromDayNum(n)); if (h && !holidays.includes(h)) holidays.push(h); }
    return { start: fromDayNum(a), end: fromDayNum(b), days: b - a + 1, holidays };
  };
  const periods = [], bridges = [];
  for (let n = first - 14; n <= last + 14; n++) {
    if (!off(n) || off(n - 1)) continue;
    const a = n;
    while (off(n + 1)) n++;
    if (a >= first && a <= last && n - a + 1 >= minimum) periods.push(make(a, n));
  }
  if (paidLeave) for (let n = first; n <= last; n++) {
    if (off(n) || !off(n - 1) || !off(n + 1)) continue;
    let a = n - 1, b = n + 1;
    while (off(a - 1)) a--;
    while (off(b + 1)) b++;
    if (a >= first && a <= last && b - a + 1 >= minimum) bridges.push({ ...make(a, b), leave: fromDayNum(n) });
  }
  return { periods, bridges };
}

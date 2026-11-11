import { weekday, toDayNum, fromDayNum } from "../days/days.js";

export function nthWeekday(y, m, w, n) {
  if ((typeof y !== "string" && typeof y !== "number") || !/^[0-9]{4}$/.test(String(y)) || Number(y) < 2000 || Number(y) > 2099) throw new RangeError("年は2000〜2099の整数を入れてください");
  y = Number(y);
  if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(w) || w < 0 || w > 6 || ![-1, 1, 2, 3, 4, 5].includes(n)) throw new RangeError("月・曜日・第何の設定を確認してください");
  const last = fromDayNum(toDayNum([y, m + 1, 1]) - 1)[2];
  if (n === -1) return last - (weekday([y, m, last]) - w + 7) % 7;
  const day = 1 + (w - weekday([y, m, 1]) + 7) % 7 + 7 * (n - 1);
  return day <= last ? day : null;
}

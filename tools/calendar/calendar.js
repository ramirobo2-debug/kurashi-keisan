import { isValidDate, weekday, holidayName, HOLIDAY_MIN_YEAR, HOLIDAY_MAX_YEAR } from "../days/days.js";
import { yearToWareki } from "../wareki/wareki.js";

export function monthGrid(y, m, startMonday = false) {
  if (!Number.isInteger(y) || y < HOLIDAY_MIN_YEAR || y > HOLIDAY_MAX_YEAR || !isValidDate(y, m, 1)) return null;
  const cells = Array((weekday([y, m, 1]) + (startMonday ? 6 : 0)) % 7).fill(null);
  for (let d = 1; isValidDate(y, m, d); d++) cells.push({ d, w: weekday([y, m, d]), holiday: holidayName([y, m, d]) });
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

export function calendarHeading(y, m) {
  if (!monthGrid(y, m)) return null;
  return `${y}年(${yearToWareki(y).join("・")})${m}月`;
}

import { weekday, holidayName, addDays } from "../days/days.js";

export function annualHolidays(year, { saturday = true, sunday = true, holidays = true, newYear = false } = {}) {
  if (!["string", "number"].includes(typeof year)) throw new RangeError("年は2000〜2099の整数を入れてください");
  const normalized = String(year).trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (!/^(?:[0-9]{4}|[0-9],[0-9]{3})$/.test(normalized)) throw new RangeError("年は2000〜2099の整数を入れてください");
  year = Number(normalized.replace(/,/g, ""));
  if (year < 2000 || year > 2099) throw new RangeError("年は2000〜2099の整数を入れてください");
  if (![saturday, sunday, holidays, newYear].every(v => typeof v === "boolean")) throw new RangeError("休日の設定を確認してください");
  const breakdown = { sunday: 0, saturday: 0, holidays: 0, newYear: 0 };
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, holidays: 0, businessDays: 0 }));
  for (let date = [year, 1, 1]; date[0] === year; date = addDays(date, 1)) {
    const w = weekday(date), [, m, d] = date;
    const category = sunday && w === 0 ? "sunday" : saturday && w === 6 ? "saturday" : holidays && holidayName(date) ? "holidays" : newYear && (m === 1 && d <= 3 || m === 12 && d >= 29) ? "newYear" : null;
    if (category) { breakdown[category]++; months[m - 1].holidays++; }
    else months[m - 1].businessDays++;
  }
  return { year, holidays: months.reduce((n, m) => n + m.holidays, 0), businessDays: months.reduce((n, m) => n + m.businessDays, 0), breakdown, months };
}

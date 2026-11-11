export const MAX_LINES = 31;
function time(value) {
  if (typeof value !== "string" || !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("開始・終了の時刻を入れてください");
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function integer(value, max, name) {
  if (!["string", "number"].includes(typeof value) || !/^\d+$/.test(String(value).trim())) throw new Error(`${name}は0〜${max}の整数で入れてください`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n > max) throw new Error(`${name}は0〜${max}の整数で入れてください`);
  return n;
}
export const formatMinutes = n => `${Math.floor(n / 60)}時間${n % 60}分`;
export function calculateJikan(lines, wage = "") {
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > MAX_LINES) throw new Error("勤務を1〜31行入れてください");
  const daily = lines.map((line, i) => {
    try {
      if (!line || typeof line !== "object") throw new Error("勤務を入力してください");
      const start = time(line.start), endTime = time(line.end);
      if (start === endTime) throw new Error("開始と終了は異なる時刻にしてください");
      const end = endTime < start ? endTime + 1440 : endTime;
      const rest = integer(line.rest, 1439, "休憩(分)");
      if (rest >= end - start) throw new Error("休憩は開始から終了までの長さより短くしてください");
      // 休憩の時刻が不明なため、深夜は休憩前の重複時間。
      const overlap = (a, b) => Math.max(0, Math.min(end, b) - Math.max(start, a));
      return { minutes: end - start - rest, nightMinutes: overlap(0, 300) + overlap(1320, 1740) + overlap(2760, 2880) };
    } catch (error) { throw new Error(`${i + 1}行目: ${error.message}`); }
  });
  const minutes = daily.reduce((s, r) => s + r.minutes, 0);
  const nightMinutes = daily.reduce((s, r) => s + r.nightMinutes, 0);
  const hundredths = Math.floor((minutes * 100 + 30) / 60);
  const decimalHours = `${Math.floor(hundredths / 100)}.${String(hundredths % 100).padStart(2, "0")}`;
  const pay = wage === "" ? null : Math.floor(minutes * integer(wage, 1000000, "時給") / 60);
  return { daily, minutes, nightMinutes, decimalHours, pay };
}

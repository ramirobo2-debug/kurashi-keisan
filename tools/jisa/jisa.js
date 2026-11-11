export const CITIES = [
  ["Asia/Tokyo", "東京"], ["America/New_York", "ニューヨーク"],
  ["America/Los_Angeles", "ロサンゼルス"], ["Europe/London", "ロンドン"],
  ["Europe/Paris", "パリ"], ["Australia/Sydney", "シドニー"],
  ["Pacific/Honolulu", "ホノルル"], ["Asia/Seoul", "ソウル"],
  ["Asia/Shanghai", "上海"], ["Asia/Bangkok", "バンコク"],
  ["Asia/Singapore", "シンガポール"], ["Asia/Dubai", "ドバイ"]
];
const formatters = new Map();
function validateZone(zone) {
  if (!CITIES.some(([id]) => id === zone)) throw new Error("都市を選んでください");
}
export function localParts(instant, zone) {
  validateZone(zone);
  if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }));
  const p = Object.fromEntries(formatters.get(zone).formatToParts(instant).map(({type, value}) => [type, value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`,
    wall: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) };
}
const offset = (instant, zone) => (localParts(instant, zone).wall - instant) / 60000;
/** オフセットを2回適用し、候補を往復確認する。 */
export function resolveWallTime(date, time, zone = "Asia/Tokyo") {
  validateZone(zone);
  if (typeof date !== "string" || typeof time !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error("日付と時刻を入れてください");
  const [y, m, d] = date.split("-").map(Number), [h, min] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min), dt = new Date(wall);
  if (y < 1900 || y > 2099 || dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d || h > 23 || min > 59) throw new Error("1900〜2099年の有効な日付と時刻を入れてください");
  const first = wall - offset(wall, zone) * 60000;
  const second = wall - offset(first, zone) * 60000;
  const offsets = new Set([offset(first, zone), offset(second, zone), offset(second - 86400000, zone), offset(second + 86400000, zone)]);
  const candidates = [...offsets].map((o) => wall - o * 60000).filter((t) => localParts(t, zone).wall === wall).sort((a, b) => a - b);
  if (!candidates.length) return { instant: null, warning: "夏時間の切り替えにより存在しない時刻です。別の時刻を入れてください。" };
  return { instant: candidates[0], warning: candidates.length > 1 ? "夏時間の切り替えにより2回ある時刻です。早い方の時刻で換算しています。" : "" };
}
export function calculateJisa(date, time, base = "Asia/Tokyo", zones = CITIES.slice(1).map(([id]) => id)) {
  if (!Array.isArray(zones)) throw new Error("表示する都市を選んでください");
  zones.forEach(validateZone);
  const resolved = resolveWallTime(date, time, base);
  if (resolved.instant === null) return { ...resolved, rows: [] };
  const t = resolved.instant, japan = localParts(t, "Asia/Tokyo");
  const rows = zones.map((zone) => {
    const p = localParts(t, zone), year = new Date(t).getUTCFullYear();
    // その年の毎月1日・15日のうち最も小さいオフセットを標準時とみなす(1974年の米国のように1月15日が夏時間の年に備える)
    const standard = Math.min(...Array.from({ length: 24 }, (_, i) => offset(Date.UTC(year, i >> 1, i % 2 ? 15 : 1), zone)));
    return { zone, name: CITIES.find(([id]) => id === zone)[1], date: p.date, time: p.time,
      weekday: "日月火水木金土"[new Date(p.wall).getUTCDay()],
      difference: (offset(t, zone) - offset(t, "Asia/Tokyo")) / 60,
      daylight: offset(t, zone) > standard,
      dayLabel: p.date < japan.date ? "前日" : p.date > japan.date ? "翌日" : "" };
  });
  return { ...resolved, rows };
}
export function formatCity(row) {
  return `${row.name}: ${row.date}(${row.weekday}) ${row.time}${row.dayLabel ? " " + row.dayLabel : ""} / 日本との時差 ${row.difference > 0 ? "+" : row.difference < 0 ? "−" : ""}${Math.abs(row.difference)}時間${row.daylight ? "(夏時間)" : ""}`;
}

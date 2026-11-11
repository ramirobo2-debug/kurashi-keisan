// 日数・営業日の計算(ブラウザと Node の両方で使う ES モジュール)
// 日付は [年, 月, 日] の配列で扱う。内部では 1970-01-01 からの日数(UTC)に直して計算する
// 祝日は 2000〜2099 年に対応(祝日法の改正・2019〜2021 年の特例を含む)。春分・秋分の日は計算式による予測で、
// 正式には前年の2月に官報で公表される

export const HOLIDAY_MIN_YEAR = 2000;
export const HOLIDAY_MAX_YEAR = 2099;
const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export function isValidDate(y, m, d) {
  if (![y, m, d].every(Number.isInteger) || y < 1 || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export const toDayNum = ([y, m, d]) => {
  const t = new Date(Date.UTC(2000, m - 1, d));
  t.setUTCFullYear(y); // Date.UTC は 0〜99 年を 1900 年代とみなすので、年は後から入れる
  return Math.round(t.getTime() / 86400000);
};
export const fromDayNum = (n) => {
  const t = new Date(n * 86400000);
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
};
export const weekday = (date) => ((toDayNum(date) % 7) + 11) % 7; // 0=日 … 6=土(1970-01-01 は木曜)
export const weekdayName = (date) => WEEK[weekday(date)];
const key = ([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
export const formatDate = (date) => `${date[0]}年${date[1]}月${date[2]}日(${weekdayName(date)})`;

/** その月の第 n 月曜日の日 */
function nthMonday(y, m, n) {
  const w = weekday([y, m, 1]);
  return 1 + ((8 - w) % 7) + 7 * (n - 1);
}

/** 春分の日・秋分の日(1980〜2099 年で使える近似式) */
export function equinoxDay(y, autumn) {
  const base = autumn ? 23.2488 : 20.8431;
  return Math.floor(base + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
}

const cache = new Map();
const MAX_STEPS = 100000; // ◯日後・◯営業日後で受け付ける最大の数(約270年分)

/** 存在しない日付(2月30日など)を例外にする */
function check(date) {
  if (!Array.isArray(date) || !isValidDate(...date)) throw new RangeError("存在しない日付です");
}

/** その年の祝日・休日の一覧 Map("YYYY-MM-DD" → 名前)。対応範囲外の年は null */
export function holidaysOfYear(y) {
  if (!Number.isInteger(y) || y < HOLIDAY_MIN_YEAR || y > HOLIDAY_MAX_YEAR) return null;
  if (cache.has(y)) return new Map(cache.get(y)); // 呼び出し側が変更してもキャッシュが壊れないよう、写しを返す
  const named = new Map();
  const add = (m, d, name) => named.set(key([y, m, d]), name);

  add(1, 1, "元日");
  add(1, nthMonday(y, 1, 2), "成人の日");
  add(2, 11, "建国記念の日");
  if (y >= 2020) add(2, 23, "天皇誕生日");
  add(3, equinoxDay(y, false), "春分の日");
  add(4, 29, y >= 2007 ? "昭和の日" : "みどりの日");
  add(5, 3, "憲法記念日");
  if (y >= 2007) add(5, 4, "みどりの日");
  add(5, 5, "こどもの日");
  if (y === 2020) add(7, 23, "海の日");
  else if (y === 2021) add(7, 22, "海の日");
  else if (y >= 2003) add(7, nthMonday(y, 7, 3), "海の日");
  else add(7, 20, "海の日");
  if (y === 2020) add(8, 10, "山の日");
  else if (y === 2021) add(8, 8, "山の日");
  else if (y >= 2016) add(8, 11, "山の日");
  add(9, y >= 2003 ? nthMonday(y, 9, 3) : 15, "敬老の日");
  add(9, equinoxDay(y, true), "秋分の日");
  if (y === 2020) add(7, 24, "スポーツの日");
  else if (y === 2021) add(7, 23, "スポーツの日");
  else add(10, nthMonday(y, 10, 2), y >= 2020 ? "スポーツの日" : "体育の日");
  add(11, 3, "文化の日");
  add(11, 23, "勤労感謝の日");
  if (y <= 2018) add(12, 23, "天皇誕生日");
  if (y === 2019) {
    add(5, 1, "天皇の即位の日");
    add(10, 22, "即位礼正殿の儀の行われる日");
  }

  const all = new Map(named);
  // 振替休日: 祝日が日曜日のとき、その日より後で最も近い「祝日でない日」を休日にする
  for (const k of [...named.keys()].sort()) {
    const date = k.split("-").map(Number);
    if (weekday(date) !== 0) continue;
    let n = toDayNum(date) + 1;
    while (all.has(key(fromDayNum(n)))) n++;
    const sub = fromDayNum(n);
    if (sub[0] === y) all.set(key(sub), "休日(振替休日)");
  }
  // 国民の休日: 前日と翌日が祝日で、その日が祝日・日曜日でないとき
  const start = toDayNum([y, 1, 2]), end = toDayNum([y, 12, 30]);
  for (let n = start; n <= end; n++) {
    const date = fromDayNum(n), k = key(date);
    if (all.has(k) || weekday(date) === 0) continue;
    if (named.has(key(fromDayNum(n - 1))) && named.has(key(fromDayNum(n + 1)))) all.set(k, "休日(国民の休日)");
  }
  const sorted = new Map([...all.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
  cache.set(y, sorted);
  return new Map(sorted);
}

/** 祝日・休日ならその名前、そうでなければ null。対応範囲外の年は undefined */
export function holidayName(date) {
  check(date);
  if (!Number.isInteger(date[0]) || date[0] < HOLIDAY_MIN_YEAR || date[0] > HOLIDAY_MAX_YEAR) return undefined;
  holidaysOfYear(date[0]);
  return cache.get(date[0]).get(key(date)) ?? null;
}

/** date の n 日後(n が負なら前)の日付 */
export function addDays(date, n) {
  check(date);
  if (!Number.isSafeInteger(n) || Math.abs(n) > MAX_STEPS * 2) throw new RangeError("日数が大きすぎます");
  return fromDayNum(toDayNum(date) + n);
}

/** a から b までの日数(b − a)。inclusive が true なら初日も数える(+1) */
export function diffDays(a, b, inclusive = false) {
  check(a); check(b);
  const n = toDayNum(b) - toDayNum(a);
  return inclusive ? n + (n >= 0 ? 1 : -1) : n;
}

/**
 * 営業日かどうか。opts: { saturday: 土曜を休みにする(既定 true), holidays: 祝日を休みにする(既定 true),
 *   yearEnd: 年末年始(12/29〜1/3)を休みにする(既定 false) }
 * 祝日を休みにする設定で、対応範囲外の年に当たったときは例外を投げる
 */
export function isBusinessDay(date, opts = {}) {
  check(date);
  const { saturday = true, holidays = true, yearEnd = false } = opts;
  if (holidays && (date[0] < HOLIDAY_MIN_YEAR || date[0] > HOLIDAY_MAX_YEAR)) {
    throw new RangeError(`祝日は ${HOLIDAY_MIN_YEAR}〜${HOLIDAY_MAX_YEAR} 年に対応しています`);
  }
  const w = weekday(date);
  if (w === 0 || (saturday && w === 6)) return false;
  if (yearEnd) {
    const [, m, d] = date;
    if ((m === 12 && d >= 29) || (m === 1 && d <= 3)) return false;
  }
  if (holidays && holidayName(date)) return false;
  return true;
}

/** a から b まで(両端を含む)の営業日の数。a > b なら 0 */
export function countBusinessDays(a, b, opts = {}) {
  let count = 0;
  for (let n = toDayNum(a), end = toDayNum(b); n <= end; n++) if (isBusinessDay(fromDayNum(n), opts)) count++;
  return count;
}

/** date の n 営業日後(n が負なら前)の日付。date 自身は数えない */
export function addBusinessDays(date, n, opts = {}) {
  check(date);
  if (!Number.isInteger(n)) throw new TypeError("営業日の数は整数で指定してください");
  if (Math.abs(n) > MAX_STEPS) throw new RangeError(`営業日の数は ${MAX_STEPS} までにしてください`);
  let d = toDayNum(date);
  const step = n >= 0 ? 1 : -1;
  for (let left = Math.abs(n); left > 0; ) {
    d += step;
    if (isBusinessDay(fromDayNum(d), opts)) left--;
  }
  return fromDayNum(d);
}

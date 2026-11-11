const FACTORS = { kmh: 1000000n, ms: 3600000n, knot: 1852000n, mph: 1609344n };
const ERROR = '正しい数値を100文字以内で入力してください(カンマは3桁区切り)';
function decimal(value) {
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(ERROR);
  const s = String(value).trim().replace(/[０-９．＋，]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (s.length > 100 || !/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?|\.\d+)$/.test(s)) throw new Error(ERROR);
  const [a, b = ''] = s.replace(/^\+/, '').replaceAll(',', '').split('.');
  return [BigInt((a || '0') + b), 10n ** BigInt(b.length)];
}
function positive(value) {
  const r = decimal(value);
  if (!r[0]) throw new Error('速度・距離・タイム・ペースは0より大きくしてください');
  return r;
}
function rounded(n, d) {
  const v = (n * 100n * 2n + d) / (2n * d);
  return `${v / 100n}.${String(v % 100n).padStart(2, '0')}`;
}
export function convertSpeed(value, unit = 'kmh') {
  if (typeof unit !== 'string' || !Object.hasOwn(FACTORS, unit)) throw new Error('正しい速度の単位を選んでください');
  const [n, d] = positive(value);
  return Object.fromEntries(Object.entries(FACTORS).map(([key, factor]) => [key, rounded(n * FACTORS[unit], d * factor)]));
}
function component(value, limit, integer = false) {
  const [n, d] = decimal(value);
  if ((integer && n % d !== 0n) || (limit !== null && n >= limit * d)) throw new Error('時・分は整数、秒は0以上60未満で入力してください(タイムの分も60未満)');
  return [n, d];
}
function duration(n, d, pace) {
  const ticks = n * 10n / d;
  const seconds = `${ticks / 10n % 60n}.${ticks % 10n}`;
  return pace ? `${ticks / 600n}分${seconds}秒/km` : `${ticks / 36000n}時間${ticks / 600n % 60n}分${seconds}秒`;
}
export function calculatePace(distance, mode, { hours = 0, minutes = 0, seconds = 0 } = {}) {
  const [dn, dd] = positive(distance);
  if (!['time', 'pace'].includes(mode)) throw new Error('タイムかペースを選んでください');
  const [h, hd] = mode === 'time' ? component(hours, null, true) : [0n, 1n];
  const [m, md] = component(minutes, mode === 'time' ? 60n : null, true);
  const [s, sd] = component(seconds, 60n);
  const n = h * 3600n * md * sd + m * 60n * hd * sd + s * hd * md;
  const d = hd * md * sd;
  if (!n) throw new Error('タイム・ペースは0より大きくしてください');
  const tn = mode === 'time' ? n : n * dn;
  const td = mode === 'time' ? d : d * dd;
  const pn = mode === 'pace' ? n : n * dd;
  const pd = mode === 'pace' ? d : d * dn;
  return { time: duration(tn, td, false), pace: duration(pn, pd, true), speed: rounded(dn * 3600n * td, dd * tn) };
}

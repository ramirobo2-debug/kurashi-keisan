// 各単位の容量を10^-10 mL単位の整数で保持し、表示時だけ丸める。
const FACTORS = { ml: 10000000000n, l: 10000000000000n, cm3: 10000000000n, m3: 10000000000000000n, usgal: 37854117840000n, ukgal: 45460900000000n, usoz: 295735295625n, ukoz: 284130625000n, uspt: 4731764730000n };
export const LABELS = {"ml": "mL", "l": "L", "cm3": "立方cm", "m3": "立方m", "usgal": "米ガロン", "ukgal": "英ガロン", "usoz": "米液量オンス", "ukoz": "英液量オンス", "uspt": "米パイント"};
function amount(value) {
  const error = '量は0〜10億、小数3桁までで入力してください(カンマは3桁区切り)';
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(error);
  const s = String(value).trim().replace(/[０-９．＋，]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (s.length > 100 || !/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,3})?|\.\d{1,3})$/.test(s)) throw new Error(error);
  const [whole, fraction = ''] = s.replace(/^\+/, '').replaceAll(',', '').split('.');
  const n = BigInt((whole || '0') + fraction.padEnd(3, '0'));
  if (n > 1000000000000n) throw new Error(error);
  return n;
}
function rounded(n, d, digits) {
  const scale = 10n ** BigInt(digits);
  const v = (n * scale * 2n + d) / (2n * d);
  if (!digits) return String(v);
  const fraction = String(v % scale).padStart(digits, '0').replace(/0+$/, '');
  return String(v / scale) + (fraction ? '.' + fraction : '');
}
export function convertVolume(value, unit = 'l', digits = 2) {
  if (typeof unit !== 'string' || !Object.hasOwn(FACTORS, unit)) throw new Error('正しい容量の単位・表示桁を選んでください');
  if (!Number.isInteger(digits) || digits < 0 || digits > 6) throw new Error('正しい容量の単位・表示桁を選んでください');
  const n = amount(value);
  return Object.fromEntries(Object.entries(FACTORS).map(([key, factor]) => [key, rounded(n * FACTORS[unit], 1000n * factor, digits)]));
}

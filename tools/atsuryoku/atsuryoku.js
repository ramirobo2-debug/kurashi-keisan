// Paを整数の比で保持し、表示時だけ丸める。
const FACTORS = { pa: [1n, 1n], hpa: [100n, 1n], kpa: [1000n, 1n], mpa: [1000000n, 1n], atm: [101325n, 1n], mmhg: [101325n, 760n], kgf: [980665n, 10n], psi: [6894757293168n, 1000000000n], bar: [100000n, 1n] };
export const LABELS = { pa: 'Pa', hpa: 'hPa', kpa: 'kPa', mpa: 'MPa', atm: '気圧(atm)', mmhg: 'mmHg', kgf: 'kgf/cm²', psi: 'psi', bar: 'bar' };
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
export function convertPressure(value, unit = 'atm', digits = 2) {
  if (typeof unit !== 'string' || !Object.hasOwn(FACTORS, unit)) throw new Error('正しい圧力の単位・表示桁を選んでください');
  if (!Number.isInteger(digits) || digits < 0 || digits > 6) throw new Error('正しい圧力の単位・表示桁を選んでください');
  const n = amount(value);
  return Object.fromEntries(Object.entries(FACTORS).map(([key, factor]) => [key, rounded(n * FACTORS[unit][0] * factor[1], 1000n * FACTORS[unit][1] * factor[0], digits)]));
}

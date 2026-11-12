const FACTORS = { kcal: [4184n, 1n], cal: [4184n, 1000n], kj: [1000n, 1n], j: [1n, 1n], wh: [3600n, 1n], kwh: [3600000n, 1n] };
export const LABELS = { kcal: 'kcal', cal: 'cal', kj: 'kJ', j: 'J', wh: 'Wh', kwh: 'kWh' };
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
export function convertEnergy(value, unit = 'kcal', digits = 2) {
  if (typeof unit !== 'string' || !Object.hasOwn(FACTORS, unit)) throw new Error('正しいエネルギーの単位・表示桁を選んでください');
  if (!Number.isInteger(digits) || digits < 0 || digits > 6) throw new Error('正しいエネルギーの単位・表示桁を選んでください');
  const n = amount(value);
  return Object.fromEntries(Object.entries(FACTORS).map(([key, factor]) => [key, rounded(n * FACTORS[unit][0] * factor[1], 1000n * FACTORS[unit][1] * factor[0], digits)]));
}

const error = () => new Error('入力を確認してください。年利は0より大きく100以下、年数は0より大きい数を入力してください。');
function positive(value) {
  if (!['string', 'number'].includes(typeof value)) throw error();
  const s = String(value).trim().replace(/[０-９．，]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248));
  if (s.length > 100 || !/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?$/.test(s)) throw error();
  const n = Number(s.replaceAll(',', ''));
  if (!Number.isFinite(n) || n <= 0) throw error();
  return n;
}
export function calculate72({mode = 'years', rate = '3', years = '10'} = {}) {
  if (!['years', 'rate'].includes(mode)) throw error();
  const n = positive(mode === 'years' ? rate : years);
  if (mode === 'years' && n > 100) throw error();
  const approximate = 72 / n;
  const exact = mode === 'years' ? Math.LN2 / Math.log1p(n / 100) : Math.expm1(Math.LN2 / n) * 100;
  const difference = approximate - exact;
  if (![approximate, exact, difference].every(Number.isFinite) || exact <= 0) throw error();
  return {approximate, exact, difference};
}
export const fixed2 = n => (Object.is(Number(n.toFixed(2)), -0) ? 0 : n).toFixed(2);
export const compact2 = n => fixed2(n).replace(/\.?0+$/, '');

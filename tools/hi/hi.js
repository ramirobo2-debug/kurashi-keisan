const ERROR = '比は0より大きい小数第3位までの数値を100文字以内で入力してください(カンマは3桁区切り)';
function parse(value, integer = false) {
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(ERROR);
  const s = String(value).trim().replace(/[０-９．，＋]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (s.length > 100 || !/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,3})?|\.\d{1,3})$/.test(s)) throw new Error(ERROR);
  const [a, b = ''] = s.replace(/^\+/, '').replaceAll(',', '').split('.');
  const n = BigInt((a || '0') + b.padEnd(3, '0'));
  if (n === 0n || (integer && n % 1000n)) throw new Error(integer ? '合計は0より大きい円の整数で入力してください' : ERROR);
  return integer ? n / 1000n : n;
}
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
function ratios(values) {
  if (!Array.isArray(values) || (values.length !== 2 && values.length !== 3)) throw new Error('比は2項または3項で入力してください');
  return values.map(v => parse(v));
}
export function simplifyRatio(values) {
  const ns = ratios(values), g = ns.reduce(gcd);
  return ns.map(n => String(n / g)).join(':');
}
export function solveRatio(a, b, known, position = 'right') {
  if (!['right', 'left'].includes(position)) throw new Error('xの位置を選んでください');
  const aa = parse(a), bb = parse(b), cc = parse(known);
  let n = (position === 'right' ? bb : aa) * cc, d = (position === 'right' ? aa : bb) * 1000n;
  const g = gcd(n, d); n /= g; d /= g;
  const rounded = (n * 200n + d) / (2n * d);
  const decimal = `${rounded / 100n}.${String(rounded % 100n).padStart(2, '0')}`.replace(/\.?0+$/, '');
  return { decimal, fraction: d === 1n ? '' : `${n}/${d}` };
}
export function splitRatio(total, values) {
  const amount = parse(total, true), ns = ratios(values), sum = ns.reduce((a,b) => a+b);
  const shares = ns.map(n => amount * n / sum);
  const largest = ns.indexOf(ns.reduce((a,b) => a > b ? a : b));
  const remainder = amount - shares.reduce((a,b) => a+b);
  shares[largest] += remainder;
  return { shares: shares.map(String), remainder: String(remainder), recipient: largest + 1 };
}

function parse(value, digits = 0) {
  const error = '0以上の数字を入力してください(時間・分は整数、10進数は小数2桁まで。カンマは3桁区切り)';
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(error);
  const s = String(value).trim().replace(/[０-９．＋，]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  const pattern = digits ? /^\+?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/ : /^\+?(?:\d+|\d{1,3}(?:,\d{3})+)$/;
  if (s.length > 100 || !pattern.test(s)) throw new Error(error);
  const [whole, fraction = ''] = s.replace(/^\+/, '').replaceAll(',', '').split('.');
  return BigInt(whole + fraction.padEnd(digits, '0'));
}
export function timeToMinutes(hours, minutes) {
  const h = parse(hours), m = parse(minutes);
  if (m >= 60n) throw new Error('入力の形式・行数・分の範囲(0〜59)を確認してください');
  return h * 60n + m;
}
export function decimalToMinutes(hours) { return (parse(hours, 2) * 60n + 50n) / 100n; }
export function formatMinutes(minutes) {
  if (typeof minutes !== 'bigint') throw new Error('入力の形式・行数・分の範囲(0〜59)を確認してください');
  const sign = minutes < 0n ? '−' : '', n = minutes < 0n ? -minutes : minutes;
  const hundredths = (n * 100n + 30n) / 60n;
  const fraction = String(hundredths % 100n).padStart(2, '0').replace(/0+$/, '');
  return { time: sign + (n / 60n) + '時間' + (n % 60n) + '分', hours: (hundredths ? sign : '') + (hundredths / 100n) + (fraction ? '.' + fraction : ''), minutes: sign + n };
}

export function sumTimes(rows) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error('入力の形式・行数・分の範囲(0〜59)を確認してください');
  return formatMinutes(rows.reduce((sum, row) => {
    if (!row || !['add', 'subtract'].includes(row.operation)) throw new Error('入力の形式・行数・分の範囲(0〜59)を確認してください');
    const n = timeToMinutes(row.hours, row.minutes);
    return sum + (row.operation === 'add' ? n : -n);
  }, 0n));
}
export function convertTime(value, source = 'decimal', minutes = '0') {
  if (!['decimal', 'time', 'minutes'].includes(source)) throw new Error('入力の形式・行数・分の範囲(0〜59)を確認してください');
  return formatMinutes(source === 'decimal' ? decimalToMinutes(value) : source === 'time' ? timeToMinutes(value, minutes) : parse(value));
}

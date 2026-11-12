function parse(value, integer = false, zero = false) {
 const message = integer ? '人数は1以上の整数を入力してください' : '0より大きい数字を入力してください(小数6桁まで、カンマは3桁区切り)';
 if (typeof value !== 'string' && typeof value !== 'number') throw new Error(message);
 const s = String(value).trim().replace(/[０-９．＋，]/g, c => String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if (s.length > 100 || !/^\+?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,6})?$/.test(s) || (integer && s.includes('.'))) throw new Error(message);
 const [whole, fraction = ''] = s.replace(/^\+/, '').replaceAll(',', '').split('.');
 const n = BigInt(whole + fraction), d = 10n ** BigInt(fraction.length);
 if (n === 0n && !zero) throw new Error(message);
 return [n, d];
}
const mul = (a,b) => [a[0]*b[0], a[1]*b[1]];
const div = (a,b) => [a[0]*b[1], a[1]*b[0]];
function format([n,d], digits = 2, ceiling = false) {
 const scale = 10n ** BigInt(digits);
 const v = ceiling ? (n*scale+d-1n)/d : (n*scale*2n+d)/(2n*d);
 const fraction = String(v % scale).padStart(digits,'0').replace(/0+$/,'');
 return String(v/scale) + (digits && fraction ? '.'+fraction : '');
}
// 1マイル = 1.609344km、1米ガロン = 3.785411784L(米mpg)。
const mpgFactor = [1609344000n,3785411784n];
function outputs(kml) {
 return { kml:format(kml), l100:format(div([100n,1n],kml)), mpg:format(div(kml,mpgFactor)) };
}
export function calculateEfficiency(distance, fuel) { return outputs(div(parse(distance),parse(fuel))); }
export function calculateCost(distance, efficiency, price, people = '') {
 const liters = div(parse(distance),parse(efficiency));
 const cost = mul(liters,parse(price,false,true));
 const perPerson = people === '' ? null : format(div(cost,parse(people,true)),0,true);
 return {liters:format(liters),cost:format(cost,0),perPerson};
}
export function convertEfficiency(value, unit = 'kml') {
 if (!['kml','l100','mpg'].includes(unit)) throw new Error('換算する単位を選んでください');
 const n = parse(value);
 return outputs(unit === 'kml' ? n : unit === 'l100' ? div([100n,1n],n) : mul(n,mpgFactor));
}

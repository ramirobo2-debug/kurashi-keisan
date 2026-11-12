// kg換算係数を分数で保持
const FACTORS = {kg:[1n,1n], g:[1n,1000n], mg:[1n,1000000n], t:[1000n,1n], lb:[45359237n,100000000n], oz:[45359237n,1600000000n], st:[635029318n,100000000n]};
export const LABELS = {kg:'kg', g:'g', mg:'mg', t:'t', lb:'ポンド(lb)', oz:'オンス(oz)', st:'ストーン(st)'};
function amount(value) {
 const error='量は0〜10億の数で入力してください(カンマは3けた区切り)';
 if(!['string','number'].includes(typeof value))throw new Error(error);
 const s=String(value).trim().replace(/[０-９．＋，]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if(s.length>1000 || !/^\+?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s) && !/^\+?\.\d+$/.test(s))throw new Error(error);
 const [whole,fraction='']=s.replace(/^\+/,'').replaceAll(',','').split('.');
 const n=BigInt((whole||'0')+fraction), d=10n**BigInt(fraction.length);
 if(n>1000000000n*d)throw new Error(error);
 return [n,d];
}
function rounded(n,d){
 const scale=10000n,v=(n*scale*2n+d)/(2n*d);
 const fraction=String(v%scale).padStart(4,'0').replace(/0+$/,'');
 return String(v/scale)+(fraction?'.'+fraction:'');
}
export function convertWeight(value,unit='kg'){
 if(typeof unit!=='string'||!Object.hasOwn(FACTORS,unit))throw new Error('正しい重さの単位を選んでください');
 const [n,d]=amount(value),[a,b]=FACTORS[unit];
 return Object.fromEntries(Object.entries(FACTORS).map(([key,[c,e]])=>[key,rounded(n*a*e,d*b*c)]));
}

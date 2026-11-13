export const UNITS = {yen:1n, sen:1000n, man:10000n, million:1000000n, oku:100000000n};
export const LABELS = {yen:'円', sen:'千円', man:'万円', million:'百万円', oku:'億円'};
const normalize = v => String(v).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/．/g,'.').replace(/，/g,',');
export const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
export function reading(yen) {
 if(yen===0n)return '0円';
 const places=['','万','億','兆','京','垓'];
 let n=yen, i=0, parts=[];
 while(n){const group=n%10000n;if(group)parts.unshift(String(group)+places[i]);n/=10000n;i++;}
 return parts.join('')+'円';
}
export function inUnit(yen, unit) {
 if(!Object.hasOwn(UNITS,unit))throw new Error('単位を選んでください');
 const divisor=UNITS[unit], scaled=yen*1000n;
 const approximate=scaled%divisor!==0n;
 const rounded=(scaled+divisor/2n)/divisor;
 const whole=commas(rounded/1000n), fraction=String(rounded%1000n).padStart(3,'0').replace(/0+$/,'');
 return (approximate?'約':'')+whole+(fraction?'.'+fraction:'');
}
export function calculateKingakuTani({amount,unit='sen'}={}) {
 if(!Object.hasOwn(UNITS,unit))throw new Error('単位を選んでください');
 if(!['string','number'].includes(typeof amount))throw new Error('金額を数で入れてください');
 const s=normalize(amount);
 if(s.length>100 || !/^(?:\d+|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw new Error('金額は0以上の数で入れてください(カンマは3けた区切り)');
 const [whole,decimal='']=s.replace(/,/g,'').split('.');
 const denominator=10n**BigInt(decimal.length);
 const numerator=BigInt(whole+decimal)*UNITS[unit];
 if(numerator%denominator)throw new Error('1円未満にならない金額を入れてください');
 const yen=numerator/denominator;
 if(yen>=10n**24n)throw new Error('金額は24けた以内の円で入れてください');
 return {yen,reading:reading(yen),values:Object.fromEntries(Object.keys(UNITS).map(k=>[k,inUnit(yen,k)]))};
}

const RANGE='1〜3999 の整数を入力してください';
const INVALID='標準の書き方ではないため読めません';
const PAIRS=[[1000n,'M'],[900n,'CM'],[500n,'D'],[400n,'CD'],[100n,'C'],[90n,'XC'],[50n,'L'],[40n,'XL'],[10n,'X'],[9n,'IX'],[5n,'V'],[4n,'IV'],[1n,'I']];
export function toRoman(value) {
 if(!['string','number','bigint'].includes(typeof value)) throw new Error(RANGE);
 const s=String(value).trim().replace(/[０-９，＋]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if(s.length>100||!/^\+?(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s)) throw new Error(RANGE);
 let n=BigInt(s.replaceAll(',',''));
 if(n<1n||n>3999n) throw new Error(RANGE);
 let result='';
 for(const [amount,symbol] of PAIRS) while(n>=amount){result+=symbol;n-=amount;}
 return result;
}
export function fromRoman(value) {
 if(typeof value!=='string'||value.length>100) throw new Error(INVALID);
 const s=value.trim().normalize('NFKC').toUpperCase();
 if(!s||!/^M{0,3}(?:CM|CD|D?C{0,4})(?:XC|XL|L?X{0,4})(?:IX|IV|V?I{0,4})$/.test(s)) throw new Error(INVALID);
 let n=0n;
 const values={I:1n,V:5n,X:10n,L:50n,C:100n,D:500n,M:1000n};
 for(let i=0;i<s.length;i++) n+=i+1<s.length&&values[s[i]]<values[s[i+1]]?-values[s[i]]:values[s[i]];
 const standard=toRoman(n);
 return {number:n,standard,nonstandard:s!==standard};
}

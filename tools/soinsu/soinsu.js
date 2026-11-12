const MAX=1000000000000n;
function integer(value,min){
 if(!['string','number','bigint'].includes(typeof value)||(typeof value==='number'&&!Number.isSafeInteger(value)))throw new Error('整数を入力してください');
 const s=String(value).normalize('NFKC').trim();
 if(!/^(?:[+]?\d+|[+]?\d{1,3}(?:,\d{3})+)$/.test(s)||s.length>100)throw new Error('整数を入力してください(カンマは3けた区切り)');
 const n=BigInt(s.replaceAll(',',''));
 if(n<min||n>MAX)throw new Error(`${min}〜1兆の整数を入力してください`);
 return n;
}
export function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
const superscript=n=>String(n).replace(/\d/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
export function factorize(value){
 const n=integer(value,2n),factors=[];let rest=n;
 for(let p=2n;p*p<=rest;p=p===2n?3n:p+2n){
  let exponent=0;while(rest%p===0n){rest/=p;exponent++;}
  if(exponent)factors.push({prime:p,exponent});
 }
 if(rest>1n)factors.push({prime:rest,exponent:1});
 let divisors=[1n],count=1n;
 for(const {prime,exponent} of factors){
  const previous=[...divisors];let power=1n;count*=BigInt(exponent+1);
  for(let e=1;e<=exponent;e++){power*=prime;for(const d of previous)divisors.push(d*power);}
 }
 divisors.sort((a,b)=>a<b?-1:a>b?1:0);
 return {n,factors,expression:factors.map(({prime,exponent})=>String(prime)+(exponent>1?superscript(exponent):'')).join('×'),expanded:factors.flatMap(({prime,exponent})=>Array(exponent).fill(String(prime))).join('×'),isPrime:factors.length===1&&factors[0].exponent===1,count,divisors:divisors.slice(0,200),truncated:count>200n};
}
export function common(values){
 if(!Array.isArray(values)||values.length<2||values.length>10)throw new Error('整数は2〜10個入力してください');
 const numbers=values.map(v=>integer(v,1n));
 return {numbers,gcd:numbers.reduce(gcd),lcm:numbers.reduce((a,b)=>a/gcd(a,b)*b)};
}

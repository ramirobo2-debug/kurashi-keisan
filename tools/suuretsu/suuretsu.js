const abs=n=>n<0n?-n:n;
function gcd(a,b){a=abs(a);while(b)[a,b]=[b,a%b];return a;}
function rat(n,d=1n){if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d);
const mul=(a,b)=>rat(a.n*b.n,a.d*b.d);
function parse(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('入力を確認してください(数は100文字以内、項数は1〜10000の整数、カンマは3けた区切り)');
 const s=String(value).normalize('NFKC').trim().replaceAll('−','-');
 if(s.length>100||! /^[+-]?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?|\.\d+)$/.test(s))throw new Error('入力を確認してください(数は100文字以内、項数は1〜10000の整数、カンマは3けた区切り)');
 const [w,f='']=s.replace(/^[+-]/,'').replaceAll(',','').split('.');
 return rat((s.startsWith('-')?-1n:1n)*BigInt((w||'0')+f),10n**BigInt(f.length));
}
function short(n){const s=String(abs(n));return (n<0n?'-':'')+(s.length>100?s.slice(0,30)+'…'+s.slice(-30)+` (${s.length}けた)`:s);}
export function format(value){
 if(value.d===1n)return short(value.n);
 let d=value.d,two=0,five=0;while(d%2n===0n){d/=2n;two++;}while(d%5n===0n){d/=5n;five++;}
 const fraction=short(value.n)+'/'+short(value.d);
 if(d!==1n)return fraction;
 const places=Math.max(two,five);
 if(places>100)return fraction;
 const scaled=abs(value.n)*2n**BigInt(places-two)*5n**BigInt(places-five);
 const s=String(scaled).padStart(places+1,'0');
 if(s.length>100)return fraction;
 return (value.n<0n?'-':'')+s.slice(0,-places)+'.'+s.slice(-places);
}
export function suuretsu(mode,first,step,count){
 if(!['arithmetic','geometric'].includes(mode))throw new Error('入力を確認してください(数は100文字以内、項数は1〜10000の整数、カンマは3けた区切り)');
 const a=parse(first),b=parse(step),nr=parse(count);
 if(nr.d!==1n||nr.n<1n||nr.n>10000n)throw new Error('入力を確認してください(数は100文字以内、項数は1〜10000の整数、カンマは3けた区切り)');
 const n=Number(nr.n),term=i=>mode==='arithmetic'?add(a,mul(b,rat(BigInt(i-1)))):mul(a,rat(b.n**BigInt(i-1),b.d**BigInt(i-1)));
 const last=term(n);
 let sum;
 if(mode==='arithmetic')sum=mul(add(a,last),rat(BigInt(n),2n));
 else if(b.n===b.d)sum=mul(a,rat(BigInt(n)));
 else sum=mul(a,rat((b.n**BigInt(n)-b.d**BigInt(n))*b.d,b.d**BigInt(n)*(b.n-b.d)));
 const indices=Array.from({length:Math.min(n,5)},(_,i)=>i+1);
 for(let i=Math.max(6,n-1);i<=n;i++)indices.push(i);
 return {last,sum,terms:indices.map(index=>({index,value:term(index)})),gap:n>7};
}

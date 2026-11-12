const MAX=10n**30n;
function integer(value,min,max){
 if(!['string','number','bigint'].includes(typeof value)||(typeof value==='number'&&!Number.isSafeInteger(value)))throw new Error('整数を入力してください');
 const s=String(value).normalize('NFKC').trim().replaceAll('−','-');
 if(s.length>100||! /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s))throw new Error('整数を入力してください(カンマは3けた区切り)');
 const n=BigInt(s.replaceAll(',',''));if(n<min||n>max)throw new Error(`${min}〜${max}の整数を入力してください`);return n;
}
export function integerRoot(n,k=2){
 if(typeof n!=='bigint'||n<0n||![2,3].includes(k))throw new Error('非負のBigIntと次数2または3を指定してください');
 let lo=0n,hi=1n<<BigInt(Math.ceil(n.toString(2).length/k));
 while(lo<hi){const mid=(lo+hi+1n)/2n;if(mid**BigInt(k)<=n)lo=mid;else hi=mid-1n;}return lo;
}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function modpow(a,e,n){let r=1n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n;}return r;}
const PRIMES=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n,47n,53n];
// 入力上限10^30を覆う底の組による Miller–Rabin 判定。
function prime(n){
 if(n<2n)return false;for(const p of PRIMES){if(n===p)return true;if(n%p===0n)return false;}
 let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++;}
 for(const a of PRIMES){let x=modpow(a,d,n);if(x===1n||x===n-1n)continue;let pass=false;for(let j=1;j<s;j++){x=x*x%n;if(x===n-1n){pass=true;break;}}if(!pass)return false;}return true;
}
function divisor(n){
 for(const p of PRIMES)if(n%p===0n)return p;
 for(let c=1n;;c++){
  const f=x=>(x*x+c)%n;let y=2n,r=1,g=1n,x=0n,ys=0n;
  while(g===1n){x=y;for(let i=0;i<r;i++)y=f(y);
   for(let j=0;j<r&&g===1n;j+=128){ys=y;let q=1n;for(let i=0;i<Math.min(128,r-j);i++){y=f(y);q=q*(x>y?x-y:y-x)%n;}g=gcd(q,n);}r*=2;
  }
  if(g===n){do{ys=f(ys);g=gcd(x>ys?x-ys:ys-x,n);}while(g===1n);}
  if(g!==n)return g;
 }
}
function factors(n,out=new Map()){
 if(n===1n)return out;
 if(prime(n)){out.set(n,(out.get(n)||0)+1);return out;}
 for(const k of [2,3]){const a=integerRoot(n,k);if(a**BigInt(k)===n){for(const [p,e] of factors(a))out.set(p,(out.get(p)||0)+e*k);return out;}}
 const d=divisor(n);factors(d,out);factors(n/d,out);return out;
}
export function root(value,k=2){
 if(![2,3].includes(k))throw new Error('次数は2または3です');
 const n=integer(value,0n,MAX),symbol=k===2?'√':'∛',a=integerRoot(n,k);
 if(a**BigInt(k)===n)return {decimal:String(a),simplified:String(a)};
 const scaled=integerRoot(n*10n**BigInt(10*k),k).toString().padStart(11,'0');
 let outside=1n,inside=1n;for(const [p,e] of factors(n)){outside*=p**BigInt(Math.floor(e/k));inside*=p**BigInt(e%k);}
 return {decimal:scaled.slice(0,-10)+'.'+scaled.slice(-10)+'…',simplified:(outside===1n?'':String(outside))+symbol+inside};
}
export function power(base,exponent){
 const b=integer(base,-1000000n,1000000n),e=integer(exponent,0n,1000n),value=b**e,s=String(value),digits=(value<0n?s.slice(1):s).length;
 return {value,display:digits>100?s.slice(0,value<0n?31:30)+'…'+s.slice(-30)+` (${digits}けた)`:s,digits,note:b===0n&&e===0n?'0の0乗は1とする決まりで表示':''};
}

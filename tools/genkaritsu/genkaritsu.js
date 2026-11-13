const error = () => { throw new Error('入力を確認してください。原価・売価は0より大きい数、利益率は100%未満、原価率は0%より大きい数で入力してください。'); };
const frac = (n,d=1n) => ({n,d});
const sub = (a,b) => frac(a.n*b.d-b.n*a.d,a.d*b.d);
const mul = (a,b) => frac(a.n*b.n,a.d*b.d);
const div = (a,b) => b.n===0n ? error() : frac(a.n*b.d,a.d*b.n);
function parse(value){
 if(!['string','number'].includes(typeof value))return error();
 const s=String(value).trim().replace(/[０-９．，－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))return error();
 const [a,b='']=s.replaceAll(',','').split('.');
 return frac(BigInt(a+b),10n**BigInt(b.length));
}
function rounded(a,method){
 const sign=a.n<0n?-1n:1n, n=a.n*sign, q=n/a.d, r=n%a.d;
 if(method==='round')return sign*(q+(r*2n>=a.d?1n:0n));
 if(method==='ceil')return sign*q+(sign>0n && r?1n:0n);
 return sign*q-(sign<0n && r?1n:0n);
}
export function formatDecimal(a,places=2){
 const scale=10n**BigInt(places), v=rounded(mul(a,frac(scale)),'round');
 const sign=v<0n?'-':'', n=v<0n?-v:v;
 const tail=String(n%scale).padStart(places,'0').replace(/0+$/,'');
 return sign+(n/scale).toLocaleString('ja-JP')+(tail?'.'+tail:'');
}
export function calculateGenkaritsu({mode='rates',cost='700',price='1000',rate='30',rounding='ceil'}={}){
 if(!['rates','price','cost'].includes(mode)||!['ceil','round','floor'].includes(rounding))return error();
 const hundred=frac(100n);
 let c,p;
 if(mode==='rates'){c=parse(cost);p=parse(price);}
 else {
  const r=parse(rate);
  if(mode==='price'){
   if(r.n>=100n*r.d)return error();
   c=parse(cost);p=div(mul(c,hundred),sub(hundred,r));
  } else {
   if(r.n<=0n)return error();
   p=parse(price);c=div(mul(p,r),hundred);
  }
 }
 if(c.n<=0n||p.n<=0n)return error();
 const profit=sub(p,c), costRate=mul(div(c,p),hundred);
 return {cost:formatDecimal(c),price:formatDecimal(p),approxPrice:p.n%p.d!==0n,
 roundedPrice:rounded(p,rounding).toLocaleString('ja-JP'),
 costRate:formatDecimal(costRate),profitRate:formatDecimal(mul(div(profit,p),hundred)),
 markupRate:formatDecimal(mul(div(profit,c),hundred)),kake:formatDecimal(div(costRate,frac(10n))),profit:formatDecimal(profit)};
}

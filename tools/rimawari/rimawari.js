const error=()=>new Error('入力を確認してください。価格・家賃・目標利回りは0より大きく、経費・諸費用は0以上、空室率は0以上100未満にしてください。');
function parse(value,optional=false){
 if(optional && (value===undefined || value===''))return {n:0n,d:1n};
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(optional && s==='')return {n:0n,d:1n};
 if(s.length>100 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.');return {n:BigInt(a+b),d:10n**BigInt(b.length)};
}
const mul=(a,b)=>({n:a.n*b.n,d:a.d*b.d}),div=(a,b)=>({n:a.n*b.d,d:a.d*b.n});
const add=(a,b)=>({n:a.n*b.d+b.n*a.d,d:a.d*b.d});
const sub=(a,b)=>({n:a.n*b.d-b.n*a.d,d:a.d*b.d});
const hundred={n:100n,d:1n};
export function fixed(value,places=2){
 if(!Number.isInteger(places)||places<0||places>6)throw error();
 const negative=value.n<0n,n=negative?-value.n:value.n,scale=10n**BigInt(places);
 const q=(n*scale*2n+value.d)/(2n*value.d),s=q.toString().padStart(places+1,'0');
 return (negative&&q!==0n?'-':'')+(places?s.slice(0,-places)+'.'+s.slice(-places):s);
}
export function calculateRimawari({mode='yield',price='20000000',rent='100000',period='month',expenses='',fees='',vacancy='',target='6'}={}){
 if(!['yield','price'].includes(mode)||!['month','year'].includes(period))throw error();
 const rentValue=parse(rent);if(rentValue.n<=0n)throw error();
 const annual=mul(rentValue,{n:period==='month'?12n:1n,d:1n});
 if(mode==='price'){
  const rate=parse(target);if(rate.n<=0n)throw error();
  return {annual,price:div(mul(annual,hundred),rate)};
 }
 const cost=parse(price),expense=parse(expenses,true),fee=parse(fees,true),vac=parse(vacancy,true);
 if(cost.n<=0n||vac.n>=100n*vac.d)throw error();
 const occupied=mul(annual,sub({n:1n,d:1n},div(vac,hundred)));
 return {annual,gross:mul(div(annual,cost),hundred),adjusted:mul(div(occupied,cost),hundred),net:mul(div(sub(occupied,expense),add(cost,fee)),hundred),hasVacancy:String(vacancy??'').trim()!==''};
}

function gcd(a,b){while(b)[a,b]=[b,a%b];return a<0n?-a:a;}
export function fraction(n,d){if(d===0n)throw new Error('0では割れません');const g=gcd(n,d);return d<0n?{n:-n/g,d:-d/g}:{n:n/g,d:d/g};}
function decimal(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('値段と量を数で入力してください');
 const s=String(value).normalize('NFKC').trim();
 if(s.length>200||! /^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?$/.test(s))throw new Error('値段は0以上、量は0より大きい数で入力してください');
 const [a,b='']=s.replaceAll(',','').split('.');return fraction(BigInt(a+b),10n**BigInt(b.length));
}
function divide(a,b){return fraction(a.n*b.d,a.d*b.n);}
function subtract(a,b){return fraction(a.n*b.d-b.n*a.d,a.d*b.d);}
export function formatDecimal(v,places=2){
 const scale=10n**BigInt(places),abs=v.n<0n?-v.n:v.n;
 const rounded=(abs*scale*2n+v.d)/(2n*v.d);
 const s=String(rounded).padStart(places+1,'0');
 const out=places?s.slice(0,-places)+'.'+s.slice(-places):s;
 return (v.n<0n&&rounded!==0n?'-':'')+(places?out.replace(/\.?0+$/,''):out);
}
export function calculate(rows,unit='g'){
 if(!['g','mL','個','枚'].includes(unit))throw new Error('単位を選んでください');
 if(!Array.isArray(rows)||rows.length<2||rows.length>4)throw new Error('商品は2〜4行で入力してください');
 const items=[];
 rows.forEach((row,index)=>{
  if(!row||typeof row!=='object')throw new Error('商品を入力してください');
  if(String(row.price??'').trim()===''&&String(row.quantity??'').trim()==='')return;
  const price=decimal(row.price),quantity=decimal(row.quantity);
  if(quantity.n===0n)throw new Error('量は0より大きい数で入力してください');
  items.push({name:String(row.name??'').trim()||`商品${index+1}`,index,rate:divide(price,quantity)});
 });
 if(items.length<2)throw new Error('値段と量を2商品以上入力してください');
 const min=items.reduce((a,b)=>a.n*b.rate.d<=b.rate.n*a.d?a:b.rate,items[0].rate);
 const ties=items.filter(x=>subtract(x.rate,min).n===0n).length;
 return items.map(item=>{
  const difference=subtract(item.rate,min),cheapest=difference.n===0n;
  const percent=cheapest?'0':min.n===0n?null:formatDecimal(fraction(difference.n*min.d*100n,difference.d*min.n),1);
  return {...item,unit,one:formatDecimal(item.rate),hundred:formatDecimal(fraction(item.rate.n*100n,item.rate.d)),cheapest,percent,
   comparison:cheapest?(ties>1?'いちばん安い (同じ)':'いちばん安い'):percent===null?'いちばん安いものは0円のため、比較率は計算できません':`いちばん安いものより${percent}%高い`};
 });
}

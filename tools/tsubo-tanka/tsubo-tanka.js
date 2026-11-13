const error = () => new Error('価格と面積には0より大きい数を入力してください。全角数字・3けた区切りのカンマも使えます(100文字以内)。');
function decimal(value) {
  if (!['string','number'].includes(typeof value)) throw error();
  const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
  if(s.length>100 || !/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?$/.test(s)) throw error();
  const [a,b='']=s.replaceAll(',','').split('.');
  const n=BigInt(a+b),d=10n**BigInt(b.length);
  if(n===0n) throw error();
  return {n,d};
}
function rounded(n,d,places=0) {
  const scale=10n**BigInt(places), v=(2n*n*scale+d)/(2n*d);
  const whole=(v/scale).toLocaleString('ja-JP');
  return places ? whole+'.'+String(v%scale).padStart(places,'0') : whole;
}
function price(p,a) {
  const n=p.n*a.d,d=p.d*a.n;
  return (n%d===0n?'':'約')+rounded(n,d)+'円';
}
export function calculateTsuboTanka({price:inputPrice,area,unit='m2'}={}) {
  const p=decimal(inputPrice),a=decimal(area);
  if(!['m2','tsubo'].includes(unit)) throw error();
  const m2=unit==='m2'?a:{n:a.n*400n,d:a.d*121n};
  const tsubo=unit==='tsubo'?a:{n:a.n*121n,d:a.d*400n};
  return {m2:rounded(m2.n,m2.d,2),tsubo:rounded(tsubo.n,tsubo.d,2),m2Price:price(p,m2),tsuboPrice:price(p,tsubo)};
}

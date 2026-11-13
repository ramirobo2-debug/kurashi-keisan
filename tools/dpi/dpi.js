const error=()=>new Error('入力を確認してください。寸法・ピクセル数・dpiは0より大きい数にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.');
 const n=BigInt(a+b),d=10n**BigInt(b.length);
 if(n<=0n)throw error();return {n,d};
}
export const PAPERS=Object.freeze({a4:Object.freeze([210,297]),postcard:Object.freeze([100,148]),card:Object.freeze([91,55])});
export function fixed(value,places=2){
 if(!Number.isInteger(places)||places<0||places>6)throw error();
 const scale=10n**BigInt(places),q=(value.n*scale*2n+value.d)/(2n*value.d);
 const s=q.toString().padStart(places+1,'0');
 return places?s.slice(0,-places)+'.'+s.slice(-places):s;
}
export function calculateDpi({mode='pixels',paper='custom',width='210',height='297',dpi='350'}={}){
 if(!['pixels','mm'].includes(mode))throw error();
 if(mode==='pixels' && paper!=='custom'){
  if(!Object.hasOwn(PAPERS,paper))throw error();
  [width,height]=PAPERS[paper];
 }
 const resolution=parse(dpi);
 const convert=value=>{
  const v=parse(value);
  return mode==='pixels'?{n:v.n*resolution.n*10n,d:v.d*resolution.d*254n}:{n:v.n*254n*resolution.d,d:v.d*10n*resolution.n};
 };
 return {width:convert(width),height:convert(height)};
}

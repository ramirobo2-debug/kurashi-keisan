const error=()=>new Error('気温は−20〜50℃、湿度は0〜100%で入力してください。');
function parse(value,min,max){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');
 if(s.length>100||! /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.'),d=10n**BigInt(b.length);
 const n=BigInt(a+b);
 if(n<BigInt(min)*d||n>BigInt(max)*d)throw error();
 return {n,d};
}
export const FEELINGS=Object.freeze(['寒い','肌寒い','何も感じない','快い','暑くない','やや暑い','暑くて汗が出る','暑くてたまらない']);
export function feeling({n,d}){
 return FEELINGS[[55,60,65,70,75,80,85].filter(x=>n>=BigInt(x)*d).length];
}
export function fixed({n,d}){
 const q=((n<0n?-n:n)*20n+d)/(2n*d),s=q.toString().padStart(2,'0');
 return (n<0n&&q!==0n?'-':'')+s.slice(0,-1)+'.'+s.slice(-1);
}
export function calculateFukaiShisu({temperature='30',humidity='70'}={}){
 const t=parse(temperature,-20,50),h=parse(humidity,0,100);
 const value={n:8100n*t.n*h.d+h.n*(99n*t.n-1430n*t.d)+463000n*t.d*h.d,d:10000n*t.d*h.d};
 return {value,display:fixed(value),feeling:feeling(value)};
}

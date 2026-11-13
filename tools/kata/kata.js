const error = () => new Error('入力を確認してください。寸法は0より大きい数、号は4〜8の整数にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [whole,decimal='']=s.replaceAll(',','').split('.');
 const n=BigInt(whole+decimal),d=10n**BigInt(decimal.length);
 if(n<=0n)throw error();return {n,d};
}
const mul=(a,b)=>({n:a.n*b.n,d:a.d*b.d});
const div=(a,b)=>({n:a.n*b.d,d:a.d*b.n});
// 円周率は小数第15位までの近似値。丸型同士では相殺される。
const pi={n:3141592653589793n,d:1000000000000000n};
function area(shape,size){
 if(!['round','go','square'].includes(shape))throw error();
 let v=parse(size);
 if(shape==='go'){
  if(v.n%v.d!==0n || v.n/v.d<4n || v.n/v.d>8n)throw error();
  v=mul(v,{n:3n,d:1n});
 }
 const square=mul(v,v);
 return shape==='square'?square:mul(square,div(pi,{n:4n,d:1n}));
}
export function fixed(value,places=2){
 if(!Number.isInteger(places)||places<0||places>6)throw error();
 const scale=10n**BigInt(places),q=(value.n*scale*2n+value.d)/(2n*value.d);
 const s=q.toString().padStart(places+1,'0');
 return places?s.slice(0,-places)+'.'+s.slice(-places):s;
}
export function calculateKata({fromShape='round',fromSize='15',toShape='round',toSize='18'}={}){
 const fromArea=area(fromShape,fromSize),toArea=area(toShape,toSize);
 const ratio=div(toArea,fromArea),eggs=mul(ratio,{n:3n,d:1n});
 return {fromArea,toArea,ratio,eggs};
}

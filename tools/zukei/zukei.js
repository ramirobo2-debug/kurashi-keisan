// 入力とπの係数は分数で保持する。
const gcd=(a,b)=>b?gcd(b,a%b):a;
function rat(n,d=1n){const g=gcd(n,d);return [n/g,d/g];}
const mul=(a,b)=>rat(a[0]*b[0],a[1]*b[1]);
const add=(a,b)=>rat(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
function positive(value){
 const error='長さは0より大きい10億以下、中心角は0より大きい360度以下の数で入力してください(カンマは3けた区切り)';
 if(!['number','string'].includes(typeof value))throw new Error(error);
 const s=String(value).trim().replace(/[０-９．＋，]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if(s.length>1000||!/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?|\.\d+)$/.test(s))throw new Error(error);
 const [w,f='']=s.replace(/^\+/,'').replaceAll(',','').split('.');
 const n=BigInt((w||'0')+f),d=10n**BigInt(f.length);
 if(n<=0n||n>1000000000n*d)throw new Error(error);
 return rat(n,d);
}
function decimal([n,d]){
 const scale=10000000000n,v=n*scale/d;
 const f=String(v%scale).padStart(10,'0').replace(/0+$/,'');
 return String(v/scale)+(f?'.'+f:'');
}
function output(label,value,pi=false){
 if(!pi)return {label,value:decimal(value)};
 const [n,d]=value;
 return {label,exact:(d===1n?String(n):'('+n+'/'+d+')')+'π',pi314:decimal(mul(value,[314n,100n])),precise:decimal(mul(value,[314159265358979323846264338327950288419716939937510n,10n**50n]))};
}
export const FIELDS={circle:['半径'],sector:['半径','中心角(度)'],triangle:['底辺','高さ'],trapezoid:['上底','下底','高さ'],rhombus:['対角線1','対角線2'],sphere:['半径']};
export function calculateShape(mode,values){
 if(typeof mode!=='string'||!Object.hasOwn(FIELDS,mode))throw new Error('正しい図形を選んでください');
 if(!Array.isArray(values)||values.length!==FIELDS[mode].length)throw new Error('必要な長さと角度を入力してください');
 const [a,b,c]=values.map(positive),half=[1n,2n],two=[2n,1n];
 switch(mode){
 case 'circle':return [output('面積',mul(a,a),true),output('円周',mul(two,a),true)];
 case 'sector':{
  if(b[0]>360n*b[1])throw new Error('中心角は360度以下で入力してください');
  const fraction=mul(b,[1n,360n]);
  return [output('面積',mul(mul(a,a),fraction),true),output('弧の長さ',mul(mul(two,a),fraction),true)];
 }
 case 'triangle':return [output('面積',mul(mul(a,b),half))];
 case 'trapezoid':return [output('面積',mul(mul(add(a,b),c),half))];
 case 'rhombus':return [output('面積',mul(mul(a,b),half))];
 case 'sphere':return [output('体積',mul(mul(mul(a,a),a),[4n,3n]),true),output('表面積',mul(mul(a,a),[4n,1n]),true)];
 }
}

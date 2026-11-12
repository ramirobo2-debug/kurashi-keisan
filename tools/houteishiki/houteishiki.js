import {root} from '../root/root.js';
const abs=n=>n<0n?-n:n;
function gcd(a,b){a=abs(a);b=abs(b);while(b)[a,b]=[b,a%b];return a;}
function rat(n,d=1n){if(!d)throw new Error('分母に0は使えません');const g=gcd(n,d);return {n:n/g*(d<0n?-1n:1n),d:abs(d/g)};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d);
const neg=a=>rat(-a.n,a.d);
const sub=(a,b)=>add(a,neg(b));
const mul=(a,b)=>rat(a.n*b.n,a.d*b.d);
const div=(a,b)=>rat(a.n*b.d,a.d*b.n);
const str=a=>String(a.n)+(a.d===1n?'':'/'+a.d);
export function parse(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('係数を入力してください');
 const s=String(value).normalize('NFKC').trim().replaceAll('−','-');
 if(s.length>80)throw new Error('係数は80文字以内で入力してください');
 const parts=s.split('/');if(parts.length>2)throw new Error('整数・小数・分数を入力してください');
 function decimal(s){if(!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw new Error('整数・小数・分数を入力してください(カンマは3けた区切り)');const [i,f='']=s.replaceAll(',','').split('.');return rat(BigInt(i+f),10n**BigInt(f.length));}
 const r=parts.length===1?decimal(parts[0]):div(decimal(parts[0]),decimal(parts[1]));
 if(abs(r.n)>1000000n||r.d>1000000n)throw new Error('約分後の分子の絶対値と分母は1000000以下にしてください');return r;
}
function decimal(r){const v=(abs(r.n)*10000n*2n+r.d)/(2n*r.d);return (r.n<0n&&v?'-':'')+String(v/10000n)+(v%10000n?'.'+String(v%10000n).padStart(4,'0').replace(/0+$/,''):'');}
const value=r=>({exact:str(r),decimal:decimal(r)});
export function simultaneous(values){
 if(!Array.isArray(values)||values.length!==6)throw new Error('係数を6つ入力してください');
 const [a,b,c,d,e,f]=values.map(parse),D=sub(mul(a,e),mul(d,b)),X=sub(mul(c,e),mul(f,b)),Y=sub(mul(a,f),mul(d,c));
 const steps=[`D = a1b2 − a2b1 = (${str(a)})×(${str(e)}) − (${str(d)})×(${str(b)}) = ${str(D)}`,`xの分子 = c1b2 − c2b1 = ${str(X)}`,`yの分子 = a1c2 − a2c1 = ${str(Y)}`];
 if(!D.n){const impossible=(!a.n&&!b.n&&c.n)||(!d.n&&!e.n&&f.n)||X.n||Y.n;return {kind:impossible?'none':'infinite',steps};}
 steps.push('x = (c1b2 − c2b1)/D、y = (a1c2 − a2c1)/D');return {kind:'unique',x:value(div(X,D)),y:value(div(Y,D)),steps};
}
export function quadratic(values){
 if(!Array.isArray(values)||values.length!==3)throw new Error('係数を3つ入力してください');
 const [a,b,c]=values.map(parse);
 if(!a.n){if(!b.n)throw new Error(c.n?'解なし: aとbが0です':'aとbが0です。一次・二次方程式の係数を入力してください');return {kind:'linear',solutions:[value(div(neg(c),b))],steps:['a = 0なので bx + c = 0 として計算']};}
 const D=sub(mul(b,b),mul(rat(4n),mul(a,c))),steps=[`D = b² − 4ac = (${str(b)})² − 4×(${str(a)})×(${str(c)}) = ${str(D)}`,'x = (−b ± √D)/(2a)'];
 if(!D.n)return {kind:'double',D:str(D),solutions:[value(div(neg(b),mul(rat(2n),a)))],steps};
 // 約分済みのpとqは互いに素。別々に平方因子を取り出し、√(p/q)=√p√q/qとする。
 function simplify(n){const s=root(String(n)).simplified,m=/^(\d*)√(\d+)$/.exec(s);return m?[BigInt(m[1]||1),BigInt(m[2])]:[BigInt(s),1n];}
 const [pn,pr]=simplify(abs(D.n)),[qn,qr]=simplify(D.d),outside=pn*qn,inside=pr*qr===1n?null:String(pr*qr);
 const center=div(neg(b),mul(rat(2n),a)),spread=div(rat(outside,D.d),mul(rat(2n),a));spread.n=abs(spread.n);
 if(D.n>0n&&!inside)return {kind:'real',D:str(D),solutions:[value(add(center,spread)),value(sub(center,spread))],steps};
 const common=center.d/gcd(center.d,spread.d)*spread.d,cn=center.n*(common/center.d),sn=spread.n*(common/spread.d);
 const radical=(inside?(sn===1n?'':String(sn))+'√'+inside:String(sn))+(D.n<0n?' i':'');
 const expression=common===1n?(cn?String(cn):'')+'±'+radical:`(${cn?String(cn):'0'}±${radical})/${common}`;
 const solutions=D.n<0n?[]:[{exact:expression,decimal:[1,-1].map(sign=>{
  // 十分な固定小数精度を確保してから、有理数として第4位に丸める。
  const scale=10n**40n;let lo=0n,hi=abs(D.n)*scale*scale/D.d+1n;
  while(lo+1n<hi){const mid=(lo+hi)/2n;if(mid*mid*D.d<=abs(D.n)*scale*scale)lo=mid;else hi=mid;}
  return decimal(add(center,rat(BigInt(sign)*lo*a.d,scale*2n*abs(a.n))));
 }).join('・')}];
 return {kind:D.n<0n?'complex':'real',D:str(D),expression,solutions,steps};
}

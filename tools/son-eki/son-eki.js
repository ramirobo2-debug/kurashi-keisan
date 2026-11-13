import {formatDecimal} from '../genkaritsu/genkaritsu.js';
const error = () => { throw new Error('入力を確認してください。固定費・目標利益は0以上、変動費率は0%以上100%未満、売上高は0より大きい数で入力してください。'); };
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

const add = (a,b) => frac(a.n*b.d+b.n*a.d,a.d*b.d);
const optional = value => typeof value==='string' && value.trim()==='';
export function calculateSonEki({mode='rate',fixed,rate,sales,variable,target='',current=''}={}){
 if(!['rate','amount'].includes(mode))return error();
 const f=parse(fixed), hundred=frac(100n);
 if(f.n<0n)return error();
 let r;
 if(mode==='rate')r=div(parse(rate),hundred);
 else {
  const s=parse(sales), v=parse(variable);
  if(s.n<=0n||v.n<0n)return error();
  r=div(v,s);
 }
 if(r.n<0n||r.n>=r.d)return error();
 const margin=sub(frac(1n),r), point=div(f,margin);
 const t=optional(target)?null:parse(target), c=optional(current)?null:parse(current);
 if(t && t.n<0n || c && c.n<=0n)return error();
 return {rate:formatDecimal(mul(r,hundred)),marginRate:formatDecimal(mul(margin,hundred)),
  breakEven:formatDecimal(point),targetSales:t?formatDecimal(div(add(f,t),margin)):null,
  safetyRate:c?formatDecimal(mul(div(sub(c,point),c),hundred)):null};
}

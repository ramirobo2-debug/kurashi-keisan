import { parseAmount } from '../tax/tax.js';
const normalize = v => String(v).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/．/g,'.').replace(/，/g,',');
export const yen = n => n.toLocaleString('ja-JP')+'円';
function ratio(v) {
  if (!['string','number'].includes(typeof v)) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  const s=normalize(v);
  if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\.[0-9]+)?$/.test(s) || s.length>100) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  const [a,b='']=s.replaceAll(',','').split('.');
  return {n:BigInt(a+b), places:b.length};
}
export function calculateAnbun({total,rows,method='largest',target=0}={}) {
  const amount=parseAmount(total);
  if(amount===null || amount<0) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  if(!Array.isArray(rows) || rows.length<2 || rows.length>20) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  if(!['largest','floor','target'].includes(method)) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  if(method==='target' && (!Number.isInteger(target) || target<0 || target>=rows.length)) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  const parsed=rows.map(r=>ratio(r?.ratio)), places=Math.max(...parsed.map(r=>r.places));
  const weights=parsed.map(r=>r.n*10n**BigInt(places-r.places)), sum=weights.reduce((a,b)=>a+b,0n);
  if(sum===0n) throw new Error('入力を確認してください。金額は0円〜1兆円の整数、比率は0以上の数、行数は2〜20行です');
  const totalYen=BigInt(amount);
  const result=weights.map((w,i)=>({name:String(rows[i].name??'').trim() || `分ける先${i+1}`,amount:totalYen*w/sum,remainder:totalYen*w%sum,percent:(()=>{const n=(w*10000n+sum/2n)/sum;return `${n/100n}.${String(n%100n).padStart(2,'0')}`;})()}));
  let remaining=totalYen-result.reduce((a,r)=>a+r.amount,0n);
  if(method==='largest') {
    const order=result.map((r,i)=>({i,r:r.remainder})).sort((a,b)=>a.r===b.r?a.i-b.i:a.r>b.r?-1:1);
    for(let i=0;i<Number(remaining);i++) result[order[i].i].amount++;
    remaining=0n;
  } else if(method==='target') {result[target].amount+=remaining;remaining=0n;}
  return {rows:result,total:totalYen,allocated:totalYen-remaining,remaining};
}

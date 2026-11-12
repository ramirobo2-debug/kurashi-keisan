const fail=()=>{throw new Error('入力を確認してください(負の数・食塩水0g・範囲外の濃度は使えません)');};
function fraction(n,d=1n){if(d===0n)fail();if(d<0n){n=-n;d=-d;}let a=n<0n?-n:n,b=d;while(b)[a,b]=[b,a%b];return {n:n/(a||1n),d:d/(a||1n)};}
const add=(a,b)=>fraction(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>fraction(a.n*b.d-b.n*a.d,a.d*b.d);
const mul=(a,b)=>fraction(a.n*b.n,a.d*b.d);
const div=(a,b)=>fraction(a.n*b.d,a.d*b.n);
const hundred=fraction(100n);
function decimal(value){
 if(!['string','number','bigint'].includes(typeof value))fail();
 const s=String(value).normalize('NFKC').trim();
 if(s.length>100||!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))fail();
 const [i,f='']=s.replaceAll(',','').split('.');return fraction(BigInt(i+f),10n**BigInt(f.length));
}
function positive(value){const r=decimal(value);if(!r.n)fail();return r;}
function percent(value,target=false){const r=decimal(value);if(r.n>100n*r.d||(target&&(!r.n||r.n>=100n*r.d)))fail();return r;}
export function format(r){const q=(r.n*200n+r.d)/(2n*r.d);return String(q/100n)+(q%100n?'.'+String(q%100n).padStart(2,'0').replace(/0+$/,''):'');}
export function calculate({mode='concentration',salt='20',water='180',mass='200',concentration='5',mass1='300',concentration1='8',mass2='200',concentration2='3',current='10',target='4'}={}){
 let s,w,m,c,formula,action,amount;
 if(mode==='concentration'){
  s=decimal(salt);w=decimal(water);m=add(s,w);if(!m.n)fail();c=mul(div(s,m),hundred);
  formula=`濃度 = 食塩 ÷ (食塩 + 水) × 100 = ${format(s)} ÷ ${format(m)} × 100`;
 }else if(mode==='salt'){
  m=positive(mass);c=percent(concentration);s=div(mul(m,c),hundred);w=sub(m,s);if(w.n<0n)fail();
  formula=`食塩 = 食塩水 × 濃度 ÷ 100 = ${format(m)} × ${format(c)} ÷ 100`;
 }else if(mode==='mix'){
  const a=positive(mass1),b=positive(mass2),x=percent(concentration1),y=percent(concentration2);
  m=add(a,b);s=div(add(mul(a,x),mul(b,y)),hundred);w=sub(m,s);c=mul(div(s,m),hundred);
  formula=`濃度 = (${format(a)} × ${format(x)} ÷ 100 + ${format(b)} × ${format(y)} ÷ 100) ÷ ${format(m)} × 100`;
 }else if(mode==='adjust'){
  m=positive(mass);const before=percent(current);c=percent(target,true);s=div(mul(m,before),hundred);
  if(!before.n)fail();
  const after=div(mul(s,hundred),c),difference=sub(after,m);
  action=difference.n===0n?'そのまま':difference.n>0n?'足す':'蒸発させる';
  amount=format(fraction(difference.n<0n?-difference.n:difference.n,difference.d));
  formula=`変更後の食塩水 = ${format(m)} × ${format(before)} ÷ ${format(c)} = ${format(after)}g`;m=after;w=sub(m,s);
 }else fail();
 return {concentration:format(c),mass:format(m),salt:format(s),water:format(w),formula,action,amount,exactConcentration:c};
}

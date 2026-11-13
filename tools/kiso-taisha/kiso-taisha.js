const error=()=>new Error('入力を確認してください。年齢は18〜100の整数、身長・体重は0より大きい数にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.');
 const n=BigInt(a+b),d=10n**BigInt(b.length);
 if(n<=0n)throw error();return {n,d};
}
export function fixed(value,places=0){
 if(!Number.isInteger(places)||places<0||places>6)throw error();
 const scale=10n**BigInt(places),q=(value.n*scale*2n+value.d)/(2n*value.d);
 const s=q.toString().padStart(places+1,'0');
 return places?s.slice(0,-places)+'.'+s.slice(-places):s;
}
// 日本人の食事摂取基準(2025年版)表3(基礎代謝基準値 kcal/kg体重/日)と表4(身体活動レベル基準値)
export const STANDARD=Object.freeze([
 {min:18,max:29,male:'23.7',female:'22.1',pal:{low:'1.50',normal:'1.75',high:'2.00'}},
 {min:30,max:49,male:'22.5',female:'21.9',pal:{low:'1.50',normal:'1.75',high:'2.00'}},
 {min:50,max:64,male:'21.8',female:'20.7',pal:{low:'1.50',normal:'1.75',high:'2.00'}},
 {min:65,max:74,male:'21.6',female:'20.7',pal:{low:'1.50',normal:'1.70',high:'1.90'}},
 {min:75,max:100,male:'21.5',female:'20.7',pal:{low:'1.40',normal:'1.70',high:null}}
]);
const dec=s=>{const [a,b='']=s.split('.');return {n:BigInt(a+b),d:10n**BigInt(b.length)};};
export function calculateKisoTaisha({sex='male',age='40',height='170',weight='70',activity=''}={}){
 if(!['male','female'].includes(sex)||!['','low','normal','high'].includes(activity))throw error();
 const a=parse(age),h=parse(height),w=parse(weight);
 if(a.n%a.d!==0n||a.n<18n*a.d||a.n>100n*a.d)throw error();
 const years=a.n/a.d,constant=sex==='male'?4235n:9708n;
 const basal={n:481n*w.n*h.d+234n*h.n*w.d-(138n*years+constant)*w.d*h.d,d:41860n*w.d*h.d};
 basal.n*=1000n;
 if(basal.n<=0n)throw new Error('この身長・体重・年齢の組み合わせでは推定値が0以下になります。入力を確認してください。');
 const row=STANDARD.find(r=>years>=BigInt(r.min)&&years<=BigInt(r.max)),sv=dec(row[sex]);
 const standard={n:sv.n*w.n,d:sv.d*w.d};
 let pal=null,energy=null;
 if(activity){
  pal=row.pal[activity];
  if(!pal)throw new Error('75歳以上の身体活動レベルは「低い」「ふつう」の2区分です。');
  const p=dec(pal);energy={n:basal.n*p.n,d:basal.d*p.d};
 }
 return {basal,standard,outOfRange:years>79n,standardValue:row[sex],ageGroup:row.max===100?'75歳以上':`${row.min}〜${row.max}歳`,pal,energy};
}

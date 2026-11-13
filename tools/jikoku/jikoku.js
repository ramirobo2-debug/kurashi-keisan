const normalize=v=>String(v??'').trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/：/g,':').replace(/，/g,',');
function integer(v,max,label){
 const s=normalize(v);
 if(!/^(?:\d+|[1-9]\d{0,2}(?:,\d{3})+)$/.test(s)) throw new Error(`${label}は0〜${max}の整数で入れてください`);
 const n=Number(s.replace(/,/g,''));
 if(!Number.isSafeInteger(n)||n>max) throw new Error(`${label}は0〜${max}の整数で入れてください`);
 return n;
}
export function calculateJikoku({mode='24',time,period='am',hour,minute}={}){
 let h,m;
 if(mode==='24'){
  const a=normalize(time).split(':');
  if(a.length!==2) throw new Error('0:00〜47:59の時:分で入れてください');
  h=integer(a[0],47,'時');m=integer(a[1],59,'分');
 }else if(mode==='12'){
  if(!['am','pm'].includes(period)) throw new Error('午前か午後を選んでください');
  h=integer(hour,11,'時')+(period==='pm'?12:0);m=integer(minute,59,'分');
 }else throw new Error('入力形式を選んでください');
 const day=Math.floor(h/24),ch=h%24,half=ch%12,pad=n=>String(n).padStart(2,'0'),clock=`${ch}:${pad(m)}`;
 return {day,clock,time24:`${h}:${pad(m)}`,japanese:`${day?'翌日の':''}${ch<12?'午前':'午後'}${half}時${m?`${m}分`:''}${ch===12&&m===0?'(正午)':''}`,english:`${half||12}:${pad(m)} ${ch<12?'a.m.':'p.m.'}`,nextDay:day?`翌日の${ch}時${m?`${m}分`:''}(${clock})`:''};
}

const error=()=>new Error('入力を確認してください。月額は0より大きい数、年は1〜9999、月と日付は存在する日付にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100||!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.');return {n:BigInt(a+b),d:10n**BigInt(b.length)};
}
function integer(value,min,max){const r=parse(value);if(r.n%r.d!==0n||r.n< BigInt(min)*r.d||r.n>BigInt(max)*r.d)throw error();return Number(r.n/r.d);}
export function calculateHiwari({amount='80000',year='2026',month='11',day='20',mode='in',divisor='month'}={}){
 const monthly=parse(amount);if(monthly.n<=0n)throw error();
 const y=integer(year,1,9999),m=integer(month,1,12);
 const monthDays=[31,y%4===0&&(y%100!==0||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
 const date=integer(day,1,monthDays);
 if(!['in','out'].includes(mode)||!['month','30'].includes(divisor))throw error();
 const days=mode==='in'?monthDays-date+1:date,divisorDays=divisor==='month'?monthDays:30;
 return {days,monthDays,divisorDays,amount:monthly.n*BigInt(days)/(monthly.d*BigInt(divisorDays))};
}

// 小数を10のべき乗倍した整数で計算する。
export function round(value, place=0){
 if(typeof value!=='string') throw new Error('数を入力してください');
 const s=value.normalize('NFKC').trim().replaceAll('−','-');
 const m=/^([+-]?)(\d+|\d{1,3}(?:,\d{3})+)(?:\.(\d+))?$/.exec(s);
 if(!m) throw new Error('数を入力してください(カンマは3けた区切り)');
 const whole=m[2].replaceAll(',',''),fraction=m[3]||'';
 if(whole.length>30||fraction.length>30) throw new Error('整数部・小数部はそれぞれ30けたまでです');
 if(!Number.isInteger(place)||place < -2||place > 6) throw new Error('そろえる位を選んでください');
 const n=BigInt(whole+fraction),shift=fraction.length-place;
 const unit=10n**BigInt(Math.max(0,shift));
 const scaled=shift<0?n*10n**BigInt(-shift):n;
 const q=scaled/unit,r=scaled%unit;
 function format(k){
  let out;
  if(place>0){const digits=String(k).padStart(place+1,'0');out=digits.slice(0,-place)+'.'+digits.slice(-place);}
  else out=String(k*10n**BigInt(-place));
  return (m[1]==='-'&&k!==0n?'-':'')+out;
 }
 return {halfUp:format(q+(2n*r>=unit?1n:0n)),up:format(q+(r?1n:0n)),down:format(q),even:format(q+(2n*r>unit||(2n*r===unit&&q%2n===1n)?1n:0n))};
}

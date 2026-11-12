export function parseScore(value){
 if(typeof value!=='string' && typeof value!=='number')throw new Error('数を入力してください');
 const s=String(value).trim().replace(/[！-～]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if(!/^[+]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,3})?$/.test(s))throw new Error('0以上の数を入力してください(小数第3位まで、カンマは3けた区切り)');
 const n=Number(s.replaceAll(',',''));
 if(!Number.isFinite(n)||n>1e9)throw new Error('数は10億以下で入力してください');
 return n;
}
function positive(value){const n=parseScore(value);if(n===0)throw new Error('標準偏差は0より大きい数にしてください');return n;}
function deviation(score,mean,sd){return 50+10*((score-mean)/sd);}
// 正規分布の上側確率の近似。対称性を使って負のzにも対応する。
export function upperPercent(z){
 if(!Number.isFinite(z))throw new Error('入力を確認してください(標準偏差は0より大きく、一覧は2〜1000個)');
 const x=Math.abs(z),t=1/(1+0.2316419*x);
 const tail=Math.exp(-x*x/2)/Math.sqrt(2*Math.PI)*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
 return Math.max(0,Math.min(100,100*(z<0?1-tail:tail)));
}
export function calculateHensachi(score,mean,sd){
 score=parseScore(score);mean=parseScore(mean);sd=positive(sd);
 const value=deviation(score,mean,sd);
 return {hensachi:value.toFixed(1),upperPercent:upperPercent((score-mean)/sd).toFixed(1)};
}
export function calculateTarget(target,mean,sd){
 target=parseScore(target);mean=parseScore(mean);sd=positive(sd);
 return mean+(target-50)/10*sd;
}
export function calculateList(input){
 if(typeof input!=='string')throw new Error('入力を確認してください(標準偏差は0より大きく、一覧は2〜1000個)');
 const lines=input.split(/\r?\n/).filter(line=>line.trim()!=='');
 if(lines.length<2||lines.length>1000)throw new Error('入力を確認してください(標準偏差は0より大きく、一覧は2〜1000個)');
 const scores=lines.map(parseScore);
 // 原点をずらして大きな点数同士の差の精度を保つ。
 const origin=scores[0],offset=scores.reduce((sum,x)=>sum+(x-origin),0)/scores.length;
 const mean=origin+offset;
 const sd=Math.sqrt(scores.reduce((sum,x)=>sum+((x-origin)-offset)**2,0)/scores.length);
 if(sd===0)throw new Error('標準偏差が0のため偏差値を計算できません');
 return {mean,sd,rows:scores.map(score=>({score,hensachi:deviation(score,mean,sd).toFixed(1)}))};
}

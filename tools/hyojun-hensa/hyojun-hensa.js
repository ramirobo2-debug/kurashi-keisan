const invalid=()=>new Error('数を2個以上1,000個以下で入力してください。数でない文字は使えません。');
const ambiguous=()=>new Error('区切りは改行か空白にしてください');
function parseList(input){
 if(typeof input!=='string'||input.length>110000)throw invalid();
 const s=input.trim().replace(/[！-～]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/−/g,'-');
 if(!s||/^,|,$|,\s*,/.test(s))throw invalid();
 const number=/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
 const groups=s.split(/\s+/u),grouped=/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
 // Thousands commas are accepted only when whitespace separates complete numbers.
 let tokens;
 if(groups.some(t=>grouped.test(t))){
  if(groups.length<2||!groups.every(t=>number.test(t)))throw ambiguous();
  tokens=groups;
 }else{
  if(groups.some(t=>/[0-9],\d{3}(?:\D|$)/.test(t)))throw ambiguous();
  tokens=s.split(/[\s,]+/u);
 }
 if(tokens.length<2||tokens.length>1000)throw invalid();
 return tokens.map(t=>{
  if(t.length>100||!number.test(t))throw invalid();
  const [a,b='']=t.replaceAll(',','').replace(/^[+-]/,'').split('.');
  return {n:BigInt(a+b)*(t.startsWith('-')?-1n:1n),places:b.length};
 });
}
export function fixed({n,d},places=4){
 const negative=n<0n,abs=negative?-n:n,scale=10n**BigInt(places);
 const q=(abs*scale*2n+d)/(2n*d),s=q.toString().padStart(places+1,'0');
 return (negative&&q!==0n?'-':'')+(places?s.slice(0,-places)+'.'+s.slice(-places):s);
}
export function calculateHyojunHensa(input='2,4,4,4,5,5,7,9'){
 const parsed=parseList(input),scale=10n**BigInt(Math.max(...parsed.map(v=>v.places)));
 const values=parsed.map(v=>v.n*(scale/10n**BigInt(v.places))),n=BigInt(values.length);
 const sum=values.reduce((a,b)=>a+b,0n),squares=values.reduce((a,b)=>a+b*b,0n),spread=n*squares-sum*sum;
 const mean={n:sum,d:n*scale},populationVariance={n:spread,d:n*n*scale*scale},sampleVariance={n:spread,d:n*(n-1n)*scale*scale};
 const sqrt=v=>Math.sqrt(Number(v.n)/Number(v.d)).toFixed(4);
 return {count:values.length,mean,populationVariance,populationStdDev:sqrt(populationVariance),sampleVariance,sampleStdDev:sqrt(sampleVariance)};
}

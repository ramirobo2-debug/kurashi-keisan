const error=()=>new Error('幅・高さ・比は0より大きい整数で入力してください。');
function integer(value){
 if(!['string','number','bigint'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100||!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s))throw error();
 const n=BigInt(s.replaceAll(',',''));if(n<=0n)throw error();return n;
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function fixed(n,d,places=4){
 const scale=10n**BigInt(places),q=(n*scale*2n+d)/(2n*d),s=q.toString().padStart(places+1,'0');
 return places?s.slice(0,-places)+'.'+s.slice(-places):s;
}
export function calculateAspect({mode='ratio',width='1920',height='1080',ratio='16:9',known='width',size='1280'}={}){
 if(mode==='ratio'){
  const w=integer(width),h=integer(height),g=gcd(w,h),a=w/g,b=h/g;
  return {ratio:`${a}:${b}`,decimal:fixed(w,h),note:a===64n&&b===27n?'約21:9 と呼ばれることがあります':''};
 }
 if(mode!=='size'||!['width','height'].includes(known)||typeof ratio!=='string')throw error();
 const parts=ratio.replaceAll('：',':').split(':');if(parts.length!==2)throw error();
 const [a,b]=parts.map(integer),v=integer(size),n=v*(known==='width'?b:a),d=known==='width'?a:b;
 if(n*2n<d)throw new Error('求める寸法が0.5未満になり、整数の画素にできません。寸法を大きくするか比を確かめてください。');
 return {dimension:known==='width'?'高さ':'幅',rounded:fixed(n,d,0),fractional:n%d!==0n,decimal:fixed(n,d)};
}

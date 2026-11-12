const PI={n:31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679n,d:10n**100n};
const abs=n=>n<0n?-n:n;
function gcd(a,b){a=abs(a);while(b){[a,b]=[b,a%b];}return a;}
function rat(n,d=1n){if(!d)throw new Error('分母は0にできません');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const mul=(a,b)=>rat(a.n*b.n,a.d*b.d);
const div=(a,b)=>rat(a.n*b.d,a.d*b.n);
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d);
function number(s){
 if(!/^[+-]?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,10})?|\.\d{1,10})$/.test(s))throw new Error('数を入力してください(小数10けたまで、カンマは3けた区切り)');
 const sign=s.startsWith('-')?-1n:1n;const [w,f='']=s.replace(/^[+-]/,'').replaceAll(',','').split('.');
 return rat(sign*BigInt((w||'0')+f),10n**BigInt(f.length));
}
function decimal(a,digits=10,trim=false){const scale=10n**BigInt(digits),v=abs(a.n)*scale/a.d;let f=String(v%scale).padStart(digits,'0');if(trim)f=f.replace(/0+$/,'');return (a.n<0n&&v!==0n?'-':'')+String(v/scale)+(f?'.'+f:'');}
function dms(a){const v=abs(a.n)*360000n/a.d;return (a.n<0n&&v!==0n?'-':'')+String(v/360000n)+'度'+String(v/6000n%60n)+'分'+decimal(rat(v%6000n,100n),2,true)+'秒';}
function piText(a){if(!a.n)return '0';return (a.n<0n?'-':'')+(abs(a.n)===1n?'':String(abs(a.n)))+'π'+(a.d===1n?'':'/'+a.d);}
export function kakudo(mode,value){
 if(!['degree','radian','dms'].includes(mode))throw new Error('角度を正しい形式で入力してください');
 if(!['string','number'].includes(typeof value))throw new Error('角度を正しい形式で入力してください');
 const s=String(value).normalize('NFKC').trim();if(s.length>120)throw new Error('角度を正しい形式で入力してください');
 let degree,radian,coefficient=null;
 if(mode==='degree'){degree=number(s);}
 if(mode==='radian'){
  if(s.includes('π')){const m=s.match(/^([+-]?(?:\d+(?:\.\d{1,10})?)?)π(?:\/([+-]?\d+))?$/);if(!m)throw new Error('π/6、2π/3 の形で入力してください');coefficient=div(number(m[1]===''||m[1]==='+'?'1':m[1]==='-'?'-1':m[1]),number(m[2]||'1'));degree=mul(coefficient,rat(180n));}
  else{radian=number(s);degree=div(mul(radian,rat(180n)),PI);}
 }
 if(mode==='dms'){
  const m=s.match(/^([+-]?)([\d,]+)度\s*(\d+)分\s*(\d+(?:\.\d{1,10})?)秒$/);if(!m)throw new Error('35度40分52.32秒の形で入力してください');
  const minutes=number(m[3]),seconds=number(m[4]);if(minutes.n>=60n*minutes.d||seconds.n>=60n*seconds.d)throw new Error('分と秒は0以上60未満にしてください');
  degree=mul(add(add(number(m[2]),div(minutes,rat(60n))),div(seconds,rat(3600n))),rat(m[1]==='-'?-1n:1n));
 }
 if(abs(degree.n)>1000000000000n*degree.d)throw new Error('角度を正しい形式で入力してください');
 if(mode!=='radian'||coefficient!==null)coefficient=div(degree,rat(180n));
 if(!radian)radian=mul(coefficient,PI);
 const normalized=rat(((degree.n%(360n*degree.d))+360n*degree.d)%(360n*degree.d),degree.d);
 return {degree:decimal(degree),radian:decimal(radian),pi:coefficient===null?null:piText(coefficient),dms:dms(degree),normalized:abs(degree.n)>=360n*degree.d?decimal(normalized):null};
}

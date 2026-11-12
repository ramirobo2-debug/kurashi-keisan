// 分子と分母はBigIntで計算する。
const abs=n=>n<0n?-n:n;
export function gcd(a,b){a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b];}return a;}
function integer(value,blank=false){
 if(!['string','bigint','number'].includes(typeof value) || (typeof value==='number'&&!Number.isSafeInteger(value))) throw new Error('整数を入力してください');
 const s=String(value).normalize('NFKC').trim().replaceAll('−','-');
 if(blank && s==='') return 0n;
 if(!/^[+-]?\d+$/.test(s)||s.length>1000) throw new Error('整数を入力してください(1000文字まで)');
 return BigInt(s);
}
export function fraction(numerator,denominator,whole=''){
 let n=integer(numerator),d=integer(denominator),w=integer(whole,true);
 // 整数部の「-0」も負の帯分数として扱う。
 const negative=w<0n||(typeof whole==='string'&&/^\s*[-−]/.test(whole.normalize('NFKC')));
 if(!d) throw new Error('分母は0にできません');
 if(d<0n){n=-n;d=-d;}
 // 負の帯分数は全体に負号を付ける。
 n=w*d+(negative?-n:n);
 return {n,d};
}
function reduced(n,d){if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g,gcd:g};}
function decimal(n,d){
 const sign=n<0n?'-':'';n=abs(n);
 let rest=n%d,out=sign+String(n/d);if(!rest)return out;
 let factor=d;while(factor%2n===0n)factor/=2n;while(factor%5n===0n)factor/=5n;
 out+='.';let digits=0;
 while(rest&&(factor===1n||digits<6)){rest*=10n;out+=String(rest/d);rest%=d;digits++;}
 return out+(rest?'…':'');
}
function present(n,d){
 const r=reduced(n,d),a=abs(r.n),w=a/r.d,rem=a%r.d;
 return {...r,fraction:r.d===1n?String(r.n):`${r.n}/${r.d}`,mixed:w&&rem?`${r.n<0n?'-':''}${w}と${rem}/${r.d}`:null,decimal:decimal(r.n,r.d)};
}
export function simplify(a){const r=present(a.n,a.d);return {...r,steps:`${a.n}/${a.d} → 分子・分母を${r.gcd}で割る → ${r.fraction}`};}
export function calculate(a,op,b){
 let n,d,steps;
 if(op==='+'||op==='-'){
  d=a.d/gcd(a.d,b.d)*b.d;const x=a.n*(d/a.d),y=b.n*(d/b.d);
  n=op==='+'?x+y:x-y;steps=`${a.n}/${a.d} ${op==='-'?'−':'+'} ${b.n}/${b.d} = ${x}/${d} ${op==='-'?'−':'+'} ${y}/${d} = ${n}/${d}`;
 }else if(op==='*'){n=a.n*b.n;d=a.d*b.d;steps=`${a.n}/${a.d} × ${b.n}/${b.d} = ${n}/${d}`;
 }else if(op==='/'){
  if(b.n===0n)throw new Error('0の分数では割れません');
  n=a.n*b.d;d=a.d*b.n;steps=`${a.n}/${a.d} ÷ ${b.n}/${b.d} = ${a.n}/${a.d} × ${b.d}/${b.n} = ${n}/${d}`;
 }else throw new Error('演算を選んでください');
 const r=present(n,d);return {...r,steps:steps+' = '+r.fraction};
}

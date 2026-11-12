import {integerRoot,root} from '../root/root.js';
const SCALE=10n**10n;
function parse(value){
 const error='辺は0より大きい10億以下の数で入力してください(小数10けたまで、カンマは3けた区切り)';
 if(!['string','number'].includes(typeof value))throw new Error(error);
 const s=String(value).normalize('NFKC').trim();
 if(s.length>100||!/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,10})?|\.\d{1,10})$/.test(s))throw new Error(error);
 const [w,f='']=s.replace(/^\+/,'').replaceAll(',','').split('.');
 const n=BigInt((w||'0')+f),d=10n**BigInt(f.length);
 if(n<=0n||n>1000000000n*d)throw new Error(error);
 return {n,d};
}
function decimal(n,d,offset=0n){
 const v=(integerRoot(n*SCALE*SCALE)+offset*SCALE)/d;
 const f=String(v%SCALE).padStart(10,'0').replace(/0+$/,'');
 return String(v/SCALE)+(f?'.'+f:'');
}
export function sanheiho(mode,first,second){
 if(!['hypotenuse','leg'].includes(mode))throw new Error('計算モードを選んでください');
 const x=parse(first),y=parse(second),d=x.d>y.d?x.d:y.d;
 const u=x.n*(d/x.d),v=y.n*(d/y.d);
 if(mode==='leg'&&u<=v)throw new Error('斜辺cは辺aより長くしてください');
 const rad=mode==='hypotenuse'?u*u+v*v:u*u-v*v;
 const integer=x.n%x.d===0n&&y.n%y.d===0n;
 return {label:mode==='hypotenuse'?'斜辺 c':'残りの辺 b',value:decimal(rad,d),
 simplified:integer?root(rad/(d*d)).simplified:null,
 area:mode==='hypotenuse'?decimal((u*v)**2n,2n*d*d):decimal(rad*v*v,2n*d*d),
 perimeter:decimal(rad,d,u+v)};
}

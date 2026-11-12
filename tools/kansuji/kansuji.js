const digits='零一二三四五六七八九', formal='零壱弐参四伍陸漆捌玖', limit=10n**20n;
function checked(n){if(n<0n||n>=limit)throw new Error('0以上10^20未満の整数を入力してください');return n;}
export function toKansuji(value){
 if(!['string','bigint','number'].includes(typeof value)||(typeof value==='number'&&!Number.isSafeInteger(value)))throw new Error('整数を文字列で入力してください');
 const s=String(value).normalize('NFKC').trim();
 if(!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(s))throw new Error('整数を入力してください(カンマは3けた区切り)');
 const n=checked(BigInt(s.replaceAll(',','')));
 function render(big){
  if(n===0n)return '零';
  const ds=big?formal:digits,small=big?['','拾','百','千']:['','十','百','千'],large=big?['','萬','億','兆','京']:['','万','億','兆','京'];
  let rest=n,out='';
  for(let g=0;rest;g++,rest/=10000n){let chunk='',part=Number(rest%10000n);for(let k=3;k>=0;k--){const d=Math.floor(part/10**k)%10;if(d)chunk+=(d===1&&k>0&&!big?'':ds[d])+small[k];}if(chunk)out=chunk+large[g]+out;}
  return out;
 }
 return {number:n,normal:render(false),positional:[...String(n)].map(c=>'〇一二三四五六七八九'[Number(c)]).join(''),daiji:render(true)};
}
export function fromKansuji(value){
 if(typeof value!=='string')throw new Error('漢数字を入力してください');
 const aliases={'壱':'一','弐':'二','参':'三','肆':'四','伍':'五','陸':'六','漆':'七','捌':'八','玖':'九','拾':'十','佰':'百','阡':'千','萬':'万','〇':'零'};
 const s=[...value.trim().replace(/^金/,'').replace(/(?:円也|円|也)$/,'')].map(c=>aliases[c]??c).join('');
 if(!s||!/^[零一二三四五六七八九十百千万億兆京]+$/.test(s))throw new Error('読めない文字があります。漢数字を入力してください');
 if(!/[十百千万億兆京]/.test(s))return checked(BigInt([...s].map(c=>digits.indexOf(c)).join('')));
 const units={'十':10n,'百':100n,'千':1000n},groups={'万':10000n,'億':100000000n,'兆':1000000000000n,'京':10000000000000000n};
 let total=0n,section=0n,pending=null,lastSmall=10000n,lastGroup=limit;
 for(const c of s){
  if(digits.includes(c)){if(pending!==null||c==='零')throw new Error('位の表記に数字の連続や零は使えません');pending=BigInt(digits.indexOf(c));}
  else if(units[c]){const u=units[c];if(u>=lastSmall)throw new Error('位は大きい順に1回ずつ指定してください');section+=(pending??1n)*u;pending=null;lastSmall=u;}
  else{const u=groups[c];if(u>=lastGroup||section===0n&&pending===null)throw new Error('万・億・兆・京は数の後に大きい順で指定してください');total+=(section+(pending??0n))*u;section=0n;pending=null;lastSmall=10000n;lastGroup=u;}
 }
 return checked(total+section+(pending??0n));
}

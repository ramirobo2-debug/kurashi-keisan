const error=()=>new Error('入力を確認してください。電圧は100Vか200V、電力・電流は0以上の数を入力してください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100||!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const [a,b='']=s.replaceAll(',','').split('.');return {n:BigInt(a+b),d:10n**BigInt(b.length)};
}
const mul=(a,b)=>({n:a.n*b.n,d:a.d*b.d}),div=(a,b)=>({n:a.n*b.d,d:a.d*b.n});
const add=(a,b)=>({n:a.n*b.d+b.n*a.d,d:a.d*b.d});
export function fixed(v,places=1){
 if(!Number.isInteger(places)||places<0||places>10000)throw error();
 const q=(v.n*10n**BigInt(places)*2n+v.d)/(2n*v.d),s=q.toString().padStart(places+1,'0');
 return places?s.slice(0,-places)+'.'+s.slice(-places):s;
}
export function decimal(v){
 let d=v.d,places=0;while(d>1n&&d%10n===0n){d/=10n;places++;}
 return fixed(v,places).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
}
export function ampereText(v){return v.n>0n&&fixed(v)==='0.0'?'0.1A未満':fixed(v).replace(/\.0$/,'')+'A';}
export function calculateAmpere({mode='ampere',voltage='100',watts=['1200'],ampere='15',contract=''}={}){
 if(!['ampere','watt'].includes(mode))throw error();
 const v=parse(voltage);if(v.n!==100n*v.d&&v.n!==200n*v.d)throw error();
 let total,current;
 if(mode==='ampere'){
  if(!Array.isArray(watts)||watts.length===0||watts.length>100)throw error();
  total=watts.map(parse).reduce(add,{n:0n,d:1n});current=div(total,v);
 }else{current=parse(ampere);total=mul(current,v);}
 let comparison='';
 if(String(contract??'').trim()!==''){
  // 契約アンペアは100V換算(契約A×100V=VA)で比べる。200Vの機器は同じ電流でも2倍に数える
  const c=parse(contract),contractCurrent=div(total,{n:100n,d:1n});comparison=contractCurrent.n*c.d>c.n*contractCurrent.d?'超える':'収まる';
  return {total,current,comparison,contractCurrent};
 }
 return {total,current,comparison};
}

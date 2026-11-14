const error=()=>new Error('入力を確認してください。有限の数を入力し、arcsin・arccosは−1以上1以下にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，＋－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');
 if(s.length>100||!/^[-+]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const n=Number(s.replaceAll(',',''));if(!Number.isFinite(n))throw error();return n;
}
export function fixed(value){
 const s=(Math.round(Math.abs(value)*1e6)/1e6).toFixed(6);
 return value<0&&s!=='0.000000'?'-'+s:s;
}
const sinExact={0:'0',30:'1/2',45:'√2/2',60:'√3/2',90:'1',120:'√3/2',135:'√2/2',150:'1/2',180:'0',210:'-1/2',225:'-√2/2',240:'-√3/2',270:'-1',300:'-√3/2',315:'-√2/2',330:'-1/2'};
const tanExact={0:'0',30:'√3/3',45:'1',60:'√3',90:null,120:'-√3',135:'-1',150:'-√3/3',180:'0',210:'√3/3',225:'1',240:'√3',270:null,300:'-√3',315:'-1',330:'-√3/3'};
export function calculateSankaku({mode='forward',angle='30',unit='deg',func='arcsin',value='0.5'}={}){
 if(!['forward','inverse'].includes(mode))throw error();
 if(mode==='inverse'){
  if(!['arcsin','arccos','arctan'].includes(func))throw error();
  const v=parse(value);if(func!=='arctan'&&Math.abs(v)>1)throw error();
  const radians=Math[{arcsin:'asin',arccos:'acos',arctan:'atan'}[func]](v);
  return {degrees:radians*180/Math.PI,radians};
 }
 if(!['deg','rad'].includes(unit))throw error();
 const a=parse(angle),period=unit==='deg'?360:2*Math.PI;
 const remainder=a%period,reduced=remainder<0?remainder+period:remainder;
 const degrees=unit==='deg'?reduced:reduced*180/Math.PI;
 const radians=unit==='deg'?degrees*Math.PI/180:reduced;
 // Degree inputs are exact; radians allow only conversion-sized rounding errors.
 const key=Object.keys(sinExact).map(Number).find(k=>unit==='deg'?degrees===k:Math.abs(degrees-k)<1e-12);
 const exact=key===undefined?{}:{sin:sinExact[key],cos:sinExact[(key+90)%360],tan:tanExact[key]};
 return {sin:Math.sin(radians),cos:Math.cos(radians),tan:key===90||key===270?null:Math.tan(radians),exact};
}

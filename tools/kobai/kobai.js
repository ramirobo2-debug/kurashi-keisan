const error=()=>new Error('入力を確認してください。勾配と距離は0以上、角度は90度未満、比のnは0より大きい数にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/−/g,'-');
 if(s.length>100||! /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const n=Number(s.replaceAll(',',''));if(!Number.isFinite(n)||n<0)throw error();return n===0?0:n;
}
export function fixed(value,places=2){
 if(!Number.isFinite(value)||!Number.isInteger(places)||places<0||places>6)throw error();
 const s=value.toFixed(places);return Number(s)===0?s.replace('-',''):s;
}
export function calculateKobai({mode='sun',value='4',distance=''}={}){
 if(!['percent','degree','sun','ratio'].includes(mode))throw error();
 const v=parse(value);if(mode==='degree'&&v>=90||mode==='ratio'&&v<=0)throw error();
 const slope=mode==='percent'?v/100:mode==='sun'?v/10:mode==='ratio'?1/v:Math.tan(v*Math.PI/180);
 const percent=slope*100,sun=slope*10,degree=Math.atan(slope)*180/Math.PI,ratio=slope===0?null:1/slope;
 const hasDistance=String(distance??'').trim()!=='';
 const horizontal=hasDistance?parse(distance):null,height=hasDistance?horizontal*slope:null,length=hasDistance?Math.hypot(horizontal,height):null;
 if([slope,percent,sun,degree,ratio,height,length].some(n=>n!==null&&!Number.isFinite(n)))throw error();
 return {slope,percent,sun,degree,ratio,horizontal,height,length};
}

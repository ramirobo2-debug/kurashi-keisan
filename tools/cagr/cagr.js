const error = () => new Error('入力を確認してください。最初の値と年数は0より大きく、最後の値は0以上、年率は-100%以上にしてください。');
function parse(value){
 if(!['string','number'].includes(typeof value))throw error();
 const s=String(value).trim().replace(/[０-９．，－]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw error();
 const n=Number(s.replaceAll(',',''));if(!Number.isFinite(n))throw error();return n;
}
export function calculateCagr({mode='rate',start='100',end='150',years='5',rate='10'}={}){
 if(!['rate','end'].includes(mode))throw error();
 const a=parse(start), n=parse(years);
 if(a<=0 || n<=0)throw error();
 let b,r;
 if(mode==='rate'){
  b=parse(end);if(b<0)throw error();
  r=b===0?-1:Math.expm1((Math.log(b)-Math.log(a))/n);
 }else{
  r=parse(rate)/100;if(r < -1)throw error();
  b=r===-1?0:Math.exp(Math.log(a)+n*Math.log1p(r));
 }
 const simple=(b/a-1)/n;
 if(![b,r,simple,r*100,simple*100].every(Number.isFinite) || (b===0 && r!==-1))throw error();
 return {start:a,end:b,years:n,rate:r,simple};
}
export const fixed2 = n => (Object.is(Number(n.toFixed(2)),-0)?0:n).toFixed(2);

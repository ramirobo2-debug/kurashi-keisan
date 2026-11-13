const error = () => new Error('入力を確認してください。取得価額は1円以上の整数、耐用年数は2〜50年の整数、使い始めた月は1〜12月で入力してください。');
function parse(value){
 if(!['string','number'].includes(typeof value) || (typeof value==='number' && !Number.isSafeInteger(value)))throw error();
 const s=String(value).trim().replace(/[０-９，]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
 if(s.length>100 || !/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s))throw error();
 return BigInt(s.replaceAll(',',''));
}
export function calculateGenkaShokyaku({cost='1000000',years='5',month='1'}={}){
 const c=parse(cost), y=parse(years), m=parse(month);
 if(c<1n || y<2n || y>50n || m<1n || m>12n)throw error();
 const rate=(1000n+y-1n)/y, annual=c*rate/1000n, rows=[];
 let book=c;
 for(let year=1;book>1n;year++){
  const planned=year===1?c*rate*(13n-m)/12000n:annual;
  const amount=planned<book-1n?planned:book-1n;
  book-=amount;rows.push({year,amount,book});
  if(annual===0n)break;
 }
 return {cost:c,rate:'0.'+String(rate).padStart(3,'0'),annual,rows,total:c-book,book,complete:book===1n};
}

// 税額表: specs/inshi-values.md (2026-11-13確認)
export const TABLES = {
 receipt: [[1000000,200],[2000000,400],[3000000,600],[5000000,1000],[10000000,2000],[20000000,4000],[30000000,6000],[50000000,10000],[100000000,20000],[200000000,40000],[300000000,60000],[500000000,100000],[1000000000,150000],[Infinity,200000]],
 estate: [[100000,200],[500000,400],[1000000,1000],[5000000,2000],[10000000,10000],[50000000,20000],[100000000,60000],[500000000,100000],[1000000000,200000],[5000000000,400000],[Infinity,600000]],
 contract: [[1000000,200],[2000000,400],[3000000,1000],[5000000,2000],[10000000,10000],[50000000,20000],[100000000,60000],[500000000,100000],[1000000000,200000],[5000000000,400000],[Infinity,600000]],
 estateReduced: [[500000,200],[1000000,500],[5000000,1000],[10000000,5000],[50000000,10000],[100000000,30000],[500000000,60000],[1000000000,160000],[5000000000,320000],[Infinity,480000]],
 contractReduced: [[2000000,200],[3000000,500],[5000000,1000],[10000000,5000],[50000000,10000],[100000000,30000],[500000000,60000],[1000000000,160000],[5000000000,320000],[Infinity,480000]]
};
export function parseAmount(value){
 if(typeof value!=='string'&&typeof value!=='number')throw new Error('入力を確認してください(金額は0〜1兆円の整数)');
 const s=String(value).normalize('NFKC').trim();
 if(s.length>30||! /^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(s))throw new Error('入力を確認してください(金額は0〜1兆円の整数)');
 const n=Number(s.replaceAll(',',''));
 if(!Number.isSafeInteger(n)||n>1e12)throw new Error('入力を確認してください(金額は0〜1兆円の整数)');
 return n;
}
function validDate(s){
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
export function inshi({type='receipt',amount,unwritten=false,business=true,separateTax=false,exempt=false,taxAmount='0',construction=false,date='2026-11-13'}={}){
 if(!['receipt','estate','contract'].includes(type))throw new Error('入力を確認してください(金額は0〜1兆円の整数)');
 for(const v of [unwritten,business,separateTax,exempt,construction])if(typeof v!=='boolean')throw new Error('入力を確認してください(金額は0〜1兆円の整数)');
 if(type!=='receipt'&&!validDate(date))throw new Error('作成日を正しい日付で入れてください');
 let basis=null;
 if(!unwritten){basis=parseAmount(amount);if(separateTax&&!exempt){const tax=parseAmount(taxAmount);if(tax>basis)throw new Error('消費税額は記載金額以下にしてください');basis-=tax;}}
 if(type==='receipt'&&!business)return {tax:0,basis,rule:'営業に関しない受取書: 非課税'};
 if(unwritten)return {tax:200,basis,rule:'金額の記載なし'};
 if(basis<(type==='receipt'?50000:10000))return {tax:0,basis,rule:'非課税'};
 const reduced=type!=='receipt'&&date>='2014-04-01'&&date<='2027-03-31'&&(type==='estate'?basis>100000:construction&&basis>1000000);
 const key=type+(reduced?'Reduced':'');
 return {tax:TABLES[key].find(([upper])=>basis<=upper)[1],basis,rule:reduced?'軽減措置適用':'本則'};
}
export const yen=n=>n.toLocaleString('ja-JP')+'円';

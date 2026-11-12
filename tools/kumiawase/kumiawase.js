function integer(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('0〜1000の整数を入力してください');
 const s=String(value).normalize('NFKC').trim();
 if(s.length>100||! /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s))throw new Error('0〜1000の整数を入力してください(カンマは3けた区切り)');
 const n=Number(s.replaceAll(',',''));if(n>1000)throw new Error('0〜1000の整数を入力してください');return n;
}
function product(n,r){let v=1n;for(let i=0;i<r;i++)v*=BigInt(n-i);return v;}
function choose(n,r){let v=1n;for(let i=1;i<=Math.min(r,n-r);i++)v=v*BigInt(n-i+1)/BigInt(i);return v;}
export function formatResult(value){const s=String(value);return s.length>100?s.slice(0,30)+'…'+s.slice(-30)+` (${s.length}けた)`:s;}
export function calculate(nValue,rValue){
 const n=integer(nValue),r=integer(rValue),over=r>n;if(over&&n===0)throw new Error('r は n 以下にしてください(重複を許す計算は n が1以上なら r > n でも計算します)');
 const permutation=over?null:product(n,r),combination=over?null:choose(n,r),factorial=product(n,n),power=BigInt(n)**BigInt(r),repetition=n>=1?choose(n+r-1,r):null;
 const numerator=Array.from({length:r},(_,i)=>n-i).join('×')||'1';
 const denominator=Array.from({length:r},(_,i)=>r-i).join('×')||'1';
 return {n,r,permutation,combination,factorial,power,repetition,formula:!over&&r<=10?`${n}C${r} = ${numerator} ÷ (${denominator}) = ${formatResult(combination)}`:'',note:over?'r が n より大きいので、重複を許さない順列・組み合わせはありません(0通り)。重複順列と重複組み合わせだけを計算します。':n===0&&r===0?'0の0乗は1とする決まりで表示します。':''};
}
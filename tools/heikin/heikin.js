function format(n,d=1n,digits=3){
 const negative=n<0n;n=negative?-n:n;const scale=10n**BigInt(digits);
 const r=(n*scale*2n+d)/(2n*d), f=(r%scale).toString().padStart(digits,'0').replace(/0+$/,'');
 return (negative&&r!==0n?'-':'')+r/scale+(f?'.'+f:'');
}
function sqrtFloor(n){if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));while(true){const y=(x+n/x)/2n;if(y>=x)return x;x=y;}}
function deviation(n,d){const s=n*10000n;let q=sqrtFloor(s/d);if(4n*s>=d*(2n*q+1n)**2n)q++;return format(q,100n,2);}
export function calculateStatistics(input){
 if(typeof input!=='string')throw new Error('数を1個以上入力してください');
 const tokens=input.trim().split(/[\s,，、]+/u).filter(Boolean);
 if(!tokens.length)throw new Error('数を1個以上入力してください');
 if(tokens.length>1000)throw new Error('数は1,000個まで入力できます');
 const values=tokens.map(token=>{
 const s=token.replace(/[！-～]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).replace(/−/g,'-');
 if(s.length>100||!/^[+-]?[0-9]+(?:\.[0-9]{1,3})?$/.test(s))throw new Error('「'+token+'」は数として読み取れません(小数第3位まで)');
 const [w,f='']=s.replace(/^[+-]/,'').split('.');
 return (BigInt(w)*1000n+BigInt(f.padEnd(3,'0')))*(s.startsWith('-')?-1n:1n);
 }).sort((a,b)=>a<b?-1:a>b?1:0);
 const count=values.length,n=BigInt(count),sum=values.reduce((a,b)=>a+b,0n),squares=values.reduce((a,b)=>a+b*b,0n),v=n*squares-sum*sum;
 const frequencies=new Map();for(const x of values)frequencies.set(x,(frequencies.get(x)||0)+1);
 const maxFrequency=Math.max(...frequencies.values()),middle=Math.floor(count/2);
 return {count,sum:format(sum,1000n),mean:format(sum,1000n*n,2),
 median:count%2?format(values[middle],1000n):format(values[middle-1]+values[middle],2000n,4),
 modes:maxFrequency===1?[]:[...frequencies].filter(([,f])=>f===maxFrequency).map(([x])=>format(x,1000n)),
 max:format(values[count-1],1000n),min:format(values[0],1000n),range:format(values[count-1]-values[0],1000n),
 populationStdDev:deviation(v,n*n*1000000n),sampleStdDev:count>1?deviation(v,n*(n-1n)*1000000n):null};
}

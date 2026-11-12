function fraction(n,d=1n){
 if(d===0n)throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');
 let a=n,b=d;while(b)[a,b]=[b,a%b];return {n:n/(a||1n),d:d/(a||1n)};
}
const mul=(a,b)=>fraction(a.n*b.n,a.d*b.d);
const div=(a,b)=>fraction(a.n*b.d,a.d*b.n);
const add=(a,b)=>fraction(a.n*b.d+b.n*a.d,a.d*b.d);
function decimal(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');
 const s=String(value).normalize('NFKC').trim();
 if(s.length>100||! /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');
 const [i,f='']=s.replaceAll(',','').split('.');return fraction(BigInt(i+f),10n**BigInt(f.length));
}
function unit(units,key){if(!Object.hasOwn(units,key))throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');return fraction(units[key][0],units[key][1]);}
const SPEED={kmh:[5n,18n],mpm:[1n,60n],mps:[1n,1n]},DISTANCE={km:[1000n,1n],m:[1n,1n]};
function rounded(r){return (r.n*100n*2n+r.d)/(2n*r.d);}
function hundredths(n){return (n/100n)+((n%100n)?'.'+String(n%100n).padStart(2,'0').replace(/0+$/,''):'');}
export const format=r=>hundredths(rounded(r));
export function calculate({mode='distance',speed='60',speedUnit='kmh',distance='120',distanceUnit='km',hours='2',minutes='30',seconds='0'}={}){
 if(!['distance','time','speed'].includes(mode))throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');
 let v,t,d;
 if(mode!=='speed'){v=mul(decimal(speed),unit(SPEED,speedUnit));if(v.n===0n)throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');}
 if(mode!=='time')t=add(add(mul(decimal(hours),fraction(3600n)),mul(decimal(minutes),fraction(60n))),decimal(seconds));
 if(mode!=='distance')d=mul(decimal(distance),unit(DISTANCE,distanceUnit));
 const distanceFactor=unit(DISTANCE,distanceUnit);
 if(mode==='distance')d=mul(v,t);
 if(mode==='time')t=div(d,v);
 if(mode==='speed'){if(t.n===0n)throw new Error('入力と単位を確認してください(負の数・0での割り算は使えません)');v=div(d,t);}
 const total=rounded(t),h=total/360000n,m=total%360000n/6000n,s=total%6000n;
 return {distance:format(div(d,distanceFactor)),distanceUnit,kmh:format(div(v,unit(SPEED,'kmh'))),mpm:format(div(v,unit(SPEED,'mpm'))),mps:format(v),time:`${h}時間${m}分${hundredths(s)}秒`,hours:format(div(t,fraction(3600n))),exactSpeed:v};
}

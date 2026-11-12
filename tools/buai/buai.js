function number(value){
 if(!['string','number','bigint'].includes(typeof value))throw new Error('数を入力してください');
 const s=String(value).normalize('NFKC').trim();
 if(s.length>200||!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(s))throw new Error('0以上の数を入力してください(カンマは3けた区切り)');
 const [a,b='']=s.replaceAll(',','').split('.');return [BigInt(a+b),10n**BigInt(b.length)];
}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function decimal(n,d){const a=n/d;let r=n%d,s='';while(r){r*=10n;s+=r/d;r%=d;}return String(a)+(s?'.'+s:'');}
export function calculate(mode,value){
 let n,d;
 if(mode==='percent'||mode==='decimal'){[n,d]=number(value);if(mode==='percent')d*=100n;}
 else if(mode==='buai'){
  if(!Array.isArray(value)||value.length!==4)throw new Error('割・分・厘・毛の4つを入力してください');
  n=0n;d=10000n;
  value.forEach((v,i)=>{const [a,b]=number(v);if(b!==1n)throw new Error('歩合の各欄は整数を入力してください');if(i>0&&a>9n)throw new Error('分・厘・毛は0〜9を入力してください');n+=a*10n**BigInt(3-i);});
 }else throw new Error('変換方法を選んでください');
 if(n>10n*d)throw new Error('0〜1000%・小数0〜10の範囲で入力してください');
 const g=gcd(n,d);n/=g;d/=g;
 const rounded=n*10000n%d!==0n;let units=(n*10000n*2n+d)/(2n*d);const parts=[];
 for(const [unit,weight] of [['割',1000n],['分',100n],['厘',10n],['毛',1n]]){const v=units/weight;units%=weight;if(v)parts.push(String(v)+unit);}
 return {buai:parts.join('')||'0割',percent:decimal(n*100n,d)+'%',decimal:decimal(n,d),fraction:String(n)+'/'+String(d),rounded,numerator:n,denominator:d};
}

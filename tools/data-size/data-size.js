// 入力は10のべき乗を分母とする分数で保持する。
export const FACTORS = { B:1n, KB:1000n, MB:1000000n, GB:1000000000n, TB:1000000000000n, KiB:1024n, MiB:1048576n, GiB:1073741824n, TiB:1099511627776n };
function parse(value) {
 const error = '0以上の数字を入力してください(小数20桁まで、カンマは3桁区切り)';
 if (typeof value !== 'string' && typeof value !== 'number') throw new Error(error);
 const s=String(value).trim().replace(/[０-９．＋，]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0));
 if(s.length>100 || !/^\+?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,20})?|\.\d{1,20})$/.test(s)) throw new Error(error);
 const [whole,fraction='']=s.replace(/^\+/,'').replaceAll(',','').split('.');
 return [BigInt((whole||'0')+fraction),10n**BigInt(fraction.length)];
}
function factor(unit) {
 if(typeof unit!=='string'||!Object.hasOwn(FACTORS,unit)) throw new Error('容量の単位を選んでください');
 return FACTORS[unit];
}
function round(n,d) { return (n*2n+d)/(2n*d); }
function format(n,d,digits) {
 const scale=10n**BigInt(digits),v=round(n*scale,d);
 if(!digits) return String(v);
 const f=String(v%scale).padStart(digits,'0').replace(/0+$/,'');
 return String(v/scale)+(f?'.'+f:'');
}
export function convertSize(value,unit='GB',digits=2) {
 if(!Number.isInteger(digits)||digits<0||digits>6) throw new Error('表示桁は0〜6を選んでください');
 const [n,d]=parse(value),bytes=n*factor(unit);
 return Object.fromEntries(Object.entries(FACTORS).map(([key,f])=>[key,format(bytes,d*f,digits)]));
}
export function transferTime(value,unit='GB',speed='100',speedUnit='Mbps') {
 const [n,d]=parse(value),[s,sd]=parse(speed);
 if(s===0n) throw new Error('通信速度は0より大きい数字を入力してください');
 if(!['Mbps','Gbps'].includes(speedUnit)) throw new Error('通信速度の単位を選んでください');
 const numerator=n*factor(unit)*8n*sd,denominator=d*s*(speedUnit==='Mbps'?1000000n:1000000000n);
 // 1秒未満は0.1秒、それ以外は1秒単位で四捨五入する。
 const seconds=numerator<denominator?format(numerator,denominator,1):String(round(numerator,denominator));
 const total=round(numerator,denominator),hours=total/3600n,minutes=total%3600n/60n;
 return {seconds,time:numerator<denominator?'0時間0分'+seconds+'秒':hours+'時間'+minutes+'分'+total%60n+'秒'};
}

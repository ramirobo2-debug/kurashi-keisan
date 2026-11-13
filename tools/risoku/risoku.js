import { parseAmount } from '../tax/tax.js';
const normalize = v => String(v).trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0)-65248)).replace(/．/g, '.').replace(/，/g, ',');
export const yen = n => n.toLocaleString('ja-JP') + '円';
export function calculateRisoku({principal, rate, period, unit='year', method='simple'} = {}) {
  const amount = parseAmount(principal);
  if (amount === null || amount <= 0) throw new Error('元金は1円〜1兆円の整数で入れてください');
  if (!['string','number'].includes(typeof rate) || !/^\d+(?:\.\d{1,3})?$/.test(normalize(rate))) throw new Error('年利は0〜100%、小数第3位までで入れてください');
  const [whole, decimal=''] = normalize(rate).split('.');
  const r = BigInt(whole)*1000n + BigInt(decimal.padEnd(3,'0'));
  if (r > 100000n) throw new Error('年利は0〜100%で入れてください');
  const n = parseAmount(period);
  const units = {year:1, month:12, day:365};
  if (!Object.hasOwn(units,unit) || !['simple','compound'].includes(method)) throw new Error('入力を確認してください');
  const divisor = units[unit];
  if (n === null || n < 1 || n > divisor*100) throw new Error('期間は1〜100年相当の整数で入れてください');
  const initial = BigInt(amount), yearly=[];
  let balance=initial, interest=0n, incomeTax=0n, residentTax=0n;
  function settle(length, year, partial) {
    const gross=balance*r*BigInt(length)/(100000n*BigInt(divisor));
    const income=gross*15315n/100000n, resident=gross*5n/100n;
    const net=gross-income-resident;
    interest+=gross; incomeTax+=income; residentTax+=resident;
    balance+=net;
    yearly.push({year, partial, interest:gross, incomeTax:income, residentTax:resident, net, total:balance});
  }
  if (method==='simple') settle(n,1,false);
  else {
    const years=Math.floor(n/divisor), rest=n%divisor;
    for(let i=1;i<=years;i++) settle(divisor,i,false);
    if(rest) settle(rest,years+1,true);
  }
  return {interest,incomeTax,residentTax,net:interest-incomeTax-residentTax,total:balance,yearly:method==='compound'?yearly:[]};
}

export const PAPER_SIZES = Object.freeze(Object.fromEntries(Object.entries({
 A0:[841,1189],A1:[594,841],A2:[420,594],A3:[297,420],A4:[210,297],A5:[148,210],A6:[105,148],
 B0:[1030,1456],B1:[728,1030],B2:[515,728],B3:[364,515],B4:[257,364],B5:[182,257],B6:[128,182],hagaki:[100,148]
}).map(([key,size])=>[key,Object.freeze(size)])));
export function calculateYoushi({from='A4',to='A3'}={}){
 if(!Object.hasOwn(PAPER_SIZES,from)||!Object.hasOwn(PAPER_SIZES,to))throw new Error('元の用紙と変えたい用紙を選んでください。');
 const [fw,fh]=PAPER_SIZES[from], [tw,th]=PAPER_SIZES[to];
 // 幅と高さの比を交差積で比較し、丸めるまで整数で計算する。
 const [n,d]=tw*fh<=th*fw?[tw,fw]:[th,fh];
 const tenth=Math.floor((n*2000+d)/(2*d));
 return {from,to,fromSize:PAPER_SIZES[from],toSize:PAPER_SIZES[to],percent:Math.floor(n*100/d),decimal:`${Math.floor(tenth/10)}.${tenth%10}`};
}

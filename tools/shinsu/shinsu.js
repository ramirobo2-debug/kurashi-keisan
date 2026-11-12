const MAX = (1n << 64n) - 1n;

export function convertBase(value, base = 10) {
 if (![2, 8, 10, 16].includes(base)) throw new Error('進数は2・8・10・16から選んでください');
 if (typeof value !== 'string') throw new Error('数を文字列で入力してください');
 let s = value.normalize('NFKC').trim();
 // 10進数だけは3けた区切りのカンマを受け付ける。
 if (base === 10 && /^\d{1,3}(?:,\d{3})+$/.test(s)) s = s.replaceAll(',', '');
 // 選んだ進数の接頭辞だけを除く(16進数の 0b1 は 0xB1 として読む)。
 const head = {2:/^0b/i, 8:/^0o/i, 10:null, 16:/^0x/i}[base];
 if (head) s = s.replace(head, '');
 const patterns = {2:/^[01]+$/, 8:/^[0-7]+$/, 10:/^[0-9]+$/, 16:/^[0-9a-f]+$/i};
 if (!patterns[base].test(s)) throw new Error(base + '進数で使える数字だけで、0以上の整数を入力してください');
 s = s.replace(/^0+(?=.)/, '');
 if (s.length > MAX.toString(base).length) throw new Error('18446744073709551615以下の整数を入力してください');
 const prefix = {2:'0b', 8:'0o', 10:'', 16:'0x'};
 const n = BigInt(prefix[base] + s);
 if (n > MAX) throw new Error('18446744073709551615以下の整数を入力してください');
 const binary = n.toString(2);
 return {binary, groupedBinary:binary.replace(/\B(?=(?:.{4})+$)/g, ' '), octal:n.toString(8), decimal:n.toString(10), hexadecimal:n.toString(16).toUpperCase()};
}

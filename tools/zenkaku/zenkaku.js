const half = [..."｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ"];
const full = [..."。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜"];
const toFull = new Map(half.map((c, i) => [c, full[i]]));
const toHalf = new Map(full.map((c, i) => [c, half[i]]));
for (const [bases, voiced, mark] of [
 ["ｳｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ", "ヴガギグゲゴザジズゼゾダヂヅデドバビブベボ", "ﾞ"],
 ["ﾊﾋﾌﾍﾎ", "パピプペポ", "ﾟ"],
]) [...bases].forEach((c, i) => { toFull.set(c + mark, [...voiced][i]); toHalf.set([...voiced][i], c + mark); });

export function convertWidth(text, { direction = "half", alphanumeric = true, symbols = true, spaces = true, katakana = true } = {}) {
 if (typeof text !== "string") throw new TypeError("文章を入力してください");
 if (!["half", "full"].includes(direction)) throw new RangeError("変換の向きを選んでください");
 const chars = [...text];
 if (chars.length > 100000) throw new RangeError("文章は10万字以内で入力してください");
 let output = "", changed = 0;
 for (let i = 0; i < chars.length; i++) {
  const original = chars[i];
  let source = original, converted = original;
  if (katakana) {
   if (direction === "full" && ["ﾞ", "ﾟ"].includes(chars[i + 1]) && toFull.has(original + chars[i + 1])) {
    source += chars[++i]; converted = toFull.get(source);
   } else converted = (direction === "full" ? toFull : toHalf).get(original) ?? original;
  }
  if (spaces && original === (direction === "half" ? "　" : " ")) converted = direction === "half" ? " " : "　";
  const code = original.codePointAt(0);
  const ascii = direction === "half" ? code - 0xfee0 : code;
  // 円・バックスラッシュ、チルダ・波ダッシュは保持する。
  if (ascii >= 0x21 && ascii <= 0x7e && ascii !== 0x5c && ascii !== 0x7e) {
   const isAlphanumeric = /[0-9A-Za-z]/.test(String.fromCodePoint(ascii));
   if (isAlphanumeric ? alphanumeric : symbols) converted = String.fromCodePoint(direction === "half" ? ascii : ascii + 0xfee0);
  }
  output += converted;
  if (converted !== source) changed += [...source].length;
 }
 return { text: output, changed };
}

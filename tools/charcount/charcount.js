// 改行を文字数から除外し、UTF-8は元の改行コードで測る。
export function countCharacters(text) {
  if (typeof text !== "string") throw new TypeError("文章を入力してください");
  if (typeof Intl.Segmenter !== "function") throw new Error("Intl.Segmenter対応の新しいブラウザで開いてください");
  const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
  const newlines = (text.match(/\r\n|\r|\n/g) || []).length;
  let withSpaces = 0, withoutSpaces = 0;
  for (const { segment } of segmenter.segment(text)) {
    if (/^(?:\r\n|\r|\n)$/.test(segment)) continue;
    withSpaces++;
    if (!/^\s+$/u.test(segment)) withoutSpaces++;
  }
  return {
    withSpaces, withoutSpaces, newlines,
    lines: text === "" ? 0 : newlines + 1,
    manuscriptPages: withSpaces / 400,
    utf8Bytes: new TextEncoder().encode(text).length,
  };
}

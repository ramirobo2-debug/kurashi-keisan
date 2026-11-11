// 出典: 厚生労働省「生活活動のメッツ表」「運動のメッツ表」(2026年1月版。国立健康・栄養研究所 改訂版「身体活動のメッツ(METs)表」より改変)。
// 2026-11-11 作業者が原文で項目名と値を確認(specs/mets-values.md)。ネットワーク未使用。
export const ACTIVITIES = [
  { name: "普通歩行(平地、67m/分、犬を連れて)", mets: "3.0" },
  { name: "歩行(平地、75〜85m/分、ほどほどの速さ、散歩など)", mets: "3.5" },
  { name: "やや速歩(平地、やや速めに=93m/分)", mets: "4.3" },
  { name: "ゆっくりとしたジョギング", mets: "6.0" },
  { name: "ジョギング", mets: "7.0" },
  { name: "自転車に乗る(≒16km/時未満、通勤)", mets: "4.0" },
  { name: "水泳(ゆっくりとした平泳ぎ)", mets: "5.3" },
  { name: "ラジオ体操第1", mets: "4.0" },
  { name: "掃除機(カーペット掃き、フロア掃き)", mets: "3.3" },
  { name: "ストレッチング", mets: "2.3" },
];
function parse(value, min, max, decimal, label) {
  const error = () => new Error(`${label}の範囲・小数桁を確認してください`);
  if (typeof value !== "string" && typeof value !== "number") throw error();
  const text = String(value).trim();
  if (text.length > 16 || !(decimal ? /^\d+(?:\.\d)?$/ : /^\d+$/).test(text)) throw error();
  const [whole, fraction = "0"] = text.split(".");
  const n = Number(whole) * (decimal ? 10 : 1) + (decimal ? Number(fraction) : 0);
  if (n < min || n > max) throw error();
  return n;
}
// 整数比で計算し、表示時に小数第1位に四捨五入する。
// 整数比で計算し、表示時に小数第1位に四捨五入する。
function format(n) {
  const d = 60000;
  const rounded = Math.floor(n / d) + (n % d * 2 >= d ? 1 : 0);
  return `${Math.floor(rounded / 10)}.${rounded % 10}`;
}
export function calculateMets(weight, mets, minutes) {
  const w = parse(weight, 200, 3000, true, "体重(20〜300kg、小数第1位まで)");
  const m = parse(mets, 10, 230, true, "METs(1.0〜23.0、小数第1位まで)");
  const t = parse(minutes, 1, 1440, false, "時間(1〜1440分、整数)");
  return { total: format(105 * w * m * t), extra: format(105 * w * (m - 10) * t) };
}

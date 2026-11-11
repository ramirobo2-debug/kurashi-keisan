function tenths(value, label, min, max) {
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`${label}を数値で入れてください`);
  const text = String(value).trim();
  if (text.length > 16 || !/^\+?(?:\d+(?:\.\d)?|\.\d)$/.test(text)) {
    throw new Error(`${label}は小数第1位までの数値で入れてください(指数表記は使えません)`);
  }
  const [whole, fraction = "0"] = text.replace(/^\+/, "").split(".");
  const n = BigInt(whole || "0") * 10n + BigInt(fraction);
  if (n < BigInt(min * 10) || n > BigInt(max * 10)) throw new Error(`${label}は${min}〜${max}で入れてください`);
  return n;
}
function fixed(n) { return `${n / 10n}.${n % 10n}`; }
function rounded(n, d) { return fixed((n * 10n * 2n + d) / (d * 2n)); }

export function calculateBMI(height, weight) {
  const h = tenths(height, "身長(cm)", 50, 250);
  const w = tenths(weight, "体重(kg)", 1, 300);
  // BMI = (w / 10) / (h / 1000) ** 2
  const n = w * 100000n, d = h * h;
  const thresholds = [185n, 250n, 300n, 350n, 400n];
  const labels = ["低体重", "普通体重", "肥満1度", "肥満2度", "肥満3度", "肥満4度"];
  const index = thresholds.findIndex(t => n * 10n < t * d);
  return {
    bmi: fixed(n * 10n / d),
    category: labels[index < 0 ? 5 : index],
    standardWeight: rounded(22n * d, 1000000n),
    minWeight: rounded(185n * d, 10000000n),
    maxWeight: rounded(25n * d, 1000000n),
  };
}

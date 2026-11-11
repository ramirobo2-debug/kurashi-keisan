// school と同じ和暦変換モジュールを使用。
import { toWareki, yearToWareki, eto } from "../wareki/wareki.js";

/** 1873年から今年までの一覧。未出生の年齢は null。 */
export function ageTable(y, m, d, currentYear = new Date().getFullYear()) {
  if (!toWareki(y, m, d) || y > 9999 ||
      !Number.isInteger(currentYear) || currentYear < 1873 || currentYear > 9999) return null;
  return Array.from({ length: currentYear - 1873 + 1 }, (_, i) => {
    const year = 1873 + i, after = y - year;
    return {
      year, wareki: yearToWareki(year).join("・"),
      eto: eto(year).kanji,
      before: after > 0 ? after - 1 : null,
      after: after >= 0 ? after : null,
    };
  });
}

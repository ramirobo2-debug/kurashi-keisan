import { ERAS, yearToWareki } from "../wareki/wareki.js";

export function birthYearFromWareki(era, year) {
  const e = ERAS.find(e => e.name === era);
  if (!e || !Number.isInteger(year) || year < 1) return null;
  const y = e.start[0] + year - 1;
  return y >= 1873 && y <= 9899 && yearToWareki(y).includes(`${era}${year === 1 ? "元" : year}年`) ? y : null;
}

export function yakudoshi(birthYear, sex) {
  if (!Number.isInteger(birthYear) || birthYear < 1873 || birthYear > 9899 || !["male", "female"].includes(sex)) return null;
  const term = year => ({ year, wareki: yearToWareki(year).join("・") });
  const ages = sex === "male" ? [25, 42, 61] : [19, 33, 37, 61];
  return {
    yaku: ages.flatMap(age => [-1, 0, 1].map((offset, i) => ({
      kind: ["前厄", "本厄", "後厄"][i], age: age + offset,
      ...term(birthYear + age + offset - 1),
    }))),
    celebrations: [["還暦", 61, 60], ["古希", 70, 70], ["喜寿", 77, 77], ["傘寿", 80, 80], ["米寿", 88, 88], ["卒寿", 90, 90], ["白寿", 99, 99], ["百寿", 100, 100]].map(([name, countedAge, fullAge]) => ({
      name, countedAge, fullAge,
      counted: term(birthYear + countedAge - 1), full: term(birthYear + fullAge),
    })),
  };
}

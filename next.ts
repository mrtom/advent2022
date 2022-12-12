import {
  mkdirSync,
  readdirSync,
  writeFileSync,
  copyFile,
  existsSync,
  rmSync,
} from 'fs';
import { config } from 'dotenv';
import { map, sortBy } from 'lodash';
config();

const files = readdirSync('.');
const existingDays = files.filter((file) => file.startsWith('day'));
const dayNumbers = map(existingDays, (day) =>
  parseInt(day.replace('day', ''), 10),
);
const lastDayNumber = sortBy(dayNumbers)[dayNumbers.length - 1] || 0;
const day = lastDayNumber + 1;
const folder = `day${day}`;

mkdirSync(folder);
copyFile('_template/index.ts', `${folder}/index.ts`, () => {});
writeFileSync(`${folder}/solutions.txt`, '');
fetch(`https://adventofcode.com/2022/day/${day}/input`, {
  headers: {
    cookie: `session=${process.env.SESSION}`,
  },
})
  .then((res) => res.text())
  .then((text) => writeFileSync(`${folder}/input.txt`, text));

if (existsSync('./index.ts')) {
  rmSync('./index.ts');
}
writeFileSync('./index.ts', `import './day${day}';`);

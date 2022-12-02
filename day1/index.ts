import { max, sortBy, reverse, sum } from 'lodash';
import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

function getElfCalorieCount(input: string): number {
  const valuesArr = parseLines()(input).map((str) => parseInt(str, 10));

  return sum(valuesArr);
}

function part1(_input: string[]) {
  const calories = _input.map((i) => getElfCalorieCount(i));
  return max(calories);
}

function part2(_input: string[]) {
  const calories = _input
    .map((i) => getElfCalorieCount(i))
    .filter((v) => !Number.isNaN(v));
  const ordered = reverse(sortBy(calories));
  const value = sum(ordered.slice(0, 3));
  return value;
}

solve({
  part1,
  part2,
  parser: parseLines({ separator: '\n\n' }),
  dryRun: false,
});

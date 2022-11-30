import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';
import { filter } from 'lodash';

function part1(input: string[]) {
  return filter(
    input.slice(1),
    (line, i) => parseInt(line, 10) > parseInt(input[i - 1] ?? '', 10),
  ).length.toString();
}

function part2(_input: string[]) {
  return 'part2';
}

solve({ part1, part2, parser: parseLines });

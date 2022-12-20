import { findIndex, range, sum } from 'lodash';
import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Boxed = {
  num: number;
};

function parser(input: string): Boxed[] {
  return parseLines()(input).map((n) => ({
    num: Number(n),
  }));
}

function mix(numbers: Boxed[], idx: number) {
  const nextPosition = (idx + numbers[idx]!.num) % (numbers.length - 1);
  if (nextPosition === 0) {
    // Add to the end not the start, apparently
    numbers.push(numbers.splice(idx, 1)[0]!);
  } else {
    numbers.splice(nextPosition, 0, numbers.splice(idx, 1)[0]!);
  }
}

function getResult(numbers: Boxed[]) {
  const zeroIndex = findIndex(numbers, (value) => value.num === 0);
  const values = [
    numbers[(1000 + zeroIndex) % numbers.length]!.num,
    numbers[(2000 + zeroIndex) % numbers.length]!.num,
    numbers[(3000 + zeroIndex) % numbers.length]!.num,
  ];
  return sum(values);
}

function part1(input: Boxed[]) {
  [...input].forEach((value) => mix(input, input.indexOf(value)));
  const result = getResult(input);
  return result;
}

function part2(_input: Boxed[]) {
  const decryptKey = 811589153;
  const input: Boxed[] = _input.map((b) => ({
    num: b.num * decryptKey,
  }));
  const orig = [...input];
  for (const _ in range(0, 10)) {
    orig.forEach((value) => mix(input, input.indexOf(value)));
  }
  const result = getResult(input);
  return result;
}

solve({ part1, test1: 3, part2, test2: 1623178306, parser });

import { identity, uniq } from 'lodash';

import { solve } from '../utils/solve';

function testMarker(_input: string[]): boolean {
  return uniq(_input).length === _input.length;
}

function part1(input: string) {
  let buffer: string[] = input.substring(0, 4).split('');

  if (testMarker(buffer)) {
    return 4;
  }

  for (let i = 4; i < input.length; i++) {
    const char = input[i];
    if (char !== undefined) {
      buffer = buffer.splice(-3);
      buffer.push(char);
      if (testMarker(buffer)) {
        return i + 1;
      }
    }
  }

  throw new Error('You made a mistake');
}

function part2(input: string) {
  let buffer: string[] = input.substring(0, 14).split('');

  if (testMarker(buffer)) {
    return 14;
  }

  for (let i = 14; i < input.length; i++) {
    const char = input[i];
    if (char !== undefined) {
      buffer = buffer.splice(-13);
      buffer.push(char);
      if (testMarker(buffer)) {
        return i + 1;
      }
    }
  }

  throw new Error('You made a mistake');
}

solve({ part1, part2, parser: identity });

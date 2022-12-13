import { chunk, sum } from 'lodash';

import { indicesMatching } from '../utils/arrayUtils';
import { solve } from '../utils/solve';

type Data = number | number[];
type Pair = {
  left: Data;
  right: Data;
};

enum Result {
  Pass,
  Fail,
  Unknown,
}

function parse(input: string): Pair[] {
  return chunk(input.split('\n'), 3).map((rawPair) => {
    return {
      left: JSON.parse(rawPair[0]!),
      right: JSON.parse(rawPair[1]!),
    };
  });
}

function isNumber(data: number | number[]): data is number {
  return !Array.isArray(data);
}

function doesMatch({ left, right }: Pair): Result {
  if (isNumber(left) && isNumber(right)) {
    if (left === right) return Result.Unknown;
    else if (left < right) return Result.Pass;
    else return Result.Fail;
  } else {
    let newLeft = Array.isArray(left) ? left : [left];
    let newRight = Array.isArray(right) ? right : [right];

    for (let i = 0; i < newLeft.length; i++) {
      const nextLeftElement = newLeft[i];
      const nextRightElement = newRight[i];

      if (nextRightElement === undefined) {
        return Result.Fail;
      } else {
        const result = doesMatch({
          left: nextLeftElement!,
          right: nextRightElement,
        });

        if (result !== Result.Unknown) {
          return result;
        }
      }
    }

    return newRight.length > newLeft.length ? Result.Pass : Result.Unknown;
  }
}

function sortPackets(a: Data, b: Data): number {
  if (doesMatch({ left: a, right: b }) === Result.Pass) {
    return -1;
  }
  return 1;
}

function part1(input: Pair[]) {
  const answer = sum(
    input.reduce((acc, pair, idx): number[] => {
      if (doesMatch(pair) === Result.Pass) {
        acc.push(idx + 1);
      }

      return acc;
    }, [] as number[]),
  );

  return answer;
}

function part2(_input: Pair[]) {
  const dividers: Pair = {
    left: JSON.parse('[[2]]'),
    right: JSON.parse('[[6]]'),
  };

  const input = [..._input, dividers];

  const packets = input.reduce((acc, pair) => {
    acc.push(pair.left);
    acc.push(pair.right);
    return acc;
  }, [] as Data[]);

  const answer = indicesMatching(packets.sort(sortPackets), (data) => {
    if (JSON.stringify(data) === '[[2]]' || JSON.stringify(data) === '[[6]]') {
      return true;
    }
    return false;
  }).reduce((acc, idx) => {
    return acc * (idx + 1);
  }, 1);

  return answer;
}

solve({ part1, part2, parser: parse, dryRun: false });

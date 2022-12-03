import { strict as assert } from 'node:assert';
import { chunk, flatten, sum, uniq } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Rucksack = {
  firstPart: string;
  secondPart: string;
};

function decodeSack(input: string): Rucksack {
  let halfLength = input.length / 2;

  const [firstPart, secondPart] = [
    input.substring(0, halfLength),
    input.substring(halfLength),
  ];

  assert(firstPart.length === secondPart.length);

  return {
    firstPart,
    secondPart,
  };
}

function findMatchingChar(sack: Rucksack): string {
  for (let c of sack.firstPart) {
    if (sack.secondPart.indexOf(c) !== -1) {
      return c;
    }
  }

  throw new Error(
    `Could not find match with ${sack.firstPart} and ${sack.secondPart}`,
  );
}

function valueOfCharacter(char: string): number {
  const code = char.charCodeAt(0);
  if (97 <= code && code <= 122) {
    // a - z
    return code - 96;
  } else if (65 <= code && code <= 90) {
    return code - 64 + 26;
  }

  throw new Error(`Unexpected character ${char} with code ${code}`);
}

type ElfItemCount = {
  qty: number;
  character: string;
};

function elfItemCount(input: string[]): ElfItemCount[] {
  const elfItemCount = input.reduce((accum, val) => {
    const dupeIndex = accum.findIndex((item) => item.character === val);

    if (dupeIndex === -1) {
      accum.push({
        qty: 1,
        character: val,
      });
    } else {
      const existingElfCount = accum[dupeIndex];
      assert(existingElfCount !== undefined);
      if (existingElfCount !== undefined) {
        existingElfCount.qty++;
      }
    }
    return accum;
  }, [] as ElfItemCount[]);

  return elfItemCount;
}

function part1(_input: string[]) {
  const rucksacks = _input.map((i) => decodeSack(i));
  const scores = rucksacks
    .map((sack) => findMatchingChar(sack))
    .map((char) => valueOfCharacter(char));
  const answer = sum(scores);
  return answer;
}

function part2(_input: string[]) {
  const groups = chunk(_input, 3).map((group) =>
    group.map((str) => uniq(str.split(''))),
  );

  const flattenedGroups = groups.map((group) => flatten(group));
  const itemCounts = flattenedGroups.map((group) => elfItemCount(group));
  const badges = itemCounts.map(
    (items) => items.filter((item) => item.qty === 3)[0]!.character,
  );
  const scores = badges.map((badge) => valueOfCharacter(badge));
  const answer = sum(scores);

  return answer;
}

solve({ part1, part2, parser: parseLines(), dryRun: false });

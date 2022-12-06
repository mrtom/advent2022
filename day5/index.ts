import { reverse } from 'lodash';
import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Crate = {
  label: string;
};

type Stack = Crate[];

type Move = {
  qty: number;
  from: number;
  to: number;
};

function parseStacks(_input: string[]): Stack[] {
  const stacksInput = _input
    .splice(-1)[0]!
    .split(' ')
    .filter((v) => v !== '');
  const numStacks = stacksInput.length;

  const rev = reverse(_input);

  let stacks: Stack[] = [];
  for (let i = 0; i < numStacks; i++) {
    stacks[i] = [] as Crate[];
  }

  rev.map((horizontal) => {
    for (let i = 0; i < numStacks; i++) {
      const charPosition = (i + 1) * 4 - 3;
      if (horizontal.length >= charPosition) {
        const char = horizontal[charPosition];
        if (char !== undefined && char.trim().length > 0) {
          const crate = {
            label: char!,
          };
          stacks[i]!.push(crate);
        }
      }
    }
  });

  return stacks;
}

function parseMoves(_input: string[]): Move[] {
  return _input.map((str) => {
    const values = str.split(' ');
    return {
      qty: parseInt(values[1]!, 10),
      from: parseInt(values[3]!, 10),
      to: parseInt(values[5]!, 10),
    };
  });
}

function parseInput(_input: string[]): [Stack[], Move[]] {
  const splitterIdx = _input.indexOf('');
  if (splitterIdx === -1) {
    throw new Error('Invalid input');
  }

  const stacksInput = _input.splice(0, splitterIdx);
  _input.splice(0, 1);
  const movesInput = _input;

  const stacks = parseStacks(stacksInput);
  const moves = parseMoves(movesInput);

  return [stacks, moves];
}

function runGame1(stacks: Stack[], moves: Move[]): string {
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    for (let j = 0; j < move!.qty; j++) {
      const crate = stacks[move!.from - 1]!.splice(-1)[0];
      stacks[move!.to - 1]!.push(crate!);
    }
  }

  const answer = stacks.map((stack) => stack.splice(-1)[0]?.label).join('');

  return answer;
}

function runGame2(stacks: Stack[], moves: Move[]): string {
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const qty = move!.qty;
    const crates = stacks[move!.from - 1]!.splice(-1 * qty);
    stacks[move!.to - 1]!.push(...crates!);
  }

  const answer = stacks.map((stack) => stack.splice(-1)[0]?.label).join('');

  return answer;
}

function part1(_input: string[]) {
  const [stacks, moves] = parseInput(_input);
  const answer = runGame1(stacks, moves);

  return answer;
}

function part2(_input: string[]) {
  const [stacks, moves] = parseInput(_input);
  const answer = runGame2(stacks, moves);

  return answer;
}

solve({ part1, part2, parser: parseLines(), dryRun: false });

import { strict as assert } from 'node:assert';
import { sum } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Pixel = {
  x: number;
  line: number;
};

interface NOOP {
  readonly kind: 'noop';
}
interface ADDX {
  readonly kind: 'addx';
  value: number;
}

type Command = NOOP | ADDX;

function parseCommands(_input: string): Command[] {
  const input = parseLines()(_input);
  let commands: Command[] = [];

  input.map((line) => {
    const [cmd, param] = line.split(' ');
    switch (cmd) {
      case 'noop': {
        commands.push({ kind: 'noop' });
        break;
      }
      case 'addx': {
        assert(param !== undefined, 'Need a param with addx command');
        commands.push({ kind: 'addx', value: parseInt(param, 10) });
      }
    }
  });

  return commands;
}

function buildRegisters(cmds: Command[]): number[] {
  let register = 1;
  let cycle = 0;
  let registers: number[] = [1, 1];

  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i]!;
    switch (cmd.kind) {
      case 'noop': {
        cycle++;
        registers.push(register);
        break;
      }
      case 'addx': {
        cycle++;
        registers.push(register);
        cycle++;
        register += cmd.value;
        registers.push(register);
      }
    }
  }

  return registers;
}

function part1(cmds: Command[]) {
  let registers = buildRegisters(cmds);
  const values = registers
    .map((value, idx) => [value, idx])
    .filter((_, idx) => idx === 20 || (idx - 20) % 40 === 0);

  return sum(values.map((value) => value[0]! * value[1]!));
}

function printScreen(screen: string[][]) {
  for (let i = 0; i < screen.length; i++) {
    console.log(screen[i]!.join(''));
  }
}

/*
  Sprite is 3px wide
  Middle pixel is x value from register

  CRT: 40x6
  If the sprite is positioned such that one of its three pixels is the pixel currently being drawn, the screen produces a lit pixel (#); otherwise, the screen leaves the pixel dark (.)
*/
function part2(cmds: Command[]) {
  let screen = Array(6)
    .fill('.')
    .map((_) => Array(40).fill('.'));

  const registers = buildRegisters(cmds).splice(1);

  for (let i = 0; i < registers.length - 2; i++) {
    const pixel: Pixel = {
      x: i % 40,
      line: Math.floor(i / 40),
    };

    const spriteMiddle = registers[i] as number;
    const sprite = [spriteMiddle - 1, spriteMiddle, spriteMiddle + 1];
    if (sprite.indexOf(pixel.x) !== -1) {
      screen[pixel.line]![pixel.x] = '#';
    }
  }

  printScreen(screen);

  /**
   * ###..####.#..#.###..###..#....#..#.###..
   * #..#.#....#..#.#..#.#..#.#....#..#.#..#.
   * #..#.###..####.#..#.#..#.#....#..#.###..
   * ###..#....#..#.###..###..#....#..#.#..#.
   * #.#..#....#..#.#....#.#..#....#..#.#..#.
   * #..#.####.#..#.#....#..#.####..##..###..
   */

  return 'REHPRLUB';
}

solve({ part1, part2, parser: parseCommands, dryRun: true });

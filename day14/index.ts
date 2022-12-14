import { flatten, max } from 'lodash';

import { solve } from '../utils/solve';

type Coord = [number, number];
type Line = Coord[];

type Cell = '.' | '#' | 'o';
type Grid = Cell[][];

function drawLine(from: Coord, to: Coord, grid: Grid) {
  if (from[0] === to[0]) {
    const yFrom = Math.min(from[1], to[1]);
    const yTo = Math.max(from[1], to[1]);
    for (let i = yFrom; i <= yTo; i++) {
      grid[i]![from[0]] = '#';
    }
  } else if (from[1] === to[1]) {
    const xFrom = Math.min(from[0], to[0]);
    const xTo = Math.max(from[0], to[0]);
    for (let i = xFrom; i <= xTo; i++) {
      grid[from[1]]![i] = '#';
    }
  } else {
    debugger;
    throw new Error('Cannot draw straight line if both x and y are different');
  }
}

function pathParser(_input: string): [Grid, number] {
  const lines: Line[] = _input.split('\n').map((rawLine) =>
    rawLine.split(' -> ').map((rawCoord) => {
      const [x, y] = rawCoord.split(',').map((str) => Number(str)) as [
        number,
        number,
      ];
      return [x, y];
    }),
  );

  const maxX = max(flatten(lines).map((coord) => coord[0]))!;
  const maxY = max(flatten(lines).map((coord) => coord[1]))!;

  const grid = Array(maxY + 3)
    .fill('.')
    .map((_) => Array(maxX + 1000).fill('.'));

  lines.forEach((line) => {
    for (let i = 1; i < line.length; i++) {
      drawLine(line[i - 1]!, line[i]!, grid);
    }
  });

  return [grid, maxY];
}

function getNextPos(
  grid: Grid,
  maxY: number,
  sandPos: Coord,
): [Coord, boolean] {
  const [x, y] = sandPos;

  if (y === maxY) {
    return [sandPos, false];
  }

  const down = grid[y + 1]![x];
  const downLeft = grid[y + 1]![x - 1];
  const downRight = grid[y + 1]![x + 1];

  if (down === '.') return [[x, y + 1], true];
  else if (downLeft === '.') return [[x - 1, y + 1], true];
  else if (downRight === '.') return [[x + 1, y + 1], true];
  else return [sandPos, false];
}

function runGame(grid: Grid, maxY: number, sandStart: Coord): number {
  let sandCurrentPos = sandStart;

  let i = 0;
  while (true) {
    let [nextPos, didMove] = [sandCurrentPos, true];

    while (didMove === true) {
      [nextPos, didMove] = getNextPos(grid, maxY, nextPos!);
    }

    // Sand did not move. Either it went below the y threshold, couldn't move at all (hello part 2) or came to rest
    if (nextPos[1] >= maxY || nextPos[1] === 0) {
      // Game over!
      break;
    }

    sandCurrentPos = sandStart;
    grid[nextPos[1]]![nextPos[0]] = 'o';
    i++;
  }

  return flatten(grid).filter((cell) => cell === 'o').length;
}

function part1([grid, maxY]: [Grid, number]) {
  return runGame(grid, maxY, [500, 0]);
}

function part2([grid, maxY]: [Grid, number]) {
  const floorY = maxY + 2;
  for (let i = 0; i < grid[floorY]!.length; i++) {
    grid[floorY]![i] = '#';
  }

  const answer = runGame(grid, maxY + 2, [500, 0]) + 1;
  return answer;
}

solve<[Grid, number], number, number>({
  part1,
  test1: 24,
  part2,
  test2: 93,
  parser: pathParser,
});

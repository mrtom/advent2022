import { cloneDeep, max, min, reverse } from 'lodash';

import { indicesMatching } from '../utils/arrayUtils';
import { parseChars } from '../utils/parse';
import { solve } from '../utils/solve';

type Jet = '<' | '>'
type Coord = [number, number];
type Rock = Coord[];
type Cell = '.' | '#' | '@';
type Grid = Cell[][];

const rocks: Rock[] = [
  [[0,0],[1, 0],[2, 0],[3,0]],
  [[1,0],[0,1],[1,1],[2,1],[1,2]],
  [[0,0],[1,0],[2,0],[2,1],[2,2]],
  [[0,0],[0,1],[0,2],[0,3]],
  [[0,0],[1,0],[0,1],[1,1]],
];

function parser(_input: string): Jet[] {
  return parseChars()(_input) as Jet[];
}

// Height in grid coordinate system (i.e. doesn't take height offset into account)
function highestRock(grid: Grid): number {
  return max(indicesMatching(
    grid.map(row => row.filter(cell => cell === '#').length),
    (length) => length !== 0,
  )) ?? -1;
}

function rockMinX(rock: Rock): number {
  return min(rock.flatMap((coord: Coord) => coord[0]))!;
}

function rockMaxX(rock: Rock): number {
  return max(rock.flatMap((coord: Coord) => coord[0]))!;
}

function getStartingPosition(rock: Rock, yStart: number): Rock {
  return rock.map(([x,y]: Coord) => [x + 2, y + yStart]);
}

function didDetectColision(rock: Rock, grid: Grid): boolean {
  for (const [x, y] of rock) {
    if (y < 0) return true;
    if (grid[y]![x] === '#') {
      return true;
    }
  }
  return false;
}

function applyJet(rock: Rock, jet: Jet, grid: Grid): Rock {
  if (jet === '<') {
    if (rockMinX(rock) > 0) {
      const nextRock = rock.map(([x, y]: Coord) => [x - 1, y]) as Rock;
      if (didDetectColision(nextRock, grid)) return rock;
      return nextRock;
    }
  } else if (jet === '>') {
    if (rockMaxX(rock) < 6) {
      const nextRock = rock.map(([x, y]: Coord) => [x + 1, y]) as Rock;
      if (didDetectColision(nextRock, grid)) return rock;
      return nextRock;
    }
  }
  return rock;
}

function applyDown(rock: Rock): Rock {
  const nextRock = rock.map(([x, y]: Coord) => [x, y - 1]);
  return nextRock as Rock;
}

function dropRock(rock: Rock, grid: Grid, jets: Jet[]) {
  const yStart = highestRock(grid) + 4;

  while(yStart + 5 > grid.length) {
    grid.push(Array(7).fill('.'));
  }

  let rockPosition = getStartingPosition(rock, yStart);

  while(true) {
    const nextJet = jets.splice(0, 1)[0]!;
    jets.push(nextJet);

    rockPosition = applyJet(rockPosition, nextJet, grid);
    const rockMovedDownOne = applyDown(rockPosition);
    if (didDetectColision(rockMovedDownOne, grid)) {
      for (const [x, y] of rockPosition) {
        grid[y]![x] = '#';
      }

      return;
    }
    rockPosition = rockMovedDownOne;
  }
}

function print(grid: Grid, yOffset: number, movingRock: Rock) {
  const printedGrid = cloneDeep(grid);
  for (const [x, y] of movingRock) {
    printedGrid[y]![x]! = '@';
  }
  reverse(printedGrid).map((row, rowIdx) => console.log(`${(yOffset + rowIdx) % 10}: ${row.join('')}`));
  console.log('\n');
}

function findHeightAfter(cycles: number, _jets: Jet[], heights: number[]): number {
  const grid: Grid = Array(7).fill('.').map(_ => Array(7).fill('.'));
  const jets = cloneDeep(_jets);
  let rockNumber = 0;

  while (rockNumber < cycles) {
    const rock = rocks[rockNumber % rocks.length]!;
    dropRock(cloneDeep(rock), grid, jets);
    heights.push(highestRock(grid) + 1);
    rockNumber++;
  }

  return highestRock(grid) + 1;
}

function part1(jets: Jet[]) {
  const answer = findHeightAfter(2022, jets, []);
  return answer;
}

function part2(jets: Jet[]) {
  const endAt = 1000000000000;
  const start = 5000;
  const heights: number[] = [];

  findHeightAfter(20000, jets, heights);

  let cycleLength = -1;
  let cycleHeight = -1;
  for (let i = 100; i < 2000; i++) {
    const heightAtStart = heights[start]!;
    const first = heights[start + i]!;
    const second = heights[start + (i * 2)]!;
    const third = heights[start + (i * 3)]!;

    if (first - heightAtStart === second - first && third - second === second - first) {
      cycleLength = i;
      cycleHeight = first - heightAtStart;
      break;
    }
  }

  const numCycles = Math.floor((endAt - start) / cycleLength);
  const remainder = (endAt - start) % cycleLength;
  const prefixHeight = heights[start + remainder]!;
  const totalSize = prefixHeight + numCycles * cycleHeight;

  return totalSize - 1;
}

solve({ part1, test1: 3068, part2, test2: 1514285714288, parser: parser });

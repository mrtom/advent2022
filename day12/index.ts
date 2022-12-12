import { forEach, cloneDeep, flatten, sortBy } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Position = [x: number, y: number];

type Map = {
  heights: number[][];
  pathLengths: number[][];
  start: Position;
  end: Position;
};

function parseInput(input: string): Map {
  let start: Position = [0, 0];
  let end: Position = [0, 0];

  const rows = parseLines()(input);
  const heights: number[][] = rows.map((row, rowIdx) => {
    const rowArr: string[] = row.split('');
    const rowAsNumbers = rowArr.map((height) => height.charCodeAt(0));

    const sIdx = rowArr.indexOf('S');
    if (sIdx !== -1) {
      rowAsNumbers[sIdx] = 'a'.charCodeAt(0);
      start = [sIdx, rowIdx];
    }

    const eIdx = rowArr.indexOf('E');
    if (eIdx !== -1) {
      rowAsNumbers[eIdx] = 'z'.charCodeAt(0);
      end = [eIdx, rowIdx];
    }

    return rowAsNumbers;
  });

  const pathLengths: number[][] = Array(heights.length)
    .fill(0)
    .map((_) => Array(heights[0]!.length).fill(-1));

  return {
    heights,
    pathLengths,
    start,
    end,
  };
}

function findValidNeighbours(position: Position, map: Map): Position[] {
  const [x, y] = position;
  const currentHeight = map.heights[position[1]]![position[0]]!;

  let neighbours: Position[] = [];

  if (x > 0) {
    neighbours.push([x - 1, y]);
  }
  if (x < map.heights[0]!.length - 1) {
    neighbours.push([x + 1, y]);
  }

  if (y > 0) {
    neighbours.push([x, y - 1]);
  }
  if (y < map.heights.length - 1) {
    neighbours.push([x, y + 1]);
  }

  return neighbours
    .filter(([i, j]) => map.pathLengths[j]![i]! === -1)
    .filter(([i, j]) => map.heights[j]![i]! - currentHeight <= 1);
}

function findShortest(map: Map, start: Position): number {
  const queue: Position[] = [start];

  while (queue.length > 0) {
    const current = queue.shift() as Position;

    const pathLength = map.pathLengths[current[1]]![current[0]]!;
    const neighbours = findValidNeighbours(current, map);

    forEach(neighbours, (position) => {
      const [i, j] = position;
      map.pathLengths[j]![i] = pathLength + 1;
      queue.push(position);
    });
  }

  return map.pathLengths[map.end[1]]![map.end[0]] as number;
}

function part1(map: Map) {
  map.pathLengths[map.start[1]]![map.start[0]]! = 0;
  const shortest = findShortest(map, map.start);
  return shortest + 1;
}

function part2(map: Map) {
  const startingPoints = flatten(
    map.heights.map((row, rowIdx) =>
      row
        .map((height, columnIdx) => [columnIdx, rowIdx, height])
        .filter(([_, __, height]) => height === 'a'.charCodeAt(0)),
    ),
  ).map((value) => [value[0], value[1]]);
  const pathLengths = startingPoints.map((start) =>
    findShortest(cloneDeep(map), [start[0]!, start[1]!]),
  );

  const answer = sortBy(pathLengths.filter((length) => length !== -1))[0]!;
  return answer + 1;
}

solve({ part1, part2, parser: parseInput, dryRun: false });

import { max, min, range, sum } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Coord = {
  x: number;
  y: number;
  z: number;
}

type GridProps = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

function parser(input: string): Coord[] {
  return parseLines()(input)
    .map((line) => {
      const numbers = line.split(',').map((digit) => Number(digit));
      return {
        x: numbers[0]!,
        y: numbers[1]!,
        z: numbers[2]!,
      }
    });
}

function findNeighbours({x, y, z}: Coord): Coord[] {
  const coords: Coord[] = [];
  coords.push({ x: x - 1, y: y, z: z });
  coords.push({ x: x + 1, y: y, z: z });
  coords.push({ x: x, y: y - 1, z: z });
  coords.push({ x: x, y: y + 1, z: z });
  coords.push({ x: x, y: y, z: z + 1 });
  coords.push({ x: x, y: y, z: z - 1 });

  return coords;
}

function findVerticalNeighbours({x, y, z}: Coord): Coord[] {
  const coords: Coord[] = [];
  coords.push({ x: x, y: y, z: z + 1 });
  coords.push({ x: x, y: y, z: z - 1 });
  return coords;
}

function keyFromCoord({ x, y, z}: Coord): string {
  return `x:${x},y:${y},z:${z}`;
}

function gridProps(coords: Coord[]): GridProps {
  return {
    minX: min(coords.map((c) => c.x))!,
    maxX: max(coords.map((c) => c.x))!,
    minY: min(coords.map((c) => c.y))!,
    maxY: max(coords.map((c) => c.y))!,
    minZ: min(coords.map((c) => c.z))!,
    maxZ: max(coords.map((c) => c.z))!,
  }
}

function numNeighbours(grid: number[][], i: number, j: number): number {
  let count = 0;
  if (i > 0 && grid[j]![i - 1]! === 1) {
    count++;
  }

  if (j > 0 && grid[j - 1]![i]! === 1) {
    count++;
  }

  if (i < grid[0]!.length - 1 && grid[j]![i + 1]! === 1) {
    count++;
  }

  if (j < grid.length - 1 && grid[j + 1]![i]! === 1) {
    count++;
  }

  return count;
}

// Only works if you don't have enclosed cells
function calculatePerimiter(grid: number[][]): number {
  let perimeter = 0;

  for(let i = 0; i < grid[0]!.length; i++) {
    for(let j = 0; j < grid.length; j++) {
     if (grid[j]![i]! === 1) {
        perimeter += (4 - numNeighbours(grid, i, j));
     }
    }
  }

  return perimeter;
}

function zeroBase(coords: Coord[]): Coord[] {
  return coords.map(({ x, y, z }) => {
    return { x: x - 1, y: y - 1, z}
  });
}

function floorPlan(keys: Set<string>, maxX: number, maxY: number, floor: number): number[][] {
  const plan = Array(maxY + 1).fill(0).map(_ => Array(maxX + 1).fill(0));
  for (let j = 0; j < plan.length; j++) {
    for (let i = 0; i < plan[0]!.length; i++) {
      const hasBlock = keys.has(keyFromCoord({x: i, y: j, z: floor}));
      plan[j]![i] = hasBlock ? 1 : 0;
    }
  }
  return plan;
}

function fullyEnclosedCells(coords: Coord[], keys: Set<string>, props: GridProps): Coord[] {
  const {
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
  } = props;

  const fullyEnclosedCells: Coord[] = [];

  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {
      for (let k = minZ; k <= maxZ; k++) {
        if (!keys.has(keyFromCoord({ x: i, y: j, z: k}))) {
          // A cell is fully enclosed if it has cells
          // outside it in every direction
          const lowX = coords.filter((coord) => coord.y === j && coord.z === k && coord.x < i).length > 0;
          const hiX = coords.filter((coord) => coord.y === j && coord.z === k && coord.x > i).length > 0;
          const lowY = coords.filter((coord) => coord.x === i && coord.z === k && coord.y < j).length > 0;
          const hiY = coords.filter((coord) => coord.x === i && coord.z === k && coord.y > j).length > 0;
          const lowZ = coords.filter((coord) => coord.x === i && coord.y === j && coord.z < k).length > 0;
          const hiZ = coords.filter((coord) => coord.x === i && coord.y === j && coord.z > k).length > 0;
          if (lowX && hiX && lowY && hiY && lowZ && hiZ) {
            fullyEnclosedCells.push({ x: i, y: j, z: k});
          }
        }
      }
    }
  }

  return fullyEnclosedCells;
}

function part1(_coords: Coord[]) {
  const coords = zeroBase(_coords);
  const occupiedCells = new Set(coords.map(coord => keyFromCoord(coord)));
  return sum(coords.map(
    (coord) => findNeighbours(coord)
      .map((neighbour) => keyFromCoord(neighbour))
      .map((neighbour) => occupiedCells.has(neighbour))
      .reduce((acc, isTouching) => {
        if (!isTouching) acc++;
        return acc;
      }, 0)
  ));
}

function part2(startingCoords: Coord[]) {
  const props = gridProps(startingCoords);

  const startingKeys = new Set(startingCoords.map(coord => keyFromCoord(coord)));
  const enclosedCells = fullyEnclosedCells(startingCoords, startingKeys, props);

  const coords = [...startingCoords, ...enclosedCells];
  const occupiedCells = new Set(coords.map(coord => keyFromCoord(coord)));
  const answer = sum(coords.map(
    (coord) => findNeighbours(coord)
      .map((neighbour) => keyFromCoord(neighbour))
      .map((neighbour) => occupiedCells.has(neighbour))
      .reduce((acc, isTouching) => {
        if (!isTouching) acc++;
        return acc;
      }, 0)
  ));

  // Should be 2494
  return answer;
}

function part2_2(startingCoords: Coord[]) {
  const props = gridProps(startingCoords);

  const startingKeys = new Set(startingCoords.map(coord => keyFromCoord(coord)));
  const enclosedCells = fullyEnclosedCells(startingCoords, startingKeys, props);

  const coords = [...startingCoords, ...enclosedCells];
  const keys = new Set(coords.map(coord => keyFromCoord(coord)));

  const {
      maxX,
      maxY,
      minZ,
      maxZ,
    } = props;

  const floors = range(minZ, maxZ + 1);
  const floorPlans = floors.map(floor => floorPlan(keys, maxX, maxY, floor));
  const perimiters = floorPlans.map(plan => calculatePerimiter(plan));
  const verticalFaces = sum(perimiters);

  const stillEnclosedCells: ({ x: number, y: number, z: number })[] = [];
  for (let z = 0; z < floorPlans.length; z++) {
    let plan = floorPlans[z]!;
    for (let j = 0; j < plan.length; j++) {
      for (let i = 0; i < plan[0]!.length; i++) {
        const cell = plan[j]![i]!;
        if (cell === 0) {
          const up = j > 0 ? plan[j - 1]![i] : 0;
          const right = i < plan[0]!.length - 1 ? plan[j]![i + 1] : 0;
          const down = j < plan.length - 1 ? plan[j + 1]![i] : 0;
          const left = i > 0 ? plan[j]![i-1] : 0;
          if (up === 1 && right === 1 && down === 1 && left === 1) {
            stillEnclosedCells.push({ x: i, y: j, z});
          }
        }
      }
    }
  }

  const horizontalFaces = sum(coords.map(
    (coord) => findVerticalNeighbours(coord)
      .map((neighbour) => keyFromCoord(neighbour))
      .map((neighbour) => keys.has(neighbour))
      .reduce((acc, isTouching) => {
        if (!isTouching) acc++;
        return acc;
      }, 0)
  ));

  const answer = verticalFaces + horizontalFaces;
  return answer;
}

solve({ part1, test1: 64, part2, test2: 58, parser: parser });

import { strict as assert } from 'node:assert';

import { solve } from '../utils/solve';

function mod(n: number): number {
  if (n < 0) return n * -1;
  return n;
}

type Position = {
  x: number;
  y: number;
};

type Sensor = {
  location: Position;
  closestBeacon: Position;
  beaconDistance: number;
};

type Cell = 'B' | 'S' | '.' | '#';

type Grid = Cell[][];

type State = {
  grid: Grid;
  sensors: Sensor[];
  maxBeaconDistance: number;
  xOffset: number;
  yOffset: number;
};

const regex =
  /x=(?<xLoc>-?\d+), y=(?<yLoc>-?\d+).*x=(?<beaconX>-?\d+), y=(?<beaconY>-?\d+)/g;

function parser(input: string): State {
  let maxX = 0,
    maxY = 0,
    minX = 0,
    minY = 0,
    maxBeaconDistance = 0;

  const sensors: Sensor[] = input.split('\n').map((line) => {
    const match = line.matchAll(regex).next().value;
    const xLoc = Number(match?.groups?.xLoc);
    const yLoc = Number(match?.groups?.yLoc);
    const beaconX = Number(match?.groups?.beaconX);
    const beaconY = Number(match?.groups?.beaconY);
    const beaconDistance = mod(xLoc - beaconX) + mod(yLoc - beaconY);

    if (
      xLoc === Number.NaN ||
      yLoc === Number.NaN ||
      beaconX === Number.NaN ||
      beaconY === Number.NaN
    ) {
      throw new Error('Regex failed to parse input');
    }

    maxX = Math.max(maxX, xLoc);
    maxX = Math.max(maxX, beaconX);
    maxY = Math.max(maxY, yLoc);
    maxY = Math.max(maxY, beaconY);
    minX = Math.min(minX, xLoc);
    minX = Math.min(minX, beaconX);
    minY = Math.min(minY, yLoc);
    minY = Math.min(minY, beaconY);
    maxBeaconDistance = Math.max(maxBeaconDistance, beaconDistance);

    return {
      location: {
        x: xLoc,
        y: yLoc,
      },
      closestBeacon: {
        x: beaconX,
        y: beaconY,
      },
      beaconDistance,
    };
  });

  const grid: Grid = Array(maxY + mod(minY) + maxBeaconDistance + 1)
    .fill('.')
    .map((_) => Array(maxX + mod(minX) + maxBeaconDistance + 1).fill('.'));

  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i]!;
    grid[sensor.location.y - minY]![sensor.location.x - minX] = 'B';
    grid[sensor.closestBeacon.y - minY]![sensor.closestBeacon.x - minX] = 'S';
  }

  return {
    grid,
    sensors,
    xOffset: minX,
    yOffset: minY,
    maxBeaconDistance,
  };
}

function getValidPositionsWithinDistanceFromPosition(
  location: Position,
  distance: number,
  state: State,
): Position[] {
  const positions: Position[] = [];

  const { x, y } = location;

  for (let i = x - distance; i <= x + distance; i++) {
    for (let j = y - distance; j <= y + distance; j++) {
      if (mod(x - i) + mod(y - j) >= distance) {
        continue;
      }

      const row = state.grid[j - state.yOffset];
      if (row !== undefined) {
        const cell = row[i - state.xOffset];
        if (cell !== undefined && cell === '.') {
          positions.push({ x: i, y: j });
        }
      }
    }
  }

  return positions;
}

function printGrid({ grid, yOffset }: State) {
  for (let j = 0; j < grid.length; j++) {
    console.log(`${j + yOffset}: ${grid[j]!.join('')}`);
  }
}

function part1(state: State) {
  const { sensors } = state;
  for (let i = 6; i < sensors.length; i++) {
    const sensor = sensors[i]!;
    const positions = getValidPositionsWithinDistanceFromPosition(
      sensor.location,
      sensor.beaconDistance,
      state,
    );

    for (let j = 0; j < positions.length; j++) {
      const position = positions[j]!;
      state.grid[position.y - state.yOffset]![position.x - state.xOffset] = '#';
    }

    printGrid(state);
  }

  const answer = state.grid[10]!.filter((c) => c === '.').length;

  return answer;
}

function part2({ grid, maxSensorDistance }: State) {
  return 0;
}

solve({ part1, test1: 26, part2, test2: 26, parser: parser });

import { solve } from '../utils/solve';

type Position = {
  x: number;
  y: number;
};

type Range = {
  min: number;
  max: number;
}

type Sensor = {
  location: Position;
  closestBeacon: Position;
  beaconDistance: number;
};

type State = {
  sensors: Sensor[];
  maxBeaconDistance: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
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
    const beaconDistance = Math.abs(xLoc - beaconX) + Math.abs(yLoc - beaconY);

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

  minX = minX - maxBeaconDistance;
  maxX = maxX + maxBeaconDistance;
  minY = minY - maxBeaconDistance;
  maxY = maxY + maxBeaconDistance;

  return {
    sensors,
    maxBeaconDistance,
    minX,
    maxX,
    minY,
    maxY,
  };
}

function unavailableCellsForRow(row: number, state: State): [Set<number>, Set<number>] {
  const { sensors } = state;
  const closeCells = new Set<number>();
  const beaconsAndSensorsInRow = new Set<number>();

  for (const sensor of sensors) {
    if (sensor.location.y === row) {
      beaconsAndSensorsInRow.add(sensor.location.x);
    }
    if (sensor.closestBeacon.y === row) {
      beaconsAndSensorsInRow.add(sensor.closestBeacon.x);
    }
  }

  for (let i = state.minX; i <= state.maxX; i++) {
    for (const sensor of sensors) {
      const distance = Math.abs(sensor.location.x - i) + Math.abs(sensor.location.y - row);
      if (distance <= sensor.beaconDistance && !beaconsAndSensorsInRow.has(i)) {
        closeCells.add(i);
      }
    }
  }

  return [closeCells, beaconsAndSensorsInRow];
}

function unavaialbleRangesForRow(row: number, sensors: Sensor[]): Range[] {
  const min = 0;
  const max = sensors.length < 20 ? 20 : 4000000;

  const ranges = [] as Range[];

  for (const sensor of sensors) {
    const verticalDistance = Math.abs(sensor.location.y - row);
    const distanceRemaining = sensor.beaconDistance - verticalDistance;
    if (distanceRemaining >= 0) {
      ranges.push({
        min: Math.max(min, sensor.location.x - distanceRemaining),
        max: Math.min(max, sensor.location.x + distanceRemaining),
      });
    }
  }

  return ranges.sort((a: Range, b: Range) => {
    if (a.min === b.min) return a.max < b.max ? -1 : 1;
    return a.min - b.min;
  });
}

function calculateTuningFrequency(x: number, y: number): number {
  return x * 4000000 + y;
}

function part1(state: State) {
  const row = state.sensors.length < 20 ? 10 : 2000000;
  const [closeCells, _] = unavailableCellsForRow(row, state);
  return closeCells.size;
}

function part2({ sensors }: State) {
  const min = 0;
  const max = sensors.length < 20 ? 20 : 4000000;

  for (let j = min; j < max; j++) {
    const ranges = unavaialbleRangesForRow(j, sensors);
    let current = 0;
    for (const range of ranges) {
      if (range.min > current) {
        return calculateTuningFrequency(current + 1, j);
      } else {
        current = Math.max(current, range.max);
      }
    }
    if (current < max) {
      return calculateTuningFrequency(max, j);
    }
  }

  throw new Error(`Failed to find solution :(`);
}

solve({ part1, test1: 26, part2, test2: 56000011, parser: parser });

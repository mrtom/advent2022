import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Cell = ' ' | '.' | '#';
type Grid = Cell[][];
type Turn = 'R' | 'L' | undefined;
type Instruction = {
  steps: number;
  turn: Turn;
};
type Input = {
  grid: Grid;
  instructions: Instruction[];
};
type Coordinate = {
  x: number;
  y: number;
};
type Direction = 'U' | 'R' | 'D' | 'L';

const regex = /(\d)+/g;

function parseGrid(rawGrid: string[]): Grid {
  const grid = Array(200)
    .fill(' ')
    .map((_) => Array(200).fill(' '));
  rawGrid.map((line, yIdx) => {
    const row = line.split('');
    for (let i = 0; i < row.length; i++) {
      grid[yIdx]![i] = row[i];
    }
  });
  return grid;
}

function parseInstructions(rawInstructions: string): Instruction[] {
  const ins = [] as Instruction[];
  const matches = rawInstructions.matchAll(regex);
  for (const match of matches) {
    ins.push({
      steps: Number(match[0]),
      turn: rawInstructions[match.index! + match[0]!.length] as Turn,
    });
  }

  return ins;
}

function parser(_input: string): Input {
  const input = parseLines()(_input);
  const rawInstructions = input.splice(
    input.findIndex((line) => line.length === 0),
    2,
  )[1]!;

  return {
    grid: parseGrid(input),
    instructions: parseInstructions(rawInstructions),
  };
}

function makeTurn(startingDirection: Direction, turn: Turn): Direction {
  if (turn === 'R') {
    switch (startingDirection) {
      case 'U':
        return 'R';
      case 'R':
        return 'D';
      case 'D':
        return 'L';
      case 'L':
        return 'U';
    }
  } else if (turn === 'L') {
    switch (startingDirection) {
      case 'U':
        return 'L';
      case 'R':
        return 'U';
      case 'D':
        return 'R';
      case 'L':
        return 'D';
    }
  }
  throw new Error(`Unexpected turn: ${turn}`);
}

function pathForDirection(
  direction: Direction,
  position: Coordinate,
  grid: Grid,
): Cell[] {
  if (direction === 'R' || direction === 'L') {
    return grid[position.y]!;
  } else if (direction === 'U' || direction === 'D') {
    return grid.map((row) => row[position.x]!);
  }
  throw new Error(`Unexpected direction: ${direction}`);
}

function moveDistance(
  distance: number,
  direction: Direction,
  startingPosition: Coordinate,
  grid: Grid,
): Coordinate {
  const path = pathForDirection(direction, startingPosition, grid);
  const isMovingHorizontally = direction === 'L' || direction === 'R';

  let stepDirection = 1;
  let startPos = isMovingHorizontally ? startingPosition.x : startingPosition.y;

  if (direction === 'L' || direction == 'U') {
    stepDirection = -1;
  }

  let foundWall = false;
  let step = 1;
  let endPosition = startPos;
  let next = endPosition;

  while (foundWall === false && step <= distance) {
    if (!path) debugger;
    next = (next + 1 * stepDirection) % path.length;
    if (next < 0) {
      next = path.length - 1;
    }

    while (path[next] === ' ') {
      next = (next + 1 * stepDirection) % path.length;
      if (next < 0) {
        next = path.length - 1;
      }
    }

    const nextCell = path[next]!;
    if (nextCell === '#') {
      foundWall = true;
      continue;
    }

    endPosition = next;
    step++;
  }

  const end = {
    x: isMovingHorizontally ? endPosition : startingPosition.x,
    y: isMovingHorizontally ? startingPosition.y : endPosition,
  };

  return end;
}

function followInstruction(
  instruction: Instruction,
  grid: Grid,
  startingDirection: Direction,
  startingPosition: Coordinate,
): [Direction, Coordinate] {
  if (startingPosition.x === 134 && startingPosition.y === 32) debugger;

  const endPosition = moveDistance(
    instruction.steps,
    startingDirection,
    startingPosition,
    grid,
  );
  const newDirection =
    instruction.turn !== undefined
      ? makeTurn(startingDirection, instruction.turn)
      : startingDirection;

  return [newDirection, endPosition];
}

function calculateAnswer(direction: Direction, position: Coordinate): number {
  let drn: number;
  switch (direction) {
    case 'U': {
      drn = 3;
      break;
    }
    case 'R': {
      drn = 0;
      break;
    }
    case 'D':
      drn = 1;
      break;
    case 'L':
      drn = 2;
      break;
  }
  return (position.y + 1) * 1000 + (position.x + 1) * 4 + drn;
}

function findStartingPosition(grid: Grid): Coordinate {
  const column = grid[0]!.findIndex((cell) => cell === '.');
  return {
    x: column,
    y: 0,
  };
}

function part1(input: Input) {
  let position = findStartingPosition(input.grid);
  let direction = 'R' as Direction;

  for (const ins of input.instructions) {
    [direction, position] = followInstruction(
      ins,
      input.grid,
      direction,
      position,
    );
  }

  const answer = calculateAnswer(direction, position);
  return answer;
}

function part2(input: Input) {
  return 0;
}

solve({ part1, test1: 6032, part2, test2: -1, parser });

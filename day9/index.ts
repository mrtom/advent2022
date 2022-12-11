import { strict as assert } from 'node:assert';
import { isEqual } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Direction = 'U' | 'D' | 'L' | 'R';
type Move = {
  direction: Direction;
  steps: number;
};
type Location = {
  x: number;
  y: number;
};
type Rope = {
  head: Location;
  tail: Location;
};
type LongRope = {
  knots: Location[];
};

function encodeLocation(loc: Location): string {
  return `${loc.x},${loc.y}`;
}

function parser(_input: string): Move[] {
  return parseLines()(_input).map((line): Move => {
    const [dir, steps] = line.split(' ');
    return {
      direction: dir as Direction,
      steps: parseInt(steps!, 10),
    };
  });
}

function moveTail(head: Location, tail: Location): Location {
  // If on top of each other, don't move
  if (isEqual(head, tail)) return tail;

  // If touching, don't move
  if (
    (head.x === tail.x && Math.abs(head.y - tail.y) === 1) ||
    (head.y === tail.y && Math.abs(head.x - tail.x) === 1) ||
    (Math.abs(head.x - tail.x) <= 1 && Math.abs(head.y - tail.y) <= 1)
  ) {
    return tail;
  }

  // If same x but > 1 on y, move in y dir
  if (head.x === tail.x) {
    if (head.y - tail.y > 0) {
      // Move up
      return {
        x: tail.x,
        y: tail.y + 1,
      };
    } else {
      // Move down
      return {
        x: tail.x,
        y: tail.y - 1,
      };
    }
  }

  // If same y but > 1 on x, move in x dir
  if (head.y === tail.y) {
    if (head.x - tail.x > 0) {
      // Move right
      return {
        x: tail.x + 1,
        y: tail.y,
      };
    } else {
      // Move down
      return {
        x: tail.x - 1,
        y: tail.y,
      };
    }
  }

  // Move diagonal
  let x = tail.x;
  let y = tail.y;

  if (head.x - tail.x > 0) {
    x++;
  } else {
    x--;
  }

  if (head.y - tail.y > 0) {
    y++;
  } else {
    y--;
  }

  return {
    x,
    y,
  };
}

function applyMove(rope: Rope, move: Move, map: Set<string>): Rope {
  let headLoc = rope.head;
  let tailLoc = rope.tail;

  for (let i = 0; i < move.steps; i++) {
    switch (move.direction) {
      case 'U':
        headLoc.y = headLoc.y + 1;
        break;
      case 'D':
        headLoc.y = headLoc.y - 1;
        break;
      case 'L':
        headLoc.x = headLoc.x - 1;
        break;
      case 'R':
        headLoc.x = headLoc.x + 1;
        break;
      default:
        assert(false, `Unexpected direction: ${move.direction}`);
    }

    tailLoc = moveTail(headLoc, tailLoc);
    map.add(encodeLocation(tailLoc));

    assert(
      Math.abs(headLoc.x - tailLoc.x) <= 1,
      `Head Loc: ${encodeLocation(headLoc)}, Tail Loc: ${encodeLocation(
        tailLoc,
      )}`,
    );
    assert(
      Math.abs(headLoc.y - tailLoc.y) <= 1,
      `Head Loc: ${encodeLocation(headLoc)}, Tail Loc: ${encodeLocation(
        tailLoc,
      )}`,
    );
  }

  return {
    head: headLoc,
    tail: tailLoc,
  };
}

// Part 2, loop over pairs of knots
function applyLongMove(rope: LongRope, move: Move, map: Set<string>): LongRope {
  const knots = rope.knots;
  let headLoc = knots[0]!;

  for (let i = 0; i < move.steps; i++) {
    switch (move.direction) {
      case 'U':
        headLoc.y = headLoc.y + 1;
        break;
      case 'D':
        headLoc.y = headLoc.y - 1;
        break;
      case 'L':
        headLoc.x = headLoc.x - 1;
        break;
      case 'R':
        headLoc.x = headLoc.x + 1;
        break;
      default:
        assert(false, `Unexpected direction: ${move.direction}`);
    }

    for (let k = 0; k < knots.length - 1; k++) {
      knots[k + 1] = moveTail(knots[k]!, knots[k + 1]!);
      const isTail = k == knots.length - 2;
      if (isTail) map.add(encodeLocation(knots[knots.length - 1]!));
    }
  }

  return {
    knots: knots,
  };
}

function part1(moves: Move[]) {
  const visited = new Set<string>([encodeLocation({ x: 0, y: 0 })]);
  let rope = {
    head: { x: 0, y: 0 },
    tail: { x: 0, y: 0 },
  };
  for (let i = 0; i < moves.length; i++) {
    rope = applyMove(rope, moves[i]!, visited);
  }

  return visited.size;
}

function part2(moves: Move[]) {
  const visited = new Set<string>([encodeLocation({ x: 0, y: 0 })]);
  let rope: LongRope = {
    knots: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  };

  for (let i = 0; i < moves.length; i++) {
    rope = applyLongMove(rope, moves[i]!, visited);
  }

  return visited.size;
}

solve({ part1, part2, parser: parser });

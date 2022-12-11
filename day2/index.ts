import { sum } from 'lodash';
import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type RPS = 'R' | 'P' | 'S';
type WLD = 'W' | 'L' | 'D';
type ShapeScore = 1 | 2 | 3;
type OutcomeScore = 0 | 3 | 6;

type Game = {
  them: 'A' | 'B' | 'C';
  us: 'X' | 'Y' | 'Z';
};

type Result = Game & {
  outcomeScore: OutcomeScore;
  shapeScore: ShapeScore;
  gameScore: number;
};

function createGame(input: string): Game {
  const _input = input.split(' ');
  return {
    them: _input[0] as 'A' | 'B' | 'C',
    us: _input[1] as 'X' | 'Y' | 'Z',
  };
}

function decodeThem(game: Game): RPS {
  switch (game.them) {
    case 'A':
      return 'R';
    case 'B':
      return 'P';
    case 'C':
      return 'S';
  }
}

// function decodeUs(game: Game): RPS {
//   switch(game.us) {
//     case 'X': return 'R';
//     case 'Y': return 'P';
//     case 'Z': return 'S';
//   }
// }

function preDecodeFprPart2(game: Game): WLD {
  switch (game.us) {
    case 'X':
      return 'L';
    case 'Y':
      return 'D';
    case 'Z':
      return 'W';
  }
}

function decodeUs(game: Game): RPS {
  const them = decodeThem(game);
  const result = preDecodeFprPart2(game);

  switch (result) {
    case 'D':
      return them;
    case 'L':
      switch (them) {
        case 'R':
          return 'S';
        case 'P':
          return 'R';
        case 'S':
          return 'P';
      }
    case 'W':
      switch (them) {
        case 'R':
          return 'P';
        case 'P':
          return 'S';
        case 'S':
          return 'R';
      }
  }
}

function getShapeScore(shape: RPS): ShapeScore {
  if (shape === 'R') return 1;
  if (shape === 'P') return 2;
  if (shape === 'S') return 3;

  console.error(shape);
  throw new Error('Eh?');
}

function getOutcomeScore(game: Game): OutcomeScore {
  const decodedThem = decodeThem(game);
  const decodedUs = decodeUs(game);

  if (decodedThem === decodedUs) return 3;

  if (decodedUs === 'R') {
    return decodedThem === 'S' ? 6 : 0;
  }

  if (decodedUs === 'P') {
    return decodedThem === 'R' ? 6 : 0;
  }

  if (decodedUs === 'S') {
    return decodedThem === 'P' ? 6 : 0;
  }

  console.error(game);
  throw new Error('Eh?');
}

function calculateResult(game: Game): Result {
  return {
    them: game.them,
    us: game.us,
    outcomeScore: getOutcomeScore(game),
    shapeScore: getShapeScore(decodeUs(game)),
    gameScore: getOutcomeScore(game) + getShapeScore(decodeUs(game)),
  };
}

function part1(_input: string[]) {
  const games = _input.map((i) => createGame(i));
  const results = games.map((i) => calculateResult(i));
  const scores = results.map((result) => result.gameScore);
  return sum(scores);
}

function part2(_input: string[]) {
  const games = _input.map((i) => createGame(i));
  const results = games.map((i) => calculateResult(i));
  const scores = results.map((result) => result.gameScore);
  return sum(scores);
}

solve({ part1, part2, parser: parseLines() });

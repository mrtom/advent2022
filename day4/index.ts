import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Assignment = {
  start: number;
  finish: number;
};

type Pair = [Assignment, Assignment];

function decodeAssignment(input: string): Assignment {
  const [first, last] = input.split('-');
  if (first === undefined || last === undefined) {
    throw new Error(`Error splitting Assignment ${input}`);
  }

  return {
    start: parseInt(first, 10),
    finish: parseInt(last, 10),
  };
}

function decodeAssignmentPairs(input: string): Pair {
  const [first, last] = input.split(',');
  if (first === undefined || last === undefined) {
    throw new Error(`Error splitting Pair ${input}`);
  }

  return [decodeAssignment(first), decodeAssignment(last)];
}

function filterOverlapping(pair: Pair): boolean {
  const [first, last] = pair;

  if (first.start >= last.start && first.finish <= last.finish) {
    return true;
  }

  if (last.start >= first.start && last.finish <= first.finish) {
    return true;
  }

  return false;
}

function filterOverlappingPart2(pair: Pair): boolean {
  const [first, last] = pair;

  if (last.start <= first.finish && last.finish >= first.finish) {
    return true;
  }

  if (first.start <= last.finish && first.finish >= last.finish) {
    return true;
  }

  return false;
}

function part1(_input: string[]) {
  const assignmentPairs = _input.map((i) => decodeAssignmentPairs(i));
  const filteredPairs = assignmentPairs.filter(filterOverlapping);
  return filteredPairs.length;
}

function part2(_input: string[]) {
  const assignmentPairs = _input.map((i) => decodeAssignmentPairs(i));
  const filteredPairs = assignmentPairs.filter(filterOverlappingPart2);
  return filteredPairs.length;
}

solve({ part1, part2, parser: parseLines(), dryRun: false });

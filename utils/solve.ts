import { readFileSync, existsSync, appendFile } from 'fs';
import { config } from 'dotenv';
import { dirname } from 'path';
import caller from 'caller';
config();

type SolveArgs<T> = {
  part1: (input: T) => string;
  part2: (input: T) => string;
  parser: (input: string) => T;
};

export async function solve<T = string[]>({
  part1,
  part2,
  parser,
}: SolveArgs<T>) {
  const part1Solved = existsSync('./input2.txt');
  const [solver, file] = part1Solved
    ? [part2, './input2.txt']
    : [part1, './input.txt'];

  const dir = dirname(caller());
  const fileName = `${dir}/${file}`;
  const input = parser(readFileSync(fileName, 'utf8'));
  const answer = solver(input);
  const solutions = readFileSync(`${dir}/solutions.txt`, 'utf8').split('\n');
  if (solutions.includes(answer)) {
    console.log('Solution already attempted!');
    return;
  }
  appendFile(`${dir}/solutions.txt`, `${answer}\n`, () => {});
  const result = await fetch('https://adventofcode.com/2021/day/1/answer', {
    method: 'POST',
    headers: {
      cookie: `session=${process.env.SESSION}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `level=1&answer=${answer}`,
  });
  const body = await result.text();
  if (body.includes('not the right answer')) {
    console.log('Wrong answer!');
  } else {
    console.log('Correct answer!');
  }
}

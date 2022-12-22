import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Monkey = {
  name: string;
  children: string[];
  operation: '+' | '-' | '*' | '/' | undefined;
  number: number | undefined;
};

const regex = /[-+*/]/g;
const monkeyByName = new Map<string, Monkey>();

function parser(input: string): Monkey {
  parseLines()(input).map((line) => {
    const [name, rest] = line.split(':');
    if (rest!.match(regex)) {
      const [first, operation, second] = rest!.trim().split(' ');
      const monkey = {
        name: name!,
        children: [first!, second!],
        operation,
        number: undefined,
      } as Monkey;
      monkeyByName.set(name!, monkey);
    } else {
      const monkey = {
        name: name!,
        children: [] as string[],
        operation: undefined,
        number: Number(rest!.trim()),
      };
      monkeyByName.set(name!, monkey);
    }
  });

  return monkeyByName.get('root')!;
}

function traverseMonkeyPath(monkey: Monkey): number {
  if (monkey.number !== undefined) {
    return monkey.number;
  }

  const [first, second] = monkey.children.map((child) =>
    traverseMonkeyPath(monkeyByName.get(child!)!),
  );
  return eval(`${first} ${monkey.operation} ${second}`);
}

function containsHuman(monkey: Monkey): boolean {
  if (monkey.name === 'humn') return true;
  if (monkey.children.length == 0) return false;

  const [first, second] = monkey.children.map((child) =>
    containsHuman(monkeyByName.get(child!)!),
  );
  return first! || second!;
}

function traversePart2(monkey: Monkey, result: number): number {
  if (monkey.name === 'humn') return result;

  const [first, second] = monkey.children.map((child) =>
    monkeyByName.get(child!),
  );

  const firstContainsHuman = containsHuman(first!);
  if (firstContainsHuman) {
    const secondResult = traverseMonkeyPath(second!);

    // Result = first + second
    // Result = first - second
    // Result = first * second
    // Result = first / second
    let firstResult;
    switch (monkey!.operation) {
      case '+':
        firstResult = result - secondResult;
        break;
      case '-':
        firstResult = result + secondResult;
        break;
      case '*':
        firstResult = result / secondResult;
        break;
      case '/':
        firstResult = result * secondResult;
        break;
      default:
        throw new Error('Unexpected operation');
    }
    return traversePart2(first!, firstResult);
  } else {
    const firstResult = traverseMonkeyPath(first!);

    // Result = first + second
    // Result = first - second
    // Result = first * second
    // Result = first / second
    let secondResult;
    switch (monkey!.operation) {
      case '+':
        secondResult = result - firstResult;
        break;
      case '-':
        secondResult = firstResult - result;
        break;
      case '*':
        secondResult = result / firstResult;
        break;
      case '/':
        secondResult = firstResult / result;
        break;
      default:
        throw new Error('Unexpected operation');
    }
    return traversePart2(second!, secondResult);
  }
}

function part1(root: Monkey) {
  const result = traverseMonkeyPath(root!);
  return result;
}

function part2(root: Monkey) {
  const [first, second] = root.children.map((child) =>
    monkeyByName.get(child!),
  );

  const firstContainsHuman = containsHuman(first!);
  if (firstContainsHuman) {
    const secondResult = traverseMonkeyPath(second!);
    const result = traversePart2(first!, secondResult);
    return result;
  } else {
    const firstResult = traverseMonkeyPath(first!);
    const result = traversePart2(second!, firstResult);
    return result;
  }
}

solve({ part1, test1: 152, part2, test2: 301, parser });

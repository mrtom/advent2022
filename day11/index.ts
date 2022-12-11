import { strict as assert } from 'node:assert';
import { chunk, reverse, sortBy } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Operation = 'ADD' | 'MULTIPLY' | 'DIVIDE' | 'SUBTRACT';

type Monkey = {
  index: number;
  items: number[];
  itemsInspected: number;
  operationType: Operation;
  operationOrdinal: number | 'old';
  test: number;
  onPass: number;
  onFail: number;
};

function operationFromString(opStr: string): Operation {
  if (opStr === '+') {
    return 'ADD';
  } else if (opStr === '*') {
    return 'MULTIPLY';
    // } else if (opStr === '-') {
    //   return 'SUBTRACT';
    // } else if (opStr === '/') {
    //   return 'DIVIDE';
  } else {
    throw new Error('Unexpected operation!');
  }
}

function parseGameStart(_input: string): Monkey[] {
  const lines = parseLines()(_input);
  const monkeysInput = chunk(lines, 7);

  let monkeys: Monkey[] = [];

  for (let i = 0; i < monkeysInput.length; i++) {
    const monkeyInput = monkeysInput[i] as string[];
    assert(parseInt(monkeyInput[0]!.split(' ')[1]!.charAt(0)) === i);

    const startingItems: number[] = monkeyInput[1]!
      .split(':')[1]!
      .split(',')
      .map((str) => parseInt(str.trim(), 10));

    const operation = monkeyInput[2]!.split('Operation: new = old ')[1];
    const [operationTypeStr, operationOrdinalStr] = operation!.split(' ');
    const test = parseInt(monkeyInput[3]!.split('Test: divisible by ')[1]!, 10);
    const onPass = parseInt(monkeyInput[4]!.split(' throw to monkey ')[1]!, 10);
    const onFail = parseInt(monkeyInput[5]!.split(' throw to monkey ')[1]!, 10);

    monkeys.push({
      index: i,
      items: startingItems,
      itemsInspected: 0,
      operationType: operationFromString(operationTypeStr!),
      operationOrdinal:
        operationOrdinalStr === 'old'
          ? 'old'
          : parseInt(operationOrdinalStr!, 10),
      test: test,
      onPass,
      onFail,
    });
  }

  return monkeys;
}

function playRound(
  monkeys: Monkey[],
  lcm: number | undefined = undefined,
): Monkey[] {
  for (let i = 0; i < monkeys.length; i++) {
    let currentMonkey = monkeys[i] as Monkey;
    while (currentMonkey.items.length > 0) {
      const item = currentMonkey.items.splice(0, 1)[0]!;
      currentMonkey.itemsInspected++;
      let worryLevel = 0;
      switch (currentMonkey.operationType) {
        case 'ADD':
          switch (currentMonkey.operationOrdinal) {
            case 'old':
              worryLevel = item + item;
              break;
            default:
              worryLevel = item + currentMonkey.operationOrdinal;
              break;
          }
          break;
        case 'MULTIPLY':
          switch (currentMonkey.operationOrdinal) {
            case 'old':
              worryLevel = item * item;
              break;
            default:
              worryLevel = item * currentMonkey.operationOrdinal;
          }
          break;
        default:
          throw new Error(
            `Unexpected operatoin: ${currentMonkey.operationType}`,
          );
      }

      if (lcm === undefined) {
        worryLevel = Math.floor(worryLevel / 3);
      } else {
        worryLevel = worryLevel % lcm;
      }

      const testResult = worryLevel % currentMonkey.test;
      if (testResult === 0) {
        monkeys[currentMonkey.onPass]!.items.push(worryLevel);
      } else {
        monkeys[currentMonkey.onFail]!.items.push(worryLevel);
      }
    }
  }

  return monkeys;
}

function part1(monkeys: Monkey[]) {
  for (let i = 0; i < 20; i++) {
    monkeys = playRound(monkeys);
  }

  const sorted = reverse(sortBy(monkeys, (monkey) => monkey.itemsInspected));
  const answer = sorted[0]!.itemsInspected * sorted[1]!.itemsInspected;

  return answer;
}

function part2(monkeys: Monkey[]) {
  const lcm = monkeys.map((m) => m.test).reduce((a, b) => a * b, 1);
  for (let i = 0; i < 10000; i++) {
    monkeys = playRound(monkeys, lcm);
  }

  const sorted = reverse(sortBy(monkeys, (monkey) => monkey.itemsInspected));
  const answer = sorted[0]!.itemsInspected * sorted[1]!.itemsInspected;

  return answer;
}

solve({ part1, part2, parser: parseGameStart });

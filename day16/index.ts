import { strict as assert } from 'node:assert';
import { findIndex } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

const regex =
  /Valve (?<valveName>[A-Z]{2}) has flow rate=(?<rate>\d+); tunnel(s)? lead(s)? to valve(s)? (?<children>.*)$/g;

type Node = {
  name: string;
  rate: number;
  childNames: string[];
  children: Node[];
  distances: Map<Node, number>;
}

type PressureWithPath = {
  pressure: number;
  path: Node[];
}

function getDistance(from: Node, to: Node): [Node, number] {
  const foundNodes = new Set(from.children);
  let distance = 1;
  while (!foundNodes.has(to)) {
    distance++;
    Array.from(foundNodes)
      .flatMap(node => node.children)
      .map(node => {
        foundNodes.add(node);
      });
  }
  return [to, distance];
}

function parseInput(_input: string): Node {
  const input = parseLines()(_input);
  const nodesByName = new Map<string, Node>();
  const allNodes = input.map((line): Node => {
    const match = line.matchAll(regex).next().value;
    const name = match?.groups?.valveName;
    const rate = Number(match?.groups?.rate);
    const childNames = match?.groups?.children.split(',').map((childName: string) => childName.trim());

    const node = {
      name,
      rate,
      childNames,
      children: [],
      distances: new Map<Node, number>(),
    };

    nodesByName.set(name, node);

    return node;
  });

  if (allNodes.length === 0) {
    throw new Error('Parsing failed');
  }

  for (const node of allNodes) {
    for (const childNodeName of node.childNames) {
      const childNode = nodesByName.get(childNodeName);
      assert(childNode !== undefined);
      node.children.push(childNode);
    }
  }

  for (const node of allNodes) {
    const distances = allNodes
      .filter(n => n.name !== node.name)
      .map(n => getDistance(node, n));
    node.distances = new Map(distances);
  }

  return nodesByName.get('AA')!;
}

function getTotalPressureReleasedByNode(node: Node, minutesRemaining: number): number {
  return node.rate * minutesRemaining;
}

function getTopChoices(node: Node, minutesRemaining: number, opened: Node[]): Node[] {
  // Keys are Nodes
  // Values are distances (a number)
  // This code is horrible. I should feel bad.
  // And don't worry, I do.
  const nodesAndDistances = Array.from(node.distances);
  return nodesAndDistances
    // Don't bother with any nodes that don't have any pressure
    .filter(dist => dist[0].rate > 0)
    // Don't bother with any nodes that we've already opened
    .filter(dist => findIndex(opened, (openedNode) => openedNode.name === dist[0].name) === -1)
    // Don't bother with any nodes where travelling there would take us past the 30 min threshold
    .filter(dist => minutesRemaining - dist[1] > 0)
    // Sort by average flow rate per distance travelled
    // .sort((a, b) => {
    //   return b[0].rate / b[1] - a[0].rate / a[1]
    // })
    .map(([k, _]) => k);
}

function findMaxPressureFromNode(
  node: Node,
  minutesRemaining: number,
  opened: Node[],
): PressureWithPath {
  if (minutesRemaining < 0 ) {
    throw new Error("This shouldn't be possible");
  }

  const totalPressureReleasedByNode = getTotalPressureReleasedByNode(node, minutesRemaining);
  const choices = getTopChoices(node, minutesRemaining, opened);

  // Base case
  if (choices.length === 0) {
    return {
      pressure: totalPressureReleasedByNode,
      path: [node, ...opened],
    };
  }

  // Else, recurse for DFS
  const paths = choices
    .map((choice) => findMaxPressureFromNode(choice, minutesRemaining - (node.distances.get(choice) ?? 0) - 1, [node, ...opened]))
    .map(pathWithPressure => {
      return {
        pressure: pathWithPressure.pressure + totalPressureReleasedByNode,
        path: pathWithPressure.path,
      }
    });

  // Pick the biggest
  paths.sort((a, b) => b.pressure - a.pressure);
  return {
    pressure: paths[0]!.pressure,
    path: paths[0]!.path
  };
}

function part1(root: Node) {
  const { pressure, path } = findMaxPressureFromNode(root, 30, []);
  console.debug(JSON.stringify(path.map(node => node.name)));
  return pressure;
}

function part2(root: Node) {
  const { pressure, path } = findMaxPressureFromNode(root, 26, []);
  console.debug(JSON.stringify(path.map(node => node.name)));
  return pressure;
}

solve({ part1, test1: 1651, part2, test2: 1707, parser: parseInput });

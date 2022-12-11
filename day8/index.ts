import { clone, max, reverse } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type TreePosition = [number, number];
type Tree = {
  height: number;
  position: TreePosition;
};
type ColumnFromTop = Tree[];
type TreeGrid = ColumnFromTop[];

function identityArrayOfSize(width: number, height: number): number[][] {
  return new Array(height).fill(1).map(() => new Array(width).fill(1));
}

function transpose<T>(matrix: T[][]): T[][] {
  let [row] = matrix;
  return row!.map((_, column) => matrix.map((row) => row[column]!));
}

function keyFromPosition(position: TreePosition): string {
  return `${position[0]},${position[1]}`;
}

function parseMap(_input: string): TreeGrid {
  const allTrees = [] as ColumnFromTop[];
  const input = parseLines()(_input);
  input.map((row, rowIdx) => {
    allTrees.push(
      row.split('').map((height, columnIdx) => {
        return {
          height: parseInt(height, 10),
          position: [columnIdx, rowIdx],
        };
      }),
    );
  });

  return allTrees;
}

function visibleTreesFromDrn(grid: TreeGrid): Set<string> {
  const visibleTrees = new Set<string>();

  grid.map((row) => {
    row.reduce((maxHeight, tree): number => {
      if (tree.height > maxHeight) {
        visibleTrees.add(keyFromPosition(tree.position));
        maxHeight = tree.height;
      }

      return maxHeight;
    }, -1);
  });

  return visibleTrees;
}

function scoresForDrn(grid: TreeGrid): number[][] {
  const scores = new Array(grid[0]!.length)
    .fill(0)
    .map(() => new Array(grid.length).fill(0));

  grid.map((rows, rowIdx) => {
    rows.map((tree, columnIdx) => {
      const treeHeight = tree.height;

      var height = -1;
      var treeCount = 0;
      var rowPtr = rowIdx - 1;

      while (height < treeHeight && rowPtr >= 0) {
        height = grid[rowPtr]![columnIdx]!.height;
        treeCount++;
        rowPtr--;
      }

      scores[tree.position[1]]![tree.position[0]] = treeCount;
    });
  });

  return scores;
}

function part1(grid: TreeGrid) {
  const gridRightToLeft = grid.map((row) => reverse(clone(row)));
  const topToBottom = transpose(grid);
  const bottomToTop = topToBottom.map((row) => reverse(clone(row)));
  const gridFrom4Drns = [grid, gridRightToLeft, topToBottom, bottomToTop];

  const visibleFromDrn = gridFrom4Drns.map((grid) => visibleTreesFromDrn(grid));
  const reduced = visibleFromDrn.reduce((acc, visible): Set<string> => {
    visible.forEach(acc.add, acc);
    return acc;
  }, new Set<string>());

  return reduced.size;
}

function part2(grid: TreeGrid) {
  const grid90 = transpose(grid).map((row) => reverse(clone(row)));
  const grid180 = reverse(clone(grid));
  const grid270 = reverse(clone(grid90.map((row) => reverse(clone(row)))));
  const gridFrom4Drns = [grid, grid90, grid180, grid270];
  const scoresForDir = gridFrom4Drns.map((grid) => scoresForDrn(grid));

  const scores = scoresForDir.reduce((acc, cur): number[][] => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0]!.length; j++) {
        acc[i]![j]! = acc![i]![j]! * cur[i]![j]!;
      }
    }
    return acc;
  }, identityArrayOfSize(grid[0]!.length, grid.length));

  const answer = max(scores.map((c) => max(c)));

  return answer;
}

solve({ part1, part2, parser: parseMap });

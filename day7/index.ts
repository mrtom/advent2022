import { strict as assert } from 'node:assert';
import { sortBy, sum } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type File  = {
  name: string,
  size: number,
}

type Directory = {
  name: string,
  parent: Directory | null,
  children: Directory[],
  files: File[],
  size: number
  totalSize: number
}

type RootDirectory = Directory;

const createFile = (name: string, size: number): File => {
  return {
    name,
    size
  };
}

const createDirectory = (name: string, parent: Directory | null): Directory => {
  return {
    name,
    parent,
    children: [],
    files: [],
    size: 0,
    totalSize: 0,
  }
}

const isCommand = (line: string): boolean => {
  return line.startsWith('$');
}

const isCdCommand = (line: string): boolean => {
  return line.startsWith('$ cd');
}

const isListCommand = (line: string): boolean => {
  return line.startsWith('$ ls');
}

const calculateTotalSizes = (root: Directory) => {
  // DFS to find root nodes and calculate from the bottom up
  for (let i = 0; i < root.children.length; i++) {
    calculateTotalSizes(root.children[i]!);
  }

  root.totalSize = sum(root.children.map(dir => dir.totalSize)) + root.size;
}

const findSmallDirectories = (root: Directory, smallDirs: Directory[]): Directory[] => {
  // DFS again
  for (let i = 0; i < root.children.length; i++) {
    findSmallDirectories(root.children[i]!, smallDirs);
  }

  if (root.totalSize <= 100000) {
    smallDirs.push(root);
  }

  return smallDirs;
}

const findAllDirectories = (root: Directory, allDirs: Directory[]): Directory[] => {
  // DFS again
  for (let i = 0; i < root.children.length; i++) {
    findAllDirectories(root.children[i]!, allDirs);
  }

  allDirs.push(root);

  return allDirs;
}

const parseInput = (_input: string): RootDirectory => {
  const input = parseLines()(_input);
  const rootDirectory = createDirectory('/', null);

  let currentDirectory = rootDirectory;
  let processingLsCommand = false;

  // first command is always to return to root directory, so ignore
  for (let i = 1; i < input.length; i++) {
    const nextLine = input[i];

    if (isCommand(nextLine!)) {
      // If we were processing an ls command but the next
      // input is a command, we've finished listing files
      processingLsCommand = false;
    }

    if (processingLsCommand) {
      const data = nextLine!.split(' ');
      if (data[0] === 'dir') {
        const newDir = createDirectory(data[1]!, currentDirectory);
        currentDirectory.children.push(newDir);
      } else {
        // File
        const size = parseInt(data[0]!, 10);
        currentDirectory.size += size;
        currentDirectory.files.push(createFile(data[1]!, size));
      }

      continue;
    }

    if (isListCommand(nextLine!)) {
      processingLsCommand = true;
      continue;
    }

    if (isCdCommand(nextLine!)) {
      const [_, __, dirName] = nextLine!.split(' ');

      if (dirName === '..') {
        assert(currentDirectory.parent !== null);
        currentDirectory = currentDirectory.parent!;
      } else {
        const idx = currentDirectory.children.findIndex(dir => dir.name === dirName);
        currentDirectory = currentDirectory.children[idx]!;
      }
    }
  }

  calculateTotalSizes(rootDirectory);

  return rootDirectory;
}

function part1(root: RootDirectory) {
  const smallDirs = findSmallDirectories(root, []);
  return sum(smallDirs.map(dir => dir.totalSize));
}

function part2(root: RootDirectory) {
  const totalSize = 70000000;
  const spaceNeeded = 30000000;
  const sizeUsed = root.totalSize;

  const savingsNeeded = spaceNeeded - (totalSize - sizeUsed);
  const allDirs = findAllDirectories(root, []);

  const dirToDelete = sortBy(allDirs, dir => dir.totalSize).filter(dir => dir.totalSize >= savingsNeeded)[0];

  return dirToDelete?.totalSize;
}

solve({ part1, part2, parser: parseInput, dryRun: false });

import { max } from 'lodash';

import { parseLines } from '../utils/parse';
import { solve } from '../utils/solve';

type Blueprint = {
  idx: number;
  oreRobotCost: number;
  clayRobotCost: number;
  obsRobotCost: { ore: number; clay: number };
  geodeRobotCost: { ore: number; obs: number };
  numGeodes: number;
};

type State = {
  minute: number;
  ore: number;
  clay: number;
  obs: number;
  oreRobots: number;
  clayRobots: number;
  obsRobots: number;
  geoRobots: number;
  geo: number;
};

type RobotCounts = {
  oreRobots: number;
  clayRobots: number;
  obsRobots: number;
  geoRobots: number;
};

const maxGeodesPerMinute = new Map<number, number>();
const maxRobotsPerMinute = new Map<number, RobotCounts>();

const regex = /(\d)+/g;
function parser(_input: string): Blueprint[] {
  const bpParser = (line: string): Blueprint => {
    const data = line.match(regex)!.map((match) => Number(match));
    const [
      idx,
      oreRobotCost,
      clayRobotCost,
      obsRobotOre,
      obsRobotClay,
      geoRobotOre,
      geoRobotObs,
    ] = data;
    return {
      idx: idx!,
      oreRobotCost: oreRobotCost!,
      clayRobotCost: clayRobotCost!,
      obsRobotCost: {
        ore: obsRobotOre!,
        clay: obsRobotClay!,
      },
      geodeRobotCost: {
        ore: geoRobotOre!,
        obs: geoRobotObs!,
      },
      numGeodes: -1,
    };
  };
  return parseLines()(_input).map(bpParser);
}

function potentialMax(geo: number, minute: number): number {
  // Potential score is current score + triangle number for remaining minutes
  const minutesLeft = 25 - minute;
  return geo + (minutesLeft * (minutesLeft + 1)) / 2;
}

function traverseGraph(initialState: State, blueprint: Blueprint): number {
  let max = 0;
  const queue: State[] = [initialState];
  while (queue.length > 0) {
    const nextState = queue.shift()!;
    const {
      minute,
      ore,
      clay,
      obs,
      oreRobots,
      clayRobots,
      obsRobots,
      geoRobots,
      geo,
    } = nextState;

    const maxGeodesForMinute = maxGeodesPerMinute.get(minute) ?? 0;
    if (geo > maxGeodesForMinute) {
      maxGeodesPerMinute.set(minute, geo);
    }

    if (geo < maxGeodesForMinute) {
      continue;
    }

    if (minute === 25) {
      max = Math.max(max, geo);
      continue;
    }

    // Return early where possible

    // If max score on this branch can't beat the max, return
    if (potentialMax(geo, minute) < max) {
      continue;
    }

    // If we've seen more robots at this minute in anothoer branch
    // Bow out
    const robotsCountForMinute = maxRobotsPerMinute.get(minute);
    if (robotsCountForMinute === undefined) {
      maxRobotsPerMinute.set(minute, {
        oreRobots,
        clayRobots,
        obsRobots,
        geoRobots,
      });
    } else {
      if (
        robotsCountForMinute.oreRobots > oreRobots &&
        robotsCountForMinute.clayRobots > clayRobots &&
        robotsCountForMinute.obsRobots > obsRobots &&
        robotsCountForMinute.geoRobots > geoRobots
      ) {
        continue;
      } else if (
        robotsCountForMinute.oreRobots < oreRobots &&
        robotsCountForMinute.clayRobots < clayRobots &&
        robotsCountForMinute.obsRobots < obsRobots &&
        robotsCountForMinute.geoRobots < geoRobots
      ) {
        maxRobotsPerMinute.set(minute, {
          oreRobots,
          clayRobots,
          obsRobots,
          geoRobots,
        });
      }
    }

    // Never need more ore robots than it costs to create a robot
    if (
      oreRobots >
      Math.max(
        blueprint.oreRobotCost,
        blueprint.clayRobotCost,
        blueprint.obsRobotCost.clay,
        blueprint.geodeRobotCost.ore,
      )
    ) {
      continue;
    }

    // Never need more clay or obs robots than it costs to build a robot
    if (clayRobots > blueprint.obsRobotCost.clay) continue;
    if (obsRobots > blueprint.geodeRobotCost.obs) continue;

    // Let's get building

    // Geode cracking robots
    const geoCrackingOre = Math.floor(ore / blueprint.geodeRobotCost.ore);
    const geoCrackingObs = Math.floor(obs / blueprint.geodeRobotCost.obs);
    const geoRobotsBuilt = Math.min(geoCrackingOre, geoCrackingObs);
    if (geoRobotsBuilt > 0) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.geodeRobotCost.ore * geoRobotsBuilt + oreRobots,
        clay: clay + clayRobots,
        obs: obs - blueprint.geodeRobotCost.obs * geoRobotsBuilt + obsRobots,
        oreRobots,
        clayRobots,
        obsRobots,
        geoRobots: geoRobots + geoRobotsBuilt,
        geo: geo + geoRobots,
      });

      // Creating a geode cracking bot is the best thing we can do
      continue;
    }

    // Obs collecting robots
    const obsRobotOre = Math.floor(ore / blueprint.obsRobotCost.ore);
    const obsRobotClay = Math.floor(clay / blueprint.obsRobotCost.clay);
    const obsRobotsBuilt = Math.min(obsRobotOre, obsRobotClay);
    if (obsRobotsBuilt > 0) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.obsRobotCost.ore * obsRobotsBuilt + oreRobots,
        clay: clay - blueprint.clayRobotCost * obsRobotsBuilt + clayRobots,
        obs: obs + obsRobots,
        oreRobots,
        clayRobots,
        obsRobots,
        geoRobots,
        geo: geo + geoRobots,
      });
    }

    // Ore collecting robots
    const oreRobotsBuilt = Math.floor(ore / blueprint.oreRobotCost);
    if (oreRobotsBuilt > 0) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.oreRobotCost * obsRobotsBuilt + oreRobots,
        clay: clay + clayRobots,
        obs: obs + obsRobots,
        oreRobots: oreRobots + oreRobotsBuilt,
        clayRobots,
        obsRobots,
        geoRobots,
        geo: geo + geoRobots,
      });
    }

    // Then build Clay collecting robots
    const clayRobotsBuilt = Math.floor(ore / blueprint.clayRobotCost);
    if (clayRobotsBuilt > 0) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.clayRobotCost * clayRobotsBuilt + oreRobots,
        clay: clay + clayRobots,
        obs: obs + obsRobots,
        oreRobots,
        clayRobots: clayRobots + clayRobotsBuilt,
        obsRobots,
        geoRobots,
        geo: geo + geoRobots,
      });
    }

    // No building, just adding
    queue.push({
      minute: minute + 1,
      ore: ore + oreRobots,
      clay: clay + clayRobots,
      obs: obs + obsRobots,
      oreRobots,
      clayRobots,
      obsRobots,
      geoRobots,
      geo: geo + geoRobots,
    });
  }

  return max;
}

function calcMaxGeodesFor(blueprint: Blueprint): Blueprint {
  const numGeodes = traverseGraph(
    {
      minute: 0,
      ore: 0,
      clay: 0,
      obs: 0,
      oreRobots: 1,
      clayRobots: 0,
      obsRobots: 0,
      geoRobots: 0,
      geo: 0,
    },
    blueprint,
  );

  blueprint.numGeodes = numGeodes;
  return blueprint;
}

function part1(blueprints: Blueprint[]) {
  const answer = blueprints
    .map((bp) => calcMaxGeodesFor(bp))
    .map((bp) => bp.numGeodes * bp.idx)
    .reduce((acc, bp) => acc + bp, 0);

  return answer;
}

function part2(blueprints: Blueprint[]) {
  return 0;
}

solve({ part1, test1: 33, part2, test2: 33, parser });

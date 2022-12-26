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

type ResourceCounts = {
  ore: number;
  clay: number;
  obs: number;
  geo: number;
};

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

function encodeRobotsForMinute(
  minute: number,
  oreRobots: number,
  clayRobots: number,
  obsRobots: number,
  geoRobots: number,
): string {
  return `${minute},oreBots:${oreRobots},clayRobots:${clayRobots},obsRobots:${obsRobots},geoRobots:${geoRobots}`;
}

function potentialMax(geo: number, minute: number, time: number): number {
  // Potential score is current score + triangle number for remaining minutes
  const minutesLeft = time + 1 - minute;
  return geo + (minutesLeft * (minutesLeft + 1)) / 2;
}

function traverseGraph(
  initialState: State,
  blueprint: Blueprint,
  time: number,
): number {
  let max = 0;
  const maxGeodesPerMinute = new Map<number, number>();
  const resourcesByRobotsForMinute = new Map<string, ResourceCounts[]>();

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

    if (minute === time) {
      max = Math.max(max, geo);
      continue;
    }

    // Return early where possible

    // If max score on this branch can't beat the max, return
    if (potentialMax(geo, minute, time) < max) {
      continue;
    }

    // If we've seen more resources at this minute in anothoer branch
    // with the same number of robots, decide not to bother
    const key = encodeRobotsForMinute(
      minute,
      oreRobots,
      clayRobots,
      obsRobots,
      geoRobots,
    );
    const resourceCountsForRobots = resourcesByRobotsForMinute.get(key);
    if (resourceCountsForRobots === undefined) {
      resourcesByRobotsForMinute.set(key, [
        {
          ore,
          clay,
          obs,
          geo,
        },
      ]);
    } else {
      if (
        resourceCountsForRobots.some(
          (resourceCount) =>
            ore <= resourceCount.ore &&
            clay <= resourceCount.clay &&
            obs <= resourceCount.obs &&
            geo <= resourceCount.geo,
        )
      ) {
        continue;
      } else {
        resourceCountsForRobots.push({
          ore,
          clay,
          obs,
          geo,
        });
      }
    }

    // Never need more ore robots than it costs to create a robot
    if (
      oreRobots >
      Math.max(
        blueprint.oreRobotCost,
        blueprint.clayRobotCost,
        blueprint.obsRobotCost.ore,
        blueprint.geodeRobotCost.ore,
      )
    ) {
      continue;
    }

    // Never need more clay or obs robots than it costs to build a robot
    if (clayRobots > blueprint.obsRobotCost.clay) continue;
    if (obsRobots > blueprint.geodeRobotCost.obs) continue;

    // If we've had more geodes before than we have now, bail
    const maxGeodesForMinute = maxGeodesPerMinute.get(minute) ?? 0;
    const newGeosCount = geo + geoRobots;
    if (newGeosCount > maxGeodesForMinute) {
      maxGeodesPerMinute.set(minute, geo);
    } else if (newGeosCount < maxGeodesForMinute) {
      continue;
    }

    // Let's get building

    // Geode cracking robots
    if (
      ore >= blueprint.geodeRobotCost.ore &&
      obs >= blueprint.geodeRobotCost.obs
    ) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.geodeRobotCost.ore + oreRobots,
        clay: clay + clayRobots,
        obs: obs - blueprint.geodeRobotCost.obs + obsRobots,
        oreRobots,
        clayRobots,
        obsRobots,
        geoRobots: geoRobots + 1,
        geo: geo + geoRobots,
      });

      // Creating a geode cracking bot is the best thing we can do
      continue;
    }

    // Obs collecting robots
    if (
      ore >= blueprint.obsRobotCost.ore &&
      clay >= blueprint.obsRobotCost.clay
    ) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.obsRobotCost.ore + oreRobots,
        clay: clay - blueprint.obsRobotCost.clay + clayRobots,
        obs: obs + obsRobots,
        oreRobots,
        clayRobots,
        obsRobots: obsRobots + 1,
        geoRobots,
        geo: geo + geoRobots,
      });
    }

    // Ore collecting robots
    if (ore >= blueprint.oreRobotCost) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.oreRobotCost + oreRobots,
        clay: clay + clayRobots,
        obs: obs + obsRobots,
        oreRobots: oreRobots + 1,
        clayRobots,
        obsRobots,
        geoRobots,
        geo: geo + geoRobots,
      });
    }

    // Then build Clay collecting robots
    if (ore >= blueprint.clayRobotCost) {
      queue.push({
        minute: minute + 1,
        ore: ore - blueprint.clayRobotCost + oreRobots,
        clay: clay + clayRobots,
        obs: obs + obsRobots,
        oreRobots,
        clayRobots: clayRobots + 1,
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

function calcMaxGeodesFor(blueprint: Blueprint, time: number): Blueprint {
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
    time,
  );

  blueprint.numGeodes = numGeodes;
  return blueprint;
}

function part1(blueprints: Blueprint[]) {
  const answer = blueprints
    .map((bp) => calcMaxGeodesFor(bp, 24))
    .map((bp) => bp.numGeodes * bp.idx)
    .reduce((acc, bp) => acc + bp, 0);

  return answer;
}

function part2(_blueprints: Blueprint[]) {
  const blueprints = _blueprints.splice(0, 3);

  const answer = blueprints
    .map((bp) => calcMaxGeodesFor(bp, 32))
    .reduce((acc, bp) => acc * bp.numGeodes, 1);

  return answer;
}

solve({ part1, test1: 33, part2, test2: 3472, parser });

export const indicesMatching = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
): number[] => {
  return array.reduce<number[]>((acc, value, idx) => {
    if (predicate(value, idx, array)) {
      acc.push(idx);
    }
    return acc;
  }, []);
};

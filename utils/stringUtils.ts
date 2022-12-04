type Splitter = string | RegExp;

export const duosplit = (
  input: string,
  splitter1: Splitter,
  splitter2: Splitter,
): string[][] => {
  const splitInput = input.split(splitter1);

  return splitInput.map((input) => input.split(splitter2));
};

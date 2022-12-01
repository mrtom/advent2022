export function parseLines(
  opts: { separator: string } = { separator: '\n' },
): (input: string) => string[] {
  const { separator } = opts;
  return (input) => input.split(separator);
}

/* General utilities, not to be confused with rom utilities, located in
 * ./rom/utils.ts */

export function range(
  a: number,
  b: number | undefined = undefined,
  step: number = 1
) {
  const start = b === undefined ? 0 : a;
  const stop = b === undefined ? a : b;
  return Array.from({ length: Math.ceil((stop - start) / step) }).map(
    (_, i) => start + i * step
  );
}

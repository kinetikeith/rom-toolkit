/* General utilities, not to be confused with rom utilities, located in
 * ./rom/utils.ts */

export function parsePath(path: string) {
  return {
    ext: path.match(/\.[0-9a-z]+$/i)?.[0] || "",
  };
}

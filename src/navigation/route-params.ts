/** Normalize expo-router search params that may be string or string[]. */
export function normalizeRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return undefined;
}

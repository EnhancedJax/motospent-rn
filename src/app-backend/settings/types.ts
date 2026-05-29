export type DistanceUnit = 'km' | 'mi';

const DISTANCE_UNITS: DistanceUnit[] = ['km', 'mi'];

export function isDistanceUnit(value: string): value is DistanceUnit {
  return DISTANCE_UNITS.includes(value as DistanceUnit);
}

export function parseDistanceUnit(value: string | null): DistanceUnit | null {
  if (value === null || !isDistanceUnit(value)) {
    return null;
  }
  return value;
}

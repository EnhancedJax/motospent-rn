import type { DistanceUnit as CoreDistanceUnit, VolumeUnit as CoreVolumeUnit } from '@/core/units/types';

export type DistanceUnit = CoreDistanceUnit;
export type VolumeUnit = CoreVolumeUnit;

const DISTANCE_UNITS: DistanceUnit[] = ['km', 'mi'];
const VOLUME_UNITS: VolumeUnit[] = ['L', 'gal'];

export function isDistanceUnit(value: string): value is DistanceUnit {
  return DISTANCE_UNITS.includes(value as DistanceUnit);
}

export function parseDistanceUnit(value: string | null): DistanceUnit | null {
  if (value === null || !isDistanceUnit(value)) {
    return null;
  }
  return value;
}

export function isVolumeUnit(value: string): value is VolumeUnit {
  return VOLUME_UNITS.includes(value as VolumeUnit);
}

export function parseVolumeUnit(value: string | null): VolumeUnit | null {
  if (value === null || !isVolumeUnit(value)) {
    return null;
  }
  return value;
}

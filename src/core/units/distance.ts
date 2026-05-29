import type { DistanceUnit } from './types';

export const KM_PER_MILE = 1.609344;

export function kmToMi(km: number): number {
  return km / KM_PER_MILE;
}

export function miToKm(mi: number): number {
  return mi * KM_PER_MILE;
}

export function toStorageKm(value: number, unit: DistanceUnit): number {
  return unit === 'mi' ? miToKm(value) : value;
}

export function fromStorageKm(km: number, unit: DistanceUnit): number {
  return unit === 'mi' ? kmToMi(km) : km;
}

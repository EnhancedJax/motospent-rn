import { fromStorageKm } from './distance';
import type { DistanceUnit } from './types';

export function formatDistance(km: number, unit: DistanceUnit): string {
  const value = fromStorageKm(km, unit);
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: unit === 'mi' ? 1 : 0,
  }).format(value);
  const suffix = unit === 'mi' ? 'mi' : 'km';
  return `${formatted} ${suffix}`;
}

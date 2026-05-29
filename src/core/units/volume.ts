import type { VolumeUnit } from './types';

export const LITERS_PER_US_GALLON = 3.785411784;

export function litersToUsGallons(liters: number): number {
  return liters / LITERS_PER_US_GALLON;
}

export function usGallonsToLiters(gallons: number): number {
  return gallons * LITERS_PER_US_GALLON;
}

export function toStorageLiters(value: number, unit: VolumeUnit): number {
  return unit === 'gal' ? usGallonsToLiters(value) : value;
}

export function fromStorageLiters(liters: number, unit: VolumeUnit): number {
  return unit === 'gal' ? litersToUsGallons(liters) : liters;
}

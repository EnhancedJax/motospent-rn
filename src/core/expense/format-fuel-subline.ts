import { fromStorageLiters } from '@/core/units/volume';
import type { VolumeUnit } from '@/core/units/types';

import { formatCurrency } from './format-currency';

export function formatFuelSubline(
  cost: number,
  fuelAmountLiters: number,
  volumeUnit: VolumeUnit,
): string {
  const amount = fromStorageLiters(fuelAmountLiters, volumeUnit);
  const unitLabel = volumeUnit === 'gal' ? 'gal' : 'L';
  const formattedAmount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(amount);

  if (amount <= 0) {
    return '';
  }

  const costPerUnit = cost / amount;
  return `${formattedAmount} ${unitLabel} @ ${formatCurrency(costPerUnit)} per ${unitLabel}`;
}

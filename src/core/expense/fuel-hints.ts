import type { ExpenseDTO } from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import { fromStorageLiters } from '@/core/units/volume';
import type { DistanceUnit, VolumeUnit } from '@/core/units/types';

import { formatCurrency } from './format-currency';

function isBeforeTimeline(a: ExpenseDTO, b: { date: number; createdAt: number }): boolean {
  if (a.date !== b.date) {
    return a.date < b.date;
  }
  return a.createdAt < b.createdAt;
}

export function findPriorFuelExpense(
  expenses: ExpenseDTO[],
  fuelItemId: string,
  candidate: { date: number; createdAt: number; expenseId?: string },
): ExpenseDTO | null {
  let prior: ExpenseDTO | null = null;

  for (const expense of expenses) {
    if (expense.id === candidate.expenseId) {
      continue;
    }
    if (expense.listedItemId !== fuelItemId) {
      continue;
    }
    if (!isBeforeTimeline(expense, candidate)) {
      continue;
    }
    if (
      !prior ||
      expense.date > prior.date ||
      (expense.date === prior.date && expense.createdAt > prior.createdAt)
    ) {
      prior = expense;
    }
  }

  return prior;
}

export function computeFuelHints(params: {
  cost: number;
  fuelAmount?: number;
  odometer?: number;
  priorFuelExpense: ExpenseDTO | null;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
}): string[] {
  const hints: string[] = [];
  const { cost, fuelAmount, odometer, priorFuelExpense, distanceUnit, volumeUnit } = params;

  if (fuelAmount !== undefined && fuelAmount > 0) {
    const costPerVolume = cost / fuelAmount;
    const unitLabel = volumeUnit === 'gal' ? 'gal' : 'L';
    hints.push(`${formatCurrency(costPerVolume)} per ${unitLabel}`);
  }

  if (
    priorFuelExpense &&
    odometer !== undefined &&
    odometer > fromStorageKm(priorFuelExpense.odometerKm, distanceUnit)
  ) {
    const distance = odometer - fromStorageKm(priorFuelExpense.odometerKm, distanceUnit);
    if (distance > 0 && cost >= 0) {
      const costPerDistance = cost / distance;
      const distLabel = distanceUnit === 'mi' ? 'mi' : 'km';
      hints.push(`${formatCurrency(costPerDistance)} per ${distLabel}`);
    }
  } else if (fuelAmount !== undefined && fuelAmount > 0) {
    if (!priorFuelExpense) {
      hints.push('Add a prior fuel fill to see cost per distance.');
    } else if (odometer === undefined || odometer <= fromStorageKm(priorFuelExpense.odometerKm, distanceUnit)) {
      hints.push('Enter a higher odometer than your last fuel fill for cost per distance.');
    }
  }

  return hints;
}

export function formatFuelAmountForDisplay(
  fuelAmountLiters: number | undefined,
  volumeUnit: VolumeUnit,
): string {
  if (fuelAmountLiters === undefined) {
    return '';
  }
  const amount = fromStorageLiters(fuelAmountLiters, volumeUnit);
  return String(amount);
}

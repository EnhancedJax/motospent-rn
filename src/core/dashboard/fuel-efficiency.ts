import type { ExpenseDTO } from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import { fromStorageLiters } from '@/core/units/volume';
import type { DistanceUnit, VolumeUnit } from '@/core/units/types';

import { compareExpensesChronological, isFuelExpense } from './expense-filters';
import type { FuelEfficiencyResult, FuelInterval } from './types';

function buildFuelIntervals(
  fuelExpenses: ExpenseDTO[],
  distanceUnit: DistanceUnit,
  volumeUnit: VolumeUnit,
): FuelInterval[] {
  const intervals: FuelInterval[] = [];

  for (let i = 1; i < fuelExpenses.length; i++) {
    const current = fuelExpenses[i];
    const prior = fuelExpenses[i - 1];

    const currentOdometer = fromStorageKm(current.odometerKm, distanceUnit);
    const priorOdometer = fromStorageKm(prior.odometerKm, distanceUnit);
    const distance = currentOdometer - priorOdometer;

    const volume =
      current.fuelAmountLiters !== undefined
        ? fromStorageLiters(current.fuelAmountLiters, volumeUnit)
        : 0;

    if (distance <= 0 || volume <= 0) {
      continue;
    }

    intervals.push({
      distance,
      volume,
      cost: current.cost,
      distancePerVolume: distance / volume,
      costPerDistance: current.cost / distance,
    });
  }

  return intervals;
}

function aggregateMetric(values: number[]): { avg: number; min: number; max: number } {
  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    avg: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function computeFuelEfficiency(params: {
  expenses: ExpenseDTO[];
  fuelItemId: string | undefined;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
}): FuelEfficiencyResult {
  const { expenses, fuelItemId, distanceUnit, volumeUnit } = params;

  if (!fuelItemId) {
    return { kind: 'empty' };
  }

  const fuelExpenses = expenses
    .filter(
      (e) =>
        isFuelExpense(e, fuelItemId) &&
        e.fuelAmountLiters !== undefined &&
        e.fuelAmountLiters > 0 &&
        e.odometerKm >= 0,
    )
    .sort(compareExpensesChronological);

  const intervals = buildFuelIntervals(fuelExpenses, distanceUnit, volumeUnit);

  if (intervals.length < 2) {
    return { kind: 'empty' };
  }

  return {
    kind: 'data',
    intervalCount: intervals.length,
    distancePerVolume: aggregateMetric(intervals.map((i) => i.distancePerVolume)),
    costPerDistance: aggregateMetric(intervals.map((i) => i.costPerDistance)),
  };
}

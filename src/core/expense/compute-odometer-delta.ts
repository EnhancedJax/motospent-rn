import type { ExpenseDTO } from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import type { DistanceUnit } from '@/core/units/types';

import { getExpenseTypeKey } from './expense-type-key';

export type OdometerDelta = {
  delta: number;
  direction: 'up' | 'down' | 'none';
};

/**
 * Computes odometer delta vs the previous expense of the same type on this bike.
 * Expenses should be sorted newest-first (date desc, created_at desc).
 */
export function computeOdometerDeltaForExpense(
  expense: ExpenseDTO,
  allExpensesNewestFirst: ExpenseDTO[],
  distanceUnit: DistanceUnit,
): OdometerDelta | null {
  const typeKey = getExpenseTypeKey(expense);
  const expenseIndex = allExpensesNewestFirst.findIndex((e) => e.id === expense.id);
  if (expenseIndex < 0) {
    return null;
  }

  const olderExpenses = allExpensesNewestFirst.slice(expenseIndex + 1);
  const previousSameType = olderExpenses.find((e) => getExpenseTypeKey(e) === typeKey);
  if (!previousSameType) {
    return null;
  }

  const current = fromStorageKm(expense.odometerKm, distanceUnit);
  const previous = fromStorageKm(previousSameType.odometerKm, distanceUnit);
  const delta = current - previous;

  if (delta === 0) {
    return { delta: 0, direction: 'none' };
  }

  return {
    delta,
    direction: delta > 0 ? 'up' : 'down',
  };
}

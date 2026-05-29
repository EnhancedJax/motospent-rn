import { ODOMETER_LOG_ITEM } from '@/constants/expense';
import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

export function isOdometerLogExpense(expense: ExpenseDTO): boolean {
  return expense.item === ODOMETER_LOG_ITEM;
}

export function isAnalyticsExpense(expense: ExpenseDTO): boolean {
  return !isOdometerLogExpense(expense);
}

export function isMaintenanceRecencyExpense(
  expense: ExpenseDTO,
  catalogById: Map<string, StandardExpenseItemDTO>,
): boolean {
  if (!expense.listedItemId || isOdometerLogExpense(expense)) {
    return false;
  }
  const catalogItem = catalogById.get(expense.listedItemId);
  return catalogItem?.countsTowardMaintenanceRecency === true;
}

export function isFuelExpense(expense: ExpenseDTO, fuelItemId: string | undefined): boolean {
  return fuelItemId !== undefined && expense.listedItemId === fuelItemId;
}

export function compareExpensesChronological(a: ExpenseDTO, b: ExpenseDTO): number {
  if (a.date !== b.date) {
    return a.date - b.date;
  }
  return a.createdAt - b.createdAt;
}

export function compareExpensesNewestFirst(a: ExpenseDTO, b: ExpenseDTO): number {
  if (a.date !== b.date) {
    return b.date - a.date;
  }
  return b.createdAt - a.createdAt;
}

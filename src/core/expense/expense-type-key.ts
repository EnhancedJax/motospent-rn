import type { ExpenseDTO } from '@/core/database/types';

export function getExpenseTypeKey(expense: ExpenseDTO): string {
  return expense.listedItemId ?? `custom:${expense.item}`;
}

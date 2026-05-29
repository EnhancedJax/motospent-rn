import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

import { resolveExpenseDisplay } from '../expense/expense-display';

export type ExpenseCategory = {
  key: string;
  label: string;
  iconKey: string | null;
};

export function getExpenseCategory(
  expense: ExpenseDTO,
  catalogById: Map<string, StandardExpenseItemDTO>,
): ExpenseCategory {
  const display = resolveExpenseDisplay(expense, catalogById);
  const key = expense.listedItemId ?? `custom:${expense.item}`;
  return {
    key,
    label: display.label,
    iconKey: display.iconKey,
  };
}

export function discoverCategories(
  expenses: ExpenseDTO[],
  catalogById: Map<string, StandardExpenseItemDTO>,
): ExpenseCategory[] {
  const seen = new Map<string, ExpenseCategory>();
  for (const expense of expenses) {
    const category = getExpenseCategory(expense, catalogById);
    if (!seen.has(category.key)) {
      seen.set(category.key, category);
    }
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export const ALL_CATEGORIES_KEY = '__all__';

export function resolveDefaultCategoryKey(
  categories: ExpenseCategory[],
  fuelItemId: string | undefined,
  catalogById: Map<string, StandardExpenseItemDTO>,
): string {
  if (categories.length === 0) {
    return ALL_CATEGORIES_KEY;
  }
  if (fuelItemId) {
    const fuelCategory = categories.find((c) => c.key === fuelItemId);
    if (fuelCategory) {
      return fuelCategory.key;
    }
    const fuelName = catalogById.get(fuelItemId)?.name;
    if (fuelName) {
      const byName = categories.find((c) => c.label === fuelName);
      if (byName) {
        return byName.key;
      }
    }
  }
  return categories[0]?.key ?? ALL_CATEGORIES_KEY;
}

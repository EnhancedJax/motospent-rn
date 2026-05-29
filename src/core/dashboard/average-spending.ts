import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

import {
  ALL_CATEGORIES_KEY,
  discoverCategories,
  getExpenseCategory,
  resolveDefaultCategoryKey,
} from './category-label';
import { isAnalyticsExpense } from './expense-filters';
import { startOfMonth, startOfWeekMonday } from './period-buckets';
import type { AverageSpendingPeriod, AverageSpendingResult } from './types';

function bucketExpenses(
  expenses: ExpenseDTO[],
  period: AverageSpendingPeriod,
): Map<number, number> {
  const buckets = new Map<number, number>();

  for (const expense of expenses) {
    const bucketKey =
      period === 'week'
        ? startOfWeekMonday(expense.date)
        : startOfMonth(expense.date);
    buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + expense.cost);
  }

  return buckets;
}

export function computeAverageSpending(params: {
  expenses: ExpenseDTO[];
  catalogById: Map<string, StandardExpenseItemDTO>;
  fuelItemId: string | undefined;
  period: AverageSpendingPeriod;
  categoryKey: string;
}): AverageSpendingResult {
  const { expenses, catalogById, fuelItemId, period, categoryKey } = params;

  const analyticsExpenses = expenses.filter(isAnalyticsExpense);
  const categories = discoverCategories(analyticsExpenses, catalogById);
  const defaultCategory = resolveDefaultCategoryKey(categories, fuelItemId, catalogById);

  const effectiveCategoryKey =
    categoryKey === '' ? defaultCategory : categoryKey;

  const filtered =
    effectiveCategoryKey === ALL_CATEGORIES_KEY
      ? analyticsExpenses
      : analyticsExpenses.filter(
          (e) => getExpenseCategory(e, catalogById).key === effectiveCategoryKey,
        );

  const buckets = bucketExpenses(filtered, period);
  const totals = [...buckets.values()];

  if (totals.length === 0) {
    return {
      categories: [ALL_CATEGORIES_KEY, ...categories.map((c) => c.key)],
      defaultCategory,
      average: 0,
      min: null,
      max: null,
      periodCount: 0,
      periodLabel: period === 'week' ? 'weeks' : 'months',
    };
  }

  const sum = totals.reduce((acc, v) => acc + v, 0);

  return {
    categories: [ALL_CATEGORIES_KEY, ...categories.map((c) => c.key)],
    defaultCategory,
    average: sum / totals.length,
    min: totals.length > 1 ? Math.min(...totals) : null,
    max: totals.length > 1 ? Math.max(...totals) : null,
    periodCount: totals.length,
    periodLabel: period === 'week' ? 'weeks' : 'months',
  };
}

export function getCategoryLabel(
  categoryKey: string,
  expenses: ExpenseDTO[],
  catalogById: Map<string, StandardExpenseItemDTO>,
): string {
  if (categoryKey === ALL_CATEGORIES_KEY) {
    return 'All categories';
  }
  const categories = discoverCategories(expenses.filter(isAnalyticsExpense), catalogById);
  return categories.find((c) => c.key === categoryKey)?.label ?? categoryKey;
}

import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

/**
 * Sorts catalog items by how often they appear in the most recent expenses
 * (listed items only). Ties and unused items fall back to alphabetical order.
 */
export function sortCatalogByUsageFrequency(
  catalogItems: StandardExpenseItemDTO[],
  recentExpenses: ExpenseDTO[],
  limit = 20,
): StandardExpenseItemDTO[] {
  const counts = new Map<string, number>();

  for (const expense of recentExpenses.slice(0, limit)) {
    if (!expense.listedItemId) {
      continue;
    }
    counts.set(expense.listedItemId, (counts.get(expense.listedItemId) ?? 0) + 1);
  }

  return [...catalogItems].sort((a, b) => {
    const countDiff = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return a.name.localeCompare(b.name);
  });
}

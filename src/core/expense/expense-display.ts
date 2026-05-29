import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

import { FUEL_ITEM_NAME } from '@/constants/expense';

export function resolveExpenseDisplay(
  expense: ExpenseDTO,
  catalogById: Map<string, StandardExpenseItemDTO>,
): { label: string; iconKey: string | null; isFuel: boolean } {
  if (expense.listedItemId) {
    const catalogItem = catalogById.get(expense.listedItemId);
    if (catalogItem) {
      return {
        label: catalogItem.name,
        iconKey: catalogItem.iconKey,
        isFuel: catalogItem.name === FUEL_ITEM_NAME,
      };
    }
  }

  return {
    label: expense.item,
    iconKey: null,
    isFuel: false,
  };
}

export function findFuelItemId(items: StandardExpenseItemDTO[]): string | undefined {
  return items.find((item) => item.name === FUEL_ITEM_NAME)?.id;
}

export function buildCatalogMap(
  items: StandardExpenseItemDTO[],
): Map<string, StandardExpenseItemDTO> {
  return new Map(items.map((item) => [item.id, item]));
}

import { database } from '../database';
import StandardExpenseItem from '../models/StandardExpenseItem';
import type { StandardExpenseItemSeed } from '../seed/standard-expense-item-seeds';

export const standardExpenseItemsRepository = {
  async count(): Promise<number> {
    return database.get<StandardExpenseItem>('standard_expense_items').query().fetchCount();
  },

  async seed(items: StandardExpenseItemSeed[]): Promise<void> {
    await database.write(async () => {
      const collection = database.get<StandardExpenseItem>('standard_expense_items');
      const now = Date.now();
      const records = items.map((item) =>
        collection.prepareCreate((record) => {
          record.name = item.name;
          record.iconKey = item.iconKey;
          record.suggestDistanceKm = item.suggestDistanceKm;
          record.countsTowardMaintenanceRecency = item.countsTowardMaintenanceRecency;
          record.createdAt = now;
          record.updatedAt = now;
        }),
      );
      await database.batch(...records);
    });
  },
};

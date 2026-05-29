import { Q } from '@nozbe/watermelondb';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { database } from '../database';
import StandardExpenseItem from '../models/StandardExpenseItem';
import { notDeleted } from '../query/not-deleted';
import type { StandardExpenseItemDTO } from '../types';
import type { StandardExpenseItemSeed } from '../seed/standard-expense-item-seeds';

function toDTO(item: StandardExpenseItem): StandardExpenseItemDTO {
  return {
    id: item.id,
    name: item.name,
    iconKey: item.iconKey,
    suggestDistanceKm: item.suggestDistanceKm,
    countsTowardMaintenanceRecency: item.countsTowardMaintenanceRecency,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const standardExpenseItemsRepository = {
  async findById(id: string): Promise<StandardExpenseItemDTO | null> {
    try {
      const item = await database.get<StandardExpenseItem>('standard_expense_items').find(id);
      if (item.deletedAt != null) {
        return null;
      }
      return toDTO(item);
    } catch {
      return null;
    }
  },

  async findAll(): Promise<StandardExpenseItemDTO[]> {
    const items = await database
      .get<StandardExpenseItem>('standard_expense_items')
      .query(notDeleted, Q.sortBy('name', Q.asc))
      .fetch();
    return items.map(toDTO);
  },

  observeAll(): Observable<StandardExpenseItemDTO[]> {
    return database
      .get<StandardExpenseItem>('standard_expense_items')
      .query(notDeleted, Q.sortBy('name', Q.asc))
      .observe()
      .pipe(map((records) => records.map(toDTO)));
  },

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

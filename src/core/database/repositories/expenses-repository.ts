import { Q } from '@nozbe/watermelondb';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { database } from '../database';
import Expense from '../models/Expense';
import Motorcycle from '../models/Motorcycle';
import StandardExpenseItem from '../models/StandardExpenseItem';
import { notDeleted } from '../query/not-deleted';
import type {
  CreateExpenseRepositoryInput,
  ExpenseDTO,
  UpdateExpenseRepositoryInput,
} from '../types';

function toDTO(expense: Expense): ExpenseDTO {
  return {
    id: expense.id,
    motorcycleId: expense.motorcycleId,
    listedItemId: expense.listedItemId,
    item: expense.item,
    cost: expense.cost,
    odometerKm: expense.odometerKm,
    date: expense.date,
    fuelAmountLiters: expense.fuelAmountLiters,
    notes: expense.notes,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

function motorcycleQuery(motorcycleId: string) {
  return [Q.where('motorcycle_id', motorcycleId), notDeleted] as const;
}

export const expensesRepository = {
  async findById(id: string): Promise<ExpenseDTO | null> {
    try {
      const expense = await database.get<Expense>('expenses').find(id);
      if (expense.deletedAt != null) {
        return null;
      }
      return toDTO(expense);
    } catch {
      return null;
    }
  },

  async findByMotorcycleId(motorcycleId: string): Promise<ExpenseDTO[]> {
    const expenses = await database
      .get<Expense>('expenses')
      .query(
        ...motorcycleQuery(motorcycleId),
        Q.sortBy('date', Q.desc),
        Q.sortBy('created_at', Q.desc),
      )
      .fetch();
    return expenses.map(toDTO);
  },

  observeByMotorcycleId(motorcycleId: string): Observable<ExpenseDTO[]> {
    return database
      .get<Expense>('expenses')
      .query(
        ...motorcycleQuery(motorcycleId),
        Q.sortBy('date', Q.desc),
        Q.sortBy('created_at', Q.desc),
      )
      .observe()
      .pipe(map((records) => records.map(toDTO)));
  },

  async findLatestByMotorcycleId(motorcycleId: string): Promise<ExpenseDTO | null> {
    const expenses = await database
      .get<Expense>('expenses')
      .query(
        ...motorcycleQuery(motorcycleId),
        Q.sortBy('date', Q.desc),
        Q.sortBy('created_at', Q.desc),
        Q.take(1),
      )
      .fetch();
    return expenses[0] ? toDTO(expenses[0]) : null;
  },

  async findAllForMotorcycleSorted(motorcycleId: string): Promise<ExpenseDTO[]> {
    const expenses = await database
      .get<Expense>('expenses')
      .query(
        ...motorcycleQuery(motorcycleId),
        Q.sortBy('date', Q.asc),
        Q.sortBy('created_at', Q.asc),
      )
      .fetch();
    return expenses.map(toDTO);
  },

  async create(input: CreateExpenseRepositoryInput): Promise<ExpenseDTO> {
    const now = Date.now();
    let created: Expense | undefined;

    await database.write(async () => {
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(input.motorcycleId);
      let listedItem: StandardExpenseItem | undefined;
      if (input.listedItemId) {
        listedItem = await database
          .get<StandardExpenseItem>('standard_expense_items')
          .find(input.listedItemId);
      }

      created = await database.get<Expense>('expenses').create((record) => {
        record.motorcycle.set(motorcycle);
        if (listedItem && record.listedItem) {
          record.listedItem.set(listedItem);
        }
        record.item = input.item;
        record.cost = input.cost;
        record.odometerKm = input.odometerKm;
        record.date = input.date;
        record.fuelAmountLiters = input.fuelAmountLiters;
        record.notes = input.notes;
        record.createdAt = now;
        record.updatedAt = now;
      });
    });

    return toDTO(created!);
  },

  async update(id: string, input: UpdateExpenseRepositoryInput): Promise<ExpenseDTO> {
    const now = Date.now();
    let updated: Expense | undefined;

    await database.write(async () => {
      const expense = await database.get<Expense>('expenses').find(id);
      const motorcycle = input.motorcycleId
        ? await database.get<Motorcycle>('motorcycles').find(input.motorcycleId)
        : undefined;
      const listedItem =
        input.listedItemId !== undefined && input.listedItemId
          ? await database
              .get<StandardExpenseItem>('standard_expense_items')
              .find(input.listedItemId)
          : undefined;

      updated = await expense.update((record) => {
        if (motorcycle) {
          record.motorcycle.set(motorcycle);
        }
        if (input.listedItemId !== undefined) {
          if (listedItem && record.listedItem) {
            record.listedItem.set(listedItem);
          } else {
            record.listedItemId = undefined;
          }
        }
        if (input.item !== undefined) record.item = input.item;
        if (input.cost !== undefined) record.cost = input.cost;
        if (input.odometerKm !== undefined) record.odometerKm = input.odometerKm;
        if (input.date !== undefined) record.date = input.date;
        if (input.fuelAmountLiters !== undefined) record.fuelAmountLiters = input.fuelAmountLiters;
        if (input.notes !== undefined) record.notes = input.notes;
        record.updatedAt = now;
      });
    });

    return toDTO(updated!);
  },

  async softDelete(id: string): Promise<void> {
    const now = Date.now();
    await database.write(async () => {
      const expense = await database.get<Expense>('expenses').find(id);
      await expense.update((record) => {
        record.deletedAt = now;
        record.updatedAt = now;
      });
    });
  },
};

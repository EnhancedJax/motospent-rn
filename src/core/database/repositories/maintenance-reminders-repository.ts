import { Q } from '@nozbe/watermelondb';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { database } from '../database';
import MaintenanceReminder from '../models/MaintenanceReminder';
import Motorcycle from '../models/Motorcycle';
import StandardExpenseItem from '../models/StandardExpenseItem';
import { notDeleted } from '../query/not-deleted';
import type {
  CreateMaintenanceReminderRepositoryInput,
  MaintenanceReminderDTO,
  UpdateMaintenanceReminderRepositoryInput,
} from '../types';

function toDTO(reminder: MaintenanceReminder): MaintenanceReminderDTO {
  return {
    id: reminder.id,
    motorcycleId: reminder.motorcycleId,
    standardItemId: reminder.standardItemId,
    intervalDistanceKm: reminder.intervalDistanceKm,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt,
  };
}

function motorcycleQuery(motorcycleId: string) {
  return [Q.where('motorcycle_id', motorcycleId), notDeleted] as const;
}

export const maintenanceRemindersRepository = {
  async findById(id: string): Promise<MaintenanceReminderDTO | null> {
    try {
      const reminder = await database.get<MaintenanceReminder>('maintenance_reminders').find(id);
      if (reminder.deletedAt != null) {
        return null;
      }
      return toDTO(reminder);
    } catch {
      return null;
    }
  },

  async findByMotorcycleId(motorcycleId: string): Promise<MaintenanceReminderDTO[]> {
    const reminders = await database
      .get<MaintenanceReminder>('maintenance_reminders')
      .query(...motorcycleQuery(motorcycleId))
      .fetch();
    return reminders.map(toDTO);
  },

  observeByMotorcycleId(motorcycleId: string): Observable<MaintenanceReminderDTO[]> {
    return database
      .get<MaintenanceReminder>('maintenance_reminders')
      .query(...motorcycleQuery(motorcycleId))
      .observe()
      .pipe(map((records) => records.map(toDTO)));
  },

  async findByMotorcycleAndStandardItem(
    motorcycleId: string,
    standardItemId: string,
  ): Promise<MaintenanceReminderDTO | null> {
    const reminders = await database
      .get<MaintenanceReminder>('maintenance_reminders')
      .query(
        Q.where('motorcycle_id', motorcycleId),
        Q.where('standard_item_id', standardItemId),
        notDeleted,
        Q.take(1),
      )
      .fetch();
    return reminders[0] ? toDTO(reminders[0]) : null;
  },

  async create(input: CreateMaintenanceReminderRepositoryInput): Promise<MaintenanceReminderDTO> {
    const now = Date.now();
    let created: MaintenanceReminder | undefined;

    await database.write(async () => {
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(input.motorcycleId);
      const standardItem = await database
        .get<StandardExpenseItem>('standard_expense_items')
        .find(input.standardItemId);

      created = await database.get<MaintenanceReminder>('maintenance_reminders').create((record) => {
        record.motorcycle.set(motorcycle);
        record.standardItem.set(standardItem);
        record.intervalDistanceKm = input.intervalDistanceKm;
        record.createdAt = now;
        record.updatedAt = now;
      });
    });

    return toDTO(created!);
  },

  async update(
    id: string,
    input: UpdateMaintenanceReminderRepositoryInput,
  ): Promise<MaintenanceReminderDTO> {
    const now = Date.now();
    let updated: MaintenanceReminder | undefined;

    await database.write(async () => {
      const reminder = await database.get<MaintenanceReminder>('maintenance_reminders').find(id);
      updated = await reminder.update((record) => {
        record.intervalDistanceKm = input.intervalDistanceKm;
        record.updatedAt = now;
      });
    });

    return toDTO(updated!);
  },

  async softDelete(id: string): Promise<void> {
    const now = Date.now();
    await database.write(async () => {
      const reminder = await database.get<MaintenanceReminder>('maintenance_reminders').find(id);
      await reminder.update((record) => {
        record.deletedAt = now;
        record.updatedAt = now;
      });
    });
  },
};

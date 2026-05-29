import type { Observable } from '@nozbe/watermelondb/utils/rx';

import { maintenanceRemindersRepository } from '@/core/database/repositories/maintenance-reminders-repository';
import { motorcyclesRepository } from '@/core/database/repositories/motorcycles-repository';
import { standardExpenseItemsRepository } from '@/core/database/repositories/standard-expense-items-repository';
import type { MaintenanceReminderDTO } from '@/core/database/types';
import { toStorageKm } from '@/core/units/distance';

import { EntityNotFoundError } from '../errors/domain-errors';
import { settingsService } from '../settings/settings-service';
import type { UpsertMaintenanceReminderInput } from './types';

async function requireDistanceUnit() {
  return (await settingsService.getDistanceUnit()) ?? 'km';
}

export const maintenanceRemindersService = {
  async getById(id: string): Promise<MaintenanceReminderDTO | null> {
    return maintenanceRemindersRepository.findById(id);
  },

  async listByMotorcycle(motorcycleId: string): Promise<MaintenanceReminderDTO[]> {
    return maintenanceRemindersRepository.findByMotorcycleId(motorcycleId);
  },

  observeByMotorcycle(motorcycleId: string): Observable<MaintenanceReminderDTO[]> {
    return maintenanceRemindersRepository.observeByMotorcycleId(motorcycleId);
  },

  async upsert(input: UpsertMaintenanceReminderInput): Promise<MaintenanceReminderDTO> {
    const motorcycle = await motorcyclesRepository.findById(input.motorcycleId);
    if (!motorcycle) {
      throw new EntityNotFoundError('Motorcycle', input.motorcycleId);
    }

    const standardItem = await standardExpenseItemsRepository.findById(input.standardItemId);
    if (!standardItem) {
      throw new EntityNotFoundError('StandardExpenseItem', input.standardItemId);
    }

    const distanceUnit = await requireDistanceUnit();
    const intervalDistanceKm = toStorageKm(input.intervalDistance, distanceUnit);

    const existing = await maintenanceRemindersRepository.findByMotorcycleAndStandardItem(
      input.motorcycleId,
      input.standardItemId,
    );

    if (existing) {
      return maintenanceRemindersRepository.update(existing.id, { intervalDistanceKm });
    }

    return maintenanceRemindersRepository.create({
      motorcycleId: input.motorcycleId,
      standardItemId: input.standardItemId,
      intervalDistanceKm,
    });
  },

  async delete(id: string): Promise<void> {
    const existing = await maintenanceRemindersRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('MaintenanceReminder', id);
    }
    await maintenanceRemindersRepository.softDelete(id);
  },
};

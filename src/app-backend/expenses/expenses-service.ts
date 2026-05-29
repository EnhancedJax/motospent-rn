import type { Observable } from '@nozbe/watermelondb/utils/rx';

import { expensesRepository } from '@/core/database/repositories/expenses-repository';
import { motorcyclesRepository } from '@/core/database/repositories/motorcycles-repository';
import type { ExpenseDTO } from '@/core/database/types';
import { fromStorageKm, toStorageKm } from '@/core/units/distance';
import { toStorageLiters } from '@/core/units/volume';

import { EntityNotFoundError } from '../errors/domain-errors';
import { odometerEngine } from '../odometer/odometer-engine';
import { settingsService } from '../settings/settings-service';
import type { CreateExpenseInput, UpdateExpenseInput } from './types';

async function requireDistanceUnit() {
  return (await settingsService.getDistanceUnit()) ?? 'km';
}

async function requireVolumeUnit() {
  return (await settingsService.getVolumeUnit()) ?? 'L';
}

export const expensesService = {
  async getById(id: string): Promise<ExpenseDTO | null> {
    return expensesRepository.findById(id);
  },

  async listByMotorcycle(motorcycleId: string): Promise<ExpenseDTO[]> {
    return expensesRepository.findByMotorcycleId(motorcycleId);
  },

  observeByMotorcycle(motorcycleId: string): Observable<ExpenseDTO[]> {
    return expensesRepository.observeByMotorcycleId(motorcycleId);
  },

  async getLatestOdometerKm(motorcycleId: string): Promise<number> {
    return odometerEngine.getLatestOdometerKm(motorcycleId);
  },

  async getLatestOdometer(motorcycleId: string): Promise<number> {
    const km = await odometerEngine.getLatestOdometerKm(motorcycleId);
    const distanceUnit = await requireDistanceUnit();
    return fromStorageKm(km, distanceUnit);
  },

  async getOdometerBounds(params: {
    motorcycleId: string;
    date: number;
    expenseId?: string;
    currentOdometer?: number;
  }): Promise<{ min: number; max: number | null; suggested: number }> {
    const distanceUnit = await requireDistanceUnit();
    const currentOdometerKm =
      params.currentOdometer !== undefined
        ? toStorageKm(params.currentOdometer, distanceUnit)
        : undefined;

    const bounds = await odometerEngine.getOdometerBoundsForExpense({
      motorcycleId: params.motorcycleId,
      date: params.date,
      expenseId: params.expenseId,
      currentOdometerKm,
    });

    return {
      min: fromStorageKm(bounds.minKm, distanceUnit),
      max: bounds.maxKm !== null ? fromStorageKm(bounds.maxKm, distanceUnit) : null,
      suggested: fromStorageKm(bounds.suggestedKm, distanceUnit),
    };
  },

  async create(input: CreateExpenseInput): Promise<ExpenseDTO> {
    const motorcycle = await motorcyclesRepository.findById(input.motorcycleId);
    if (!motorcycle) {
      throw new EntityNotFoundError('Motorcycle', input.motorcycleId);
    }

    const distanceUnit = await requireDistanceUnit();
    const volumeUnit = await requireVolumeUnit();
    const odometerKm = toStorageKm(input.odometer, distanceUnit);
    const fuelAmountLiters =
      input.fuelAmount !== undefined ? toStorageLiters(input.fuelAmount, volumeUnit) : undefined;

    await odometerEngine.validateOdometerForExpense({
      motorcycleId: input.motorcycleId,
      date: input.date,
      odometerKm,
    });

    return expensesRepository.create({
      motorcycleId: input.motorcycleId,
      listedItemId: input.listedItemId,
      item: input.item,
      cost: input.cost,
      odometerKm,
      date: input.date,
      fuelAmountLiters,
      notes: input.notes,
    });
  },

  async update(id: string, input: UpdateExpenseInput): Promise<ExpenseDTO> {
    const existing = await expensesRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Expense', id);
    }

    const distanceUnit = await requireDistanceUnit();
    const volumeUnit = await requireVolumeUnit();

    const motorcycleId = input.motorcycleId ?? existing.motorcycleId;
    const date = input.date ?? existing.date;
    const odometerKm =
      input.odometer !== undefined
        ? toStorageKm(input.odometer, distanceUnit)
        : existing.odometerKm;

    if (input.motorcycleId && input.motorcycleId !== existing.motorcycleId) {
      const motorcycle = await motorcyclesRepository.findById(input.motorcycleId);
      if (!motorcycle) {
        throw new EntityNotFoundError('Motorcycle', input.motorcycleId);
      }
    }

    await odometerEngine.validateOdometerForExpense({
      motorcycleId,
      date,
      odometerKm,
      expenseId: id,
      createdAt: existing.createdAt,
    });

    const repositoryInput: Parameters<typeof expensesRepository.update>[1] = {
      motorcycleId: input.motorcycleId,
      listedItemId: input.listedItemId,
      item: input.item,
      cost: input.cost,
      odometerKm: input.odometer !== undefined ? odometerKm : undefined,
      date: input.date,
      notes: input.notes,
    };

    if (input.fuelAmount !== undefined) {
      repositoryInput.fuelAmountLiters = toStorageLiters(input.fuelAmount, volumeUnit);
    }

    return expensesRepository.update(id, repositoryInput);
  },

  async delete(id: string): Promise<void> {
    const existing = await expensesRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Expense', id);
    }
    await expensesRepository.softDelete(id);
  },
};

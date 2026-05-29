import type { Observable } from '@nozbe/watermelondb/utils/rx';

import { toStorageKm } from '@/core/units/distance';
import { motorcyclesRepository } from '@/core/database/repositories/motorcycles-repository';
import type { MotorcycleDTO } from '@/core/database/types';

import { EntityNotFoundError } from '../errors/domain-errors';
import { odometerEngine } from '../odometer/odometer-engine';
import { settingsService } from '../settings/settings-service';
import type { CreateMotorcycleInput, UpdateMotorcycleInput } from './types';

async function requireDistanceUnit() {
  return (await settingsService.getDistanceUnit()) ?? 'km';
}

export const motorcyclesService = {
  async getById(id: string): Promise<MotorcycleDTO | null> {
    return motorcyclesRepository.findById(id);
  },

  async list(): Promise<MotorcycleDTO[]> {
    return motorcyclesRepository.findAll();
  },

  observeList(): Observable<MotorcycleDTO[]> {
    return motorcyclesRepository.observeAll();
  },

  async create(input: CreateMotorcycleInput): Promise<MotorcycleDTO> {
    const distanceUnit = await requireDistanceUnit();
    const odometerAtAdditionKm = toStorageKm(input.odometerAtAddition, distanceUnit);

    return motorcyclesRepository.create({
      name: input.name,
      notes: input.notes,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate,
      odometerAtAdditionKm,
      imageUrl: input.imageUrl,
    });
  },

  async update(id: string, input: UpdateMotorcycleInput): Promise<MotorcycleDTO> {
    const existing = await motorcyclesRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Motorcycle', id);
    }

    const distanceUnit = await requireDistanceUnit();
    const repositoryInput: Parameters<typeof motorcyclesRepository.update>[1] = {
      name: input.name,
      notes: input.notes,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate,
      imageUrl: input.imageUrl,
    };

    if (input.odometerAtAddition !== undefined) {
      const odometerAtAdditionKm = toStorageKm(input.odometerAtAddition, distanceUnit);
      await odometerEngine.validateMotorcycleBaseline(id, odometerAtAdditionKm);
      repositoryInput.odometerAtAdditionKm = odometerAtAdditionKm;
    }

    return motorcyclesRepository.update(id, repositoryInput);
  },

  async delete(id: string): Promise<void> {
    const existing = await motorcyclesRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Motorcycle', id);
    }
    await motorcyclesRepository.softDelete(id);
  },
};

import type { Observable } from '@nozbe/watermelondb/utils/rx';

import { motorcyclesRepository } from '@/core/database/repositories/motorcycles-repository';
import type { MotorcycleDTO } from '@/core/database/types';
import { toStorageKm } from '@/core/units/distance';

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

  async getPrimary(): Promise<MotorcycleDTO | null> {
    return motorcyclesRepository.findPrimary();
  },

  async list(): Promise<MotorcycleDTO[]> {
    return motorcyclesRepository.findAll();
  },

  observeList(): Observable<MotorcycleDTO[]> {
    return motorcyclesRepository.observeAll();
  },

  observePrimary(): Observable<MotorcycleDTO | null> {
    return motorcyclesRepository.observePrimary();
  },

  async setPrimary(id: string): Promise<MotorcycleDTO> {
    const existing = await motorcyclesRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Motorcycle', id);
    }
    return motorcyclesRepository.setPrimary(id);
  },

  async create(input: CreateMotorcycleInput): Promise<MotorcycleDTO> {
    const distanceUnit = await requireDistanceUnit();
    const odometerAtAdditionKm = toStorageKm(input.odometerAtAddition, distanceUnit);

    const existing = await motorcyclesRepository.findAll();
    const isFirstMotorcycle = existing.length === 0;
    const isPrimary = input.isPrimary === true || isFirstMotorcycle;

    return motorcyclesRepository.create({
      name: input.name,
      notes: input.notes,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate,
      odometerAtAdditionKm,
      isPrimary,
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

    if (input.isPrimary === false && existing.isPrimary) {
      const others = (await motorcyclesRepository.findAll()).filter((m) => m.id !== id);
      repositoryInput.isPrimary = false;
      const updated = await motorcyclesRepository.update(id, repositoryInput);
      if (others.length > 0) {
        return motorcyclesRepository.setPrimary(others[0].id);
      }
      return updated;
    }

    if (input.isPrimary !== undefined) {
      repositoryInput.isPrimary = input.isPrimary;
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

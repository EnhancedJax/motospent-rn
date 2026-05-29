import { Q } from '@nozbe/watermelondb';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { database } from '../database';
import Motorcycle from '../models/Motorcycle';
import { notDeleted } from '../query/not-deleted';
import type {
  CreateMotorcycleRepositoryInput,
  MotorcycleDTO,
  UpdateMotorcycleRepositoryInput,
} from '../types';

function toDTO(motorcycle: Motorcycle): MotorcycleDTO {
  return {
    id: motorcycle.id,
    name: motorcycle.name,
    notes: motorcycle.notes,
    purchasePrice: motorcycle.purchasePrice,
    purchaseDate: motorcycle.purchaseDate,
    odometerAtAdditionKm: motorcycle.odometerAtAdditionKm,
    isPrimary: motorcycle.isPrimary,
    imageUrl: motorcycle.imageUrl,
    createdAt: motorcycle.createdAt,
    updatedAt: motorcycle.updatedAt,
  };
}

async function clearPrimaryFlags(exceptId?: string): Promise<void> {
  const primaries = await database
    .get<Motorcycle>('motorcycles')
    .query(notDeleted, Q.where('is_primary', true))
    .fetch();

  const now = Date.now();
  for (const motorcycle of primaries) {
    if (motorcycle.id === exceptId) {
      continue;
    }
    await motorcycle.update((record) => {
      record.isPrimary = false;
      record.updatedAt = now;
    });
  }
}

export const motorcyclesRepository = {
  async findById(id: string): Promise<MotorcycleDTO | null> {
    try {
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      if (motorcycle.deletedAt != null) {
        return null;
      }
      return toDTO(motorcycle);
    } catch {
      return null;
    }
  },

  async findPrimary(): Promise<MotorcycleDTO | null> {
    const motorcycles = await database
      .get<Motorcycle>('motorcycles')
      .query(notDeleted, Q.where('is_primary', true), Q.take(1))
      .fetch();
    return motorcycles[0] ? toDTO(motorcycles[0]) : null;
  },

  async findAll(): Promise<MotorcycleDTO[]> {
    const motorcycles = await database
      .get<Motorcycle>('motorcycles')
      .query(notDeleted, Q.sortBy('name', Q.asc))
      .fetch();
    return motorcycles.map(toDTO);
  },

  observeAll(): Observable<MotorcycleDTO[]> {
    return database
      .get<Motorcycle>('motorcycles')
      .query(notDeleted, Q.sortBy('name', Q.asc))
      .observe()
      .pipe(map((records) => records.map(toDTO)));
  },

  observePrimary(): Observable<MotorcycleDTO | null> {
    return database
      .get<Motorcycle>('motorcycles')
      .query(notDeleted, Q.where('is_primary', true), Q.take(1))
      .observe()
      .pipe(map((records) => (records[0] ? toDTO(records[0]) : null)));
  },

  async create(input: CreateMotorcycleRepositoryInput): Promise<MotorcycleDTO> {
    const now = Date.now();
    let created: Motorcycle | undefined;

    await database.write(async () => {
      const shouldBePrimary = input.isPrimary === true;
      if (shouldBePrimary) {
        await clearPrimaryFlags();
      }

      created = await database.get<Motorcycle>('motorcycles').create((record) => {
        record.name = input.name;
        record.notes = input.notes;
        record.purchasePrice = input.purchasePrice;
        record.purchaseDate = input.purchaseDate;
        record.odometerAtAdditionKm = input.odometerAtAdditionKm;
        record.isPrimary = shouldBePrimary;
        record.imageUrl = input.imageUrl;
        record.createdAt = now;
        record.updatedAt = now;
      });
    });

    return toDTO(created!);
  },

  async update(id: string, input: UpdateMotorcycleRepositoryInput): Promise<MotorcycleDTO> {
    const now = Date.now();
    let updated: Motorcycle | undefined;

    await database.write(async () => {
      if (input.isPrimary === true) {
        await clearPrimaryFlags(id);
      }

      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      updated = await motorcycle.update((record) => {
        if (input.name !== undefined) record.name = input.name;
        if (input.notes !== undefined) record.notes = input.notes;
        if (input.purchasePrice !== undefined) record.purchasePrice = input.purchasePrice;
        if (input.purchaseDate !== undefined) record.purchaseDate = input.purchaseDate;
        if (input.odometerAtAdditionKm !== undefined) {
          record.odometerAtAdditionKm = input.odometerAtAdditionKm;
        }
        if (input.isPrimary !== undefined) record.isPrimary = input.isPrimary;
        if (input.imageUrl !== undefined) record.imageUrl = input.imageUrl;
        record.updatedAt = now;
      });
    });

    return toDTO(updated!);
  },

  async setPrimary(id: string): Promise<MotorcycleDTO> {
    const now = Date.now();
    let updated: Motorcycle | undefined;

    await database.write(async () => {
      await clearPrimaryFlags(id);
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      if (motorcycle.deletedAt != null) {
        throw new Error(`Cannot set deleted motorcycle as primary: ${id}`);
      }
      updated = await motorcycle.update((record) => {
        record.isPrimary = true;
        record.updatedAt = now;
      });
    });

    return toDTO(updated!);
  },

  async softDelete(id: string): Promise<void> {
    const now = Date.now();
    await database.write(async () => {
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      const wasPrimary = motorcycle.isPrimary;
      await motorcycle.update((record) => {
        record.deletedAt = now;
        record.isPrimary = false;
        record.updatedAt = now;
      });

      if (wasPrimary) {
        const remaining = await database
          .get<Motorcycle>('motorcycles')
          .query(notDeleted, Q.sortBy('created_at', Q.asc), Q.take(1))
          .fetch();
        if (remaining[0]) {
          await remaining[0].update((record) => {
            record.isPrimary = true;
            record.updatedAt = now;
          });
        }
      }
    });
  },
};

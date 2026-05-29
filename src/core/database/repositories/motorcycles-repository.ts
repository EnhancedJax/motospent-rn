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
    imageUrl: motorcycle.imageUrl,
    createdAt: motorcycle.createdAt,
    updatedAt: motorcycle.updatedAt,
  };
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

  async create(input: CreateMotorcycleRepositoryInput): Promise<MotorcycleDTO> {
    const now = Date.now();
    let created: Motorcycle | undefined;

    await database.write(async () => {
      created = await database.get<Motorcycle>('motorcycles').create((record) => {
        record.name = input.name;
        record.notes = input.notes;
        record.purchasePrice = input.purchasePrice;
        record.purchaseDate = input.purchaseDate;
        record.odometerAtAdditionKm = input.odometerAtAdditionKm;
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
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      updated = await motorcycle.update((record) => {
        if (input.name !== undefined) record.name = input.name;
        if (input.notes !== undefined) record.notes = input.notes;
        if (input.purchasePrice !== undefined) record.purchasePrice = input.purchasePrice;
        if (input.purchaseDate !== undefined) record.purchaseDate = input.purchaseDate;
        if (input.odometerAtAdditionKm !== undefined) {
          record.odometerAtAdditionKm = input.odometerAtAdditionKm;
        }
        if (input.imageUrl !== undefined) record.imageUrl = input.imageUrl;
        record.updatedAt = now;
      });
    });

    return toDTO(updated!);
  },

  async softDelete(id: string): Promise<void> {
    const now = Date.now();
    await database.write(async () => {
      const motorcycle = await database.get<Motorcycle>('motorcycles').find(id);
      await motorcycle.update((record) => {
        record.deletedAt = now;
        record.updatedAt = now;
      });
    });
  },
};

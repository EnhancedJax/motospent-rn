import { Q } from '@nozbe/watermelondb';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { database } from '../database';
import Setting from '../models/Setting';
import type { SettingDTO } from '../types';

function toDTO(setting: Setting): SettingDTO {
  return {
    key: setting.key,
    value: setting.value,
  };
}

export const settingsRepository = {
  async get(key: string): Promise<string | null> {
    const results = await database
      .get<Setting>('settings')
      .query(Q.where('key', key))
      .fetch();

    return results[0]?.value ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    await database.write(async () => {
      const existing = await database
        .get<Setting>('settings')
        .query(Q.where('key', key))
        .fetch();

      if (existing[0]) {
        await existing[0].update((record) => {
          record.value = value;
        });
        return;
      }

      await database.get<Setting>('settings').create((record) => {
        record.key = key;
        record.value = value;
      });
    });
  },

  observe(key: string): Observable<string | null> {
    return database
      .get<Setting>('settings')
      .query(Q.where('key', key))
      .observe()
      .pipe(map((records) => records[0]?.value ?? null));
  },

  observeAll(): Observable<SettingDTO[]> {
    return database
      .get<Setting>('settings')
      .query()
      .observe()
      .pipe(map((records) => records.map(toDTO)));
  },
};

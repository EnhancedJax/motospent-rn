import { getLocales } from 'expo-localization';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { settingsRepository } from '@/core/database/repositories/settings-repository';

import { SETTING_KEYS } from './keys';
import { isDistanceUnit, parseDistanceUnit, type DistanceUnit } from './types';

function defaultDistanceUnit(): DistanceUnit {
  const locale = getLocales()[0];
  return locale?.measurementSystem === 'us' ? 'mi' : 'km';
}

export const settingsService = {
  async getDistanceUnit(): Promise<DistanceUnit | null> {
    const value = await settingsRepository.get(SETTING_KEYS.distanceUnit);
    return parseDistanceUnit(value);
  },

  async setDistanceUnit(unit: DistanceUnit): Promise<void> {
    if (!isDistanceUnit(unit)) {
      throw new Error(`Invalid distance unit: ${unit}`);
    }
    await settingsRepository.set(SETTING_KEYS.distanceUnit, unit);
  },

  async seedDefaults(): Promise<void> {
    const existing = await settingsRepository.get(SETTING_KEYS.distanceUnit);
    if (existing !== null) {
      return;
    }
    await settingsRepository.set(SETTING_KEYS.distanceUnit, defaultDistanceUnit());
  },

  observeDistanceUnit(): Observable<DistanceUnit | null> {
    return settingsRepository
      .observe(SETTING_KEYS.distanceUnit)
      .pipe(map((value) => parseDistanceUnit(value)));
  },
};

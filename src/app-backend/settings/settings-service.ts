import { getLocales } from 'expo-localization';
import type { Observable } from '@nozbe/watermelondb/utils/rx';
import { map } from 'rxjs/operators';

import { settingsRepository } from '@/core/database/repositories/settings-repository';

import { SETTING_KEYS } from './keys';
import {
  isDistanceUnit,
  isVolumeUnit,
  parseDistanceUnit,
  parseVolumeUnit,
  type DistanceUnit,
  type VolumeUnit,
} from './types';

function isUsLocale(): boolean {
  return getLocales()[0]?.measurementSystem === 'us';
}

function defaultDistanceUnit(): DistanceUnit {
  return isUsLocale() ? 'mi' : 'km';
}

function defaultVolumeUnit(): VolumeUnit {
  return isUsLocale() ? 'gal' : 'L';
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

  async getVolumeUnit(): Promise<VolumeUnit | null> {
    const value = await settingsRepository.get(SETTING_KEYS.volumeUnit);
    return parseVolumeUnit(value);
  },

  async setVolumeUnit(unit: VolumeUnit): Promise<void> {
    if (!isVolumeUnit(unit)) {
      throw new Error(`Invalid volume unit: ${unit}`);
    }
    await settingsRepository.set(SETTING_KEYS.volumeUnit, unit);
  },

  async seedDefaults(): Promise<void> {
    const existingDistance = await settingsRepository.get(SETTING_KEYS.distanceUnit);
    if (existingDistance === null) {
      await settingsRepository.set(SETTING_KEYS.distanceUnit, defaultDistanceUnit());
    }

    const existingVolume = await settingsRepository.get(SETTING_KEYS.volumeUnit);
    if (existingVolume === null) {
      await settingsRepository.set(SETTING_KEYS.volumeUnit, defaultVolumeUnit());
    }
  },

  observeVolumeUnit(): Observable<VolumeUnit | null> {
    return settingsRepository
      .observe(SETTING_KEYS.volumeUnit)
      .pipe(map((value) => parseVolumeUnit(value)));
  },

  observeDistanceUnit(): Observable<DistanceUnit | null> {
    return settingsRepository
      .observe(SETTING_KEYS.distanceUnit)
      .pipe(map((value) => parseDistanceUnit(value)));
  },
};

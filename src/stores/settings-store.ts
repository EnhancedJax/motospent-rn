import { create } from 'zustand';

import { settingsService, type DistanceUnit, type VolumeUnit } from '@/app-backend';

import { subscribeObservable } from './subscribe-observable';

type SettingsState = {
  distanceUnit: DistanceUnit | null;
  volumeUnit: VolumeUnit | null;
  isLoading: boolean;
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>;
  subscribeToSettings: () => () => void;
};

let settingsSubscription: (() => void) | null = null;

export const useSettingsStore = create<SettingsState>((set) => ({
  distanceUnit: null,
  volumeUnit: null,
  isLoading: true,

  setDistanceUnit: async (unit) => {
    set({ distanceUnit: unit });
    await settingsService.setDistanceUnit(unit);
  },

  subscribeToSettings: () => {
    if (settingsSubscription) {
      return settingsSubscription;
    }

    set({ isLoading: true });

    let distanceUnit: DistanceUnit | null = null;
    let volumeUnit: VolumeUnit | null = null;
    let distanceReady = false;
    let volumeReady = false;

    const maybeFinishLoading = () => {
      if (distanceReady && volumeReady) {
        set({ distanceUnit, volumeUnit, isLoading: false });
      }
    };

    const unsubDistance = subscribeObservable(
      settingsService.observeDistanceUnit(),
      (unit) => {
        distanceUnit = unit;
        distanceReady = true;
        maybeFinishLoading();
        set({ distanceUnit: unit });
      },
    );

    const unsubVolume = subscribeObservable(settingsService.observeVolumeUnit(), (unit) => {
      volumeUnit = unit;
      volumeReady = true;
      maybeFinishLoading();
      set({ volumeUnit: unit });
    });

    settingsSubscription = () => {
      unsubDistance();
      unsubVolume();
    };

    return settingsSubscription;
  },
}));

import { create } from 'zustand';

import { settingsService, type DistanceUnit } from '@/app-backend';

import { subscribeObservable } from './subscribe-observable';

type SettingsState = {
  distanceUnit: DistanceUnit | null;
  isLoading: boolean;
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>;
  subscribeToSettings: () => () => void;
};

let settingsSubscription: (() => void) | null = null;

export const useSettingsStore = create<SettingsState>((set) => ({
  distanceUnit: null,
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

    settingsSubscription = subscribeObservable(
      settingsService.observeDistanceUnit(),
      (distanceUnit) => {
        set({ distanceUnit, isLoading: false });
      },
    );

    return () => {
      settingsSubscription?.();
      settingsSubscription = null;
    };
  },
}));

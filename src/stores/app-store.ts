import { create } from 'zustand';

import { settingsService } from '@/app-backend';

type AppState = {
  dbReady: boolean;
  initError: string | null;
  initializeApp: () => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  dbReady: false,
  initError: null,
  initializeApp: async () => {
    try {
      await settingsService.seedDefaults();
      set({ dbReady: true, initError: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize app';
      set({ dbReady: false, initError: message });
      throw error;
    }
  },
}));

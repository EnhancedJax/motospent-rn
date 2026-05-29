import { create } from 'zustand';

type MotorcycleUiState = {
  selectedMotorcycleId: string | null;
  pendingSelectedId: string | null;
  setSelectedMotorcycleId: (id: string) => void;
  setPendingSelectedId: (id: string) => void;
  consumePendingSelectedId: () => string | null;
};

export const useMotorcycleUiStore = create<MotorcycleUiState>((set, get) => ({
  selectedMotorcycleId: null,
  pendingSelectedId: null,
  setSelectedMotorcycleId: (id) => set({ selectedMotorcycleId: id }),
  setPendingSelectedId: (id) => set({ pendingSelectedId: id, selectedMotorcycleId: id }),
  consumePendingSelectedId: () => {
    const id = get().pendingSelectedId;
    set({ pendingSelectedId: null });
    return id;
  },
}));

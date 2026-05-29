import { create } from 'zustand';

type MotorcycleUiState = {
  pendingSelectedId: string | null;
  setPendingSelectedId: (id: string) => void;
  consumePendingSelectedId: () => string | null;
};

export const useMotorcycleUiStore = create<MotorcycleUiState>((set, get) => ({
  pendingSelectedId: null,
  setPendingSelectedId: (id) => set({ pendingSelectedId: id }),
  consumePendingSelectedId: () => {
    const id = get().pendingSelectedId;
    set({ pendingSelectedId: null });
    return id;
  },
}));

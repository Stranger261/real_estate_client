import { create } from "zustand";

export interface PickedBuilding {
  id: string;
  label: string;
}

interface PickerState {
  building: PickedBuilding | null;
  setBuilding: (b: PickedBuilding | null) => void;
  takeBuilding: () => PickedBuilding | null;
}

export const usePickerStore = create<PickerState>()((set, get) => ({
  building: null,
  setBuilding: (building) => set({ building }),
  takeBuilding: () => {
    const b = get().building;
    if (b) set({ building: null });
    return b;
  },
}));

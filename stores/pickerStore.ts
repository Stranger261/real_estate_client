import { Coords } from "@/utils/geo";
import { create } from "zustand";

export interface PickedBuilding {
  id: string;
  label: string;
}

interface PickerState {
  building: PickedBuilding | null;
  location: Coords | null;
  setBuilding: (b: PickedBuilding | null) => void;
  takeBuilding: () => PickedBuilding | null;
  setLocation: (c: Coords | null) => void;
  takeLocation: () => Coords | null; // reads it once and clears it
}
export const usePickerStore = create<PickerState>()((set, get) => ({
  building: null,
  location: null,
  setBuilding: (building) => set({ building }),
  takeBuilding: () => {
    const b = get().building;
    if (b) set({ building: null });
    return b;
  },

  setLocation: (location) => set({ location }),
  takeLocation: () => {
    const l = get().location;
    if (l) set({ location: null });
    return l;
  },
}));

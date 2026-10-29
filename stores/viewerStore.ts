import { create } from "zustand";

interface ViewerState {
  images: string[];
  index: number;
  open: (images: string[], index?: number) => void;
  setIndex: (index: number) => void;
}

export const useViewerStore = create<ViewerState>()((set) => ({
  images: [],
  index: 0,
  open: (images, index) => set({ images, index }),
  setIndex: (index) => set({ index }),
}));

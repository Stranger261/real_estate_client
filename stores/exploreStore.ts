import { ListingKind, PropertyType, TargetType } from "@/constants/filters";
import { create } from "zustand";

interface ExploreFilters {
  text: string;
  type: ListingKind | undefined;
  item: TargetType | undefined;
  property: PropertyType | undefined;
}

const DEFAULTS: ExploreFilters = {
  text: "",
  type: undefined,
  item: undefined,
  property: undefined,
};

interface ExploreState extends ExploreFilters {
  focusSearchRequested: boolean;
  setText: (text: string) => void;
  setType: (type: ListingKind | undefined) => void;
  setItem: (item: TargetType | undefined) => void;
  setProperty: (property: PropertyType | undefined) => void;
  requestSearchFocus: () => void;
  consumeSearchFocus: () => boolean;
  reset: () => void;
}

export const useExploreStore = create<ExploreState>()((set, get) => ({
  ...DEFAULTS,
  focusSearchRequested: false,

  setText: (text) => set({ text }),
  setType: (type) => set({ type }),
  setItem: (item) =>
    set(item === "PROPERTY" ? { item } : { item, property: undefined }),
  setProperty: (property) => set({ property }),

  requestSearchFocus: () => set({ focusSearchRequested: true }),
  consumeSearchFocus: () => {
    const requested = get().focusSearchRequested;
    if (requested) set({ focusSearchRequested: false });
    return requested;
  },

  reset: () => set(DEFAULTS),
}));

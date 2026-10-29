import { ListingKind, PropertyType, TargetType } from "@/constants/filters";
import { Coords, DEFAULT_RADIUS } from "@/utils/geo";
import { create } from "zustand";

interface ExploreFilters {
  text: string;
  type: ListingKind | undefined;
  item: TargetType | undefined;
  property: PropertyType | undefined;
  near: Coords | null;
  radiusKm: number;
}

const DEFAULTS: ExploreFilters = {
  text: "",
  type: undefined,
  item: undefined,
  property: undefined,
  near: null,
  radiusKm: DEFAULT_RADIUS,
};

interface ExploreState extends ExploreFilters {
  focusSearchRequested: boolean;
  nearMeRequested: boolean;
  setText: (text: string) => void;
  setType: (type: ListingKind | undefined) => void;
  setItem: (item: TargetType | undefined) => void;
  setProperty: (property: PropertyType | undefined) => void;
  setNear: (coords: Coords | null) => void;
  setRadius: (radiusKm: number) => void;
  requestSearchFocus: () => void;
  consumeSearchFocus: () => boolean;
  requestNearMe: () => void;
  consumeNearMe: () => boolean;
  reset: () => void;
}

export const useExploreStore = create<ExploreState>()((set, get) => ({
  ...DEFAULTS,
  focusSearchRequested: false,
  nearMeRequested: false,

  setText: (text) => set({ text }),
  setType: (type) => set({ type }),
  setItem: (item) =>
    set(item === "PROPERTY" ? { item } : { item, property: undefined }),
  setProperty: (property) => set({ property }),
  setNear: (near) => set({ near }),
  setRadius: (radiusKm) => set({ radiusKm }),

  requestSearchFocus: () => set({ focusSearchRequested: true }),
  consumeSearchFocus: () => {
    const requested = get().focusSearchRequested;
    if (requested) set({ focusSearchRequested: false });
    return requested;
  },

  requestNearMe: () => set({ nearMeRequested: true }),
  consumeNearMe: () => {
    const requested = get().nearMeRequested;
    if (requested) set({ nearMeRequested: false });
    return requested;
  },

  reset: () => set(DEFAULTS),
}));

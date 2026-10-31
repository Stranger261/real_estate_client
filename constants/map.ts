export type Bounds = [number, number, number, number]; // west, south, east, north

export const MAP_STYLE =
  process.env.EXPO_PUBLIC_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

export const PH_BOUNDS: Bounds = [117, 5, 127, 19];
export const NEAR_ME_ZOOM = 13;

export interface Coords {
  latitude: number;
  longitude: number;
}

export const RADIUS_STEPS = [5, 10, 25, 50] as const;
export const DEFAULT_RADIUS = 10;

export const roundCoord = (n: number) => Number(n.toFixed(3));
export const roundCoords = (c: Coords): Coords => ({
  latitude: roundCoord(c.latitude),
  longitude: roundCoord(c.longitude),
});

export const formatDistance = (km: number) => {
  if (km < 0.1) return "Less than 100 m away";
  if (km < 1) return `${Math.round(km * 100) * 10} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
};

export interface Coords {
  latitude: number;
  longitude: number;
}

export const RADIUS_STEPS = [5, 10, 20, 50] as const;
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

export const circleBounds = (
  c: Coords,
  km: number,
): [number, number, number, number] => {
  const dLat = km / 111.32;
  const dLng =
    km / (111.32 * Math.max(Math.cos((c.latitude * Math.PI) / 180), 0.01));
  return [
    c.longitude - dLng,
    c.latitude - dLat,
    c.longitude + dLng,
    c.latitude + dLat,
  ];
};

export const circlePolygon = (c: Coords, km: number, steps = 64) => {
  const dLat = km / 111.32;
  const dLng =
    km / (111.32 * Math.max(Math.cos((c.latitude * Math.PI) / 180), 0.01));
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([
      c.longitude + dLng * Math.cos(angle),
      c.latitude + dLat * Math.sin(angle),
    ]);
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [ring] },
  };
};

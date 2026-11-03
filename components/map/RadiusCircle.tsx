import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { circlePolygon, type Coords } from "@/utils/geo";

export const RadiusCircle = ({
  center,
  radiusKm,
}: {
  center: Coords;
  radiusKm: number;
}) => (
  <>
    <GeoJSONSource id="radius" data={circlePolygon(center, radiusKm)} />
    <Layer
      id="radius-fill"
      type="fill"
      source="radius"
      paint={{ "fill-color": "#0061FF", "fill-opacity": 0.08 }}
    />
    <Layer
      id="radius-line"
      type="line"
      source="radius"
      paint={{ "line-color": "#0061FF", "line-width": 2, "line-opacity": 0.6 }}
    />
  </>
);

import { Feature } from "ol";
import { MultiPolygon, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";

import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Fill, Stroke, Style, Text } from "ol/style";
import { FeatureLike } from "ol/Feature";

export interface PoliceProps {
  politidist: string;
  url: string;
}

export type PoliceFeature = {
  getProperties(): PoliceProps;
} & Feature<Polygon & MultiPolygon>;

export const policeDistrictLayer = new VectorLayer({
  className: "cities",
  source: new VectorSource({
    url: "./Politidistrikter.json",
    format: new GeoJSON(),
  }),
  style: new Style({
    fill: new Fill({
      color: "rgba(103,107,76,0.13)",
    }),
    stroke: new Stroke({
      color: "#12B8FF",
      width: 2,
    }),
  }),
});

export function SelectedPoliceStyle(f: FeatureLike) {
  const feature = f as PoliceFeature;
  const city = feature.getProperties();
  return new Style({
    stroke: new Stroke({
      color: "#12B8FF",
      width: 5,
    }),
    fill: new Fill({
      color: [0, 0, 50, 0.2],
    }),
    text: new Text({
      text: city.politidist,

      fill: new Fill({ color: "#12B8FF" }),
      stroke: new Stroke({ color: "black", width: 2 }),
    }),
  });
}

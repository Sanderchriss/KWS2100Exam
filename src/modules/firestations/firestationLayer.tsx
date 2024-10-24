import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";

export const firestationLayer = new VectorLayer({
  source: new VectorSource({
    url: "./BrannstasjonerPoint.json",
    format: new GeoJSON(),
  }),
  style: firestationStyle,
});

export interface FirestationProps {
  brannstasj: string;
  kasernert: string;
  brannvesen: string;
}

export type FirestationFeature = {
  getProperties(): FirestationProps;
} & Feature<Point>;
function firestationStyle(f: FeatureLike) {
  const feature = f as FirestationFeature;
  const firestation = feature.getProperties();
  return new Style({
    image: new RegularShape({
      stroke: new Stroke({ color: "#FD4499", width: 2 }),
      fill: new Fill({
        color: "black",
      }),
      points: 9,
      radius: 6,
      rotation: 2.345,
    }),
  });
}

export function activeFirestationStyle(f: FeatureLike, resolution: number) {
  const feature = f as FirestationFeature;
  const firestation = feature.getProperties();
  return new Style({
    image: new RegularShape({
      stroke: new Stroke({ color: "black", width: 3 }),
      fill: new Fill({
        color: "#FD4499",
      }),
      points: 4,
      radius: 5,
      rotation: 2.345,
    }),
    text:
      resolution < 1000
        ? new Text({
            text:
              firestation.brannstasj +
              "\n Region: " +
              firestation.brannvesen.toString(),

            offsetY: -60,
            font: " 16px AnonymicePro Nerd Font Propo",
            fill: new Fill({ color: "#FD4499" }),
            stroke: new Stroke({ color: "black", width: 2 }),
          })
        : undefined,
  });
}

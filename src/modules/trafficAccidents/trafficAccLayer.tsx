import Cluster from "ol/source/Cluster";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import VectorLayer from "ol/layer/Vector";
import { Feature, MapBrowserEvent } from "ol";
import { Point } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import {
  Fill,
  Icon,
  IconImage,
  RegularShape,
  Stroke,
  Style,
  Text,
} from "ol/style";

export interface ClusterProperties {
  vegbredde: string;
  ulykkesdato: string;
  temperatur: number;
  antallEnheter: number;
}
export const newCluster = new Cluster({
  distance: 80,
  source: new VectorSource({
    url: "./Trafikkulykker_GML.json",
    format: new GeoJSON(),
  }),
});

export type ClusterFeature = {
  getProperties(): ClusterProperties;
} & Feature<Point>;

export const newClusterLayer = new VectorLayer({
  source: newCluster,
  style: function (f: FeatureLike) {
    let totalAccidents = 0;
    const features = f.get("features") as ClusterFeature[];
    totalAccidents = features.length;
    const minSize = 15;
    const maxSize = 55;

    let radius = totalAccidents;
    if (radius < 15) {
      radius = Math.max(radius, minSize);
    }
    if (radius > 55) {
      radius = Math.min(radius, maxSize);
    }

    return [
      new Style({
        image: new RegularShape({
          stroke: new Stroke({
            color: "rgba(245,7,7,0.36)",
            width: 2,
            lineDash: [5, 3],
          }),
          fill: new Fill({ color: "rgba(23,25,25,0.62)" }),
          points: 3,
          radius: radius,
          rotation: 0.05,
          radius2: 7,
        }),
      }),
      new Style({
        image: new Icon({
          src: "./accImage.png",
          scale: radius / 28,
          color: "black",
        }),
      }),
      new Style({
        text: new Text({
          text: features.length + "",
          font: `${70}% Georgia`,
          stroke: new Stroke({ color: "#de0101", width: 1 }),
          fill: new Fill({
            color: "#f6f0ee",
          }),
          scale: 2,
        }),
      }),
      //Place text below the object
      new Style({
        text: new Text({
          text: "",
          offsetY: 20,
          font: `${50}% Georgia`,
          stroke: new Stroke({ color: "#FF3A06", width: 0.1 }),
          fill: new Fill({
            color: "#FF3A06",
          }),
          scale: 2,
        }),
      }),
    ];
  },
});

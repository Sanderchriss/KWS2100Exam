import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";

export const hospitalLayer = new VectorLayer({
  source: new VectorSource({
    url: "/kws2100-exam-Sanderchriss/sykehus.geojson",
    format: new GeoJSON(),
  }),
  style: hospitalStyle,
});

export interface HospitalProps {
  navn: string;
  pasientgrunnlag: number;
  grunnlagt: number;
  region: string;
}

export type HospitalFeature = {
  getProperties(): HospitalProps;
} & Feature<Point>;
function hospitalStyle(f: FeatureLike) {
  const feature = f as HospitalFeature;
  const hospital = feature.getProperties();
  const radius = 12 + hospital.pasientgrunnlag / 30000;
  const iconScale = radius * 0.003;
  return [
    new Style({
      image: new RegularShape({
        stroke: new Stroke({ color: "#FFE62D", width: 2 }),
        fill: new Fill({
          color: "yellow",
        }),
        points: 4,
        radius: radius,
        rotation: 2.345,
      }),
    }),
    new Style({
      image: new Icon({
        src: "/kws2100-exam-Sanderchriss/hospital-1213-svgrepo-com.svg",
        scale: iconScale,
      }),
    }),
  ];
}

export function activeHospitalStyle(f: FeatureLike, resolution: number) {
  const feature = f as HospitalFeature;
  const hospital = feature.getProperties();
  const radius = 12 + hospital.pasientgrunnlag / 30000;
  const iconScale = radius * 0.003;
  return [
    new Style({
      image: new RegularShape({
        stroke: new Stroke({ color: "black", width: 3 }),
        fill: new Fill({
          color: "#000000",
        }),
        points: 4,
        radius: radius,
        rotation: 2.345,
      }),
      text:
        resolution < 1000
          ? new Text({
              text:
                hospital.navn +
                "\n Pasientgrunnlag: " +
                hospital.pasientgrunnlag.toString(),
              offsetY: -60,
              font: " 16px Georgia",
              fill: new Fill({ color: "#FFE62D" }),
              stroke: new Stroke({ color: "black", width: 2 }),
            })
          : undefined,
    }),
    new Style({
      image: new Icon({
        src: "/kws2100-exam-Sanderchriss/hospital-1213-svgrepo-com(1).svg",
        scale: iconScale,
      }),
    }),
  ];
}

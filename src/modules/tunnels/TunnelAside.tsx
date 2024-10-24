import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { MultiLineString } from "ol/geom";
import { GeoJSON } from "ol/format";
import { FeatureLike } from "ol/Feature";
import { Stroke, Style } from "ol/style";
import React, { useContext, useEffect, useState } from "react";
import { BaseMap } from "../../componentTools/BaseMap";

type TunnelVectorLayer = VectorLayer<VectorSource<TunnelFeature>>;

interface TunnelProperties {
  gatenavn: string;
  vegnummer: number;
  vegkategor: string;
}
const colorCategoryBox: {
  [key: string]: { name: string; color: string; key: number };
} = {
  K: { name: "Kommunalvei", color: "#5E57FF", key: 1 },
  E: { name: "Europavei", color: "#F23CA6", key: 2 },
  P: { name: "Privatvei", color: "#FF9535", key: 3 },
  F: { name: "Fylkesvei", color: "#4BFF36", key: 4 },
  R: { name: "Riksvei", color: "#02FEE4", key: 5 },
};
export type TunnelFeature = {
  getProperties(): TunnelProperties;
} & Feature<MultiLineString>;

export const TunnelLayer = new VectorLayer({
  className: "gatenavn",
  source: new VectorSource({
    url: "./Veitunneler.json",
    format: new GeoJSON(),
  }),
  style: function TunnelStyling(f: FeatureLike) {
    const feature = f as TunnelFeature;
    const tunnel = feature.getProperties();
    const color = colorCategoryBox[tunnel.vegkategor]?.color || "black";
    return new Style({
      stroke: new Stroke({
        color: color,
        width: 4,
        lineDash: [3],
      }),
    });
  },
});

function useTunnelFeatures() {
  const { featureLayers } = useContext(BaseMap);
  const tunnelLayer = featureLayers.find(
    (l) => l.getClassName() === "tunnel",
  ) as TunnelVectorLayer;
  const [features, setFeatures] = useState<TunnelFeature[]>([]);

  function handleSourceChange() {
    setFeatures(tunnelLayer?.getSource()?.getFeatures() as TunnelFeature[]);
  }

  useEffect(() => {
    tunnelLayer?.getSource()?.on("change", handleSourceChange);
    return () => {
      tunnelLayer?.getSource()?.un("change", handleSourceChange);
    };
  }, [tunnelLayer]);

  return { tunnelLayer, features };
}

export function TunnelAside() {
  const { features } = useTunnelFeatures();

  return (
    <aside className={features?.length ? "visible" : "hidden"}>
      <ul>
        {Object.keys(colorCategoryBox).map((key) => (
          <li key={colorCategoryBox[key].key} className="colorCategoryLi">
            <span
              className="categoryBoxTunnels"
              style={{
                backgroundColor: colorCategoryBox[key].color,
              }}
            ></span>
            {colorCategoryBox[key].name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

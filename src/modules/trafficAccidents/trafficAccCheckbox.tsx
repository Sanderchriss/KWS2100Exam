import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BaseMap } from "../../componentTools/BaseMap";
import { newClusterLayer } from "./trafficAccLayer";
import React from "react";
import { FeatureLike } from "ol/Feature";

import { MapBrowserEvent, Overlay } from "ol";

export function TrafficAccidentLayerCheckbox() {
  const [names, setNames] = useState<string[]>([]);
  const { setFeatureLayers, map } = useContext(BaseMap);
  const [checked, setChecked] = useState(false);
  const [featuresInCluster, setFeaturesInCluster] = useState<FeatureLike[]>([]);

  const overlay = useMemo(() => new Overlay({}), []);
  const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    map.addOverlay(overlay);
    return () => {
      map.removeOverlay(overlay);
    };
  }, [checked]);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const resolution = map.getView().getResolution();
    if (!resolution || resolution > 1500) {
      return;
    }
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 10,
      layerFilter: (l) => l === newClusterLayer,
    });

    if (features.length === 0) {
      setFeaturesInCluster([]);
    } else {
      for (const feature of features) {
        const featuresInCluster = feature.getProperties().features;
        console.log(feature.getGeometry());
        setFeaturesInCluster(featuresInCluster);
      }
    }
  }
  useEffect(() => {
    if (checked) {
      setFeatureLayers((old) => [...old, newClusterLayer]);
      map.on("pointermove", handleClick);
    }
    return () => {
      setFeatureLayers((old) => old.filter((l) => l !== newClusterLayer));
      map.un("pointermove", handleClick);
    };
  }, [checked]);

  return (
    <div>
      <label
        style={{
          fontStyle: checked ? "italic" : "",
          fontSize: checked ? "medium" : "",
          fontWeight: checked ? "bold" : "",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Accidents
      </label>
      {featuresInCluster.length > 0 && (
        <div
          className="accidentInfoList"
          style={{
            top: `${mousePosition.y}px`,
            left: `${mousePosition.x + 15}px`,
            padding: 5,
          }}
        >
          {/* Render featuresInCluster */}
          ~Traffic Accidents~
          {featuresInCluster.slice(0, 10).map((feature, i) => (
            <div key={i}>
              <div>{feature.getProperties().ulykkesdato}</div>
              <div>
                <s />
                Involved : <s />
                {feature.getProperties().antallEnheter}
              </div>
              <br />
            </div>
          ))}
          {featuresInCluster.length > 10 && (
            <>
              <br />
              among others...
            </>
          )}
        </div>
      )}
    </div>
  );
}

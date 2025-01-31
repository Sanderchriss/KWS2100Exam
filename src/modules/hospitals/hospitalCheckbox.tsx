import { MapBrowserEvent } from "ol";
import { FeatureLike } from "ol/Feature";
import React, { useContext, useEffect, useState } from "react";
import { BaseMap } from "../../componentTools/BaseMap";
import { useLayer } from "../../componentTools/useLayer";
import {
  activeHospitalStyle,
  hospitalLayer,
  HospitalFeature,
} from "./hospitalsLayer";

export function HospitalsCheckbox() {
  const { map } = useContext(BaseMap);
  const [checked, setChecked] = useState(false);

  const [activeFeature, setActiveFeature] = useState<HospitalFeature>();
  function handlePointerMove(e: MapBrowserEvent<MouseEvent>) {
    const resolution = map.getView().getResolution();
    if (!resolution || resolution > 8000) {
      return;
    }
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(e.pixel, (f) => features.push(f), {
      hitTolerance: 5,
      layerFilter: (l) => l === hospitalLayer,
    });
    if (features.length === 1) {
      setActiveFeature(features[0] as HospitalFeature);
    } else {
      setActiveFeature(undefined);
    }
  }

  useLayer(hospitalLayer, checked);

  useEffect(() => {
    activeFeature?.setStyle(activeHospitalStyle);
    return () => activeFeature?.setStyle(undefined);
  }, [activeFeature]);

  useEffect(() => {
    if (checked) {
      map?.on("pointermove", handlePointerMove);
    }
    return () => map?.un("pointermove", handlePointerMove);
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
          type={"checkbox"}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Hospitals
      </label>
    </div>
  );
}

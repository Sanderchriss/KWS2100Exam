import { Feature, MapBrowserEvent } from "ol";
import { Layer } from "ol/layer";
import { useContext, useEffect, useMemo, useState } from "react";
import { BaseMap } from "./BaseMap";
import { useViewExtent } from "./useViewExtent";
import VectorLayer from "ol/layer/Vector";

// The constraint <T extends Feature> ensures that only
// types conforming to the Feature structure can be used with the function.
export function useFeatures<T extends Feature>(
  layerPredicate: (layer: Layer) => boolean,
) {
  const { featureLayers, map } = useContext(BaseMap);
  const viewExtent = useViewExtent();

  const layer = useMemo(
    () => featureLayers.find(layerPredicate) as VectorLayer<any>,
    [featureLayers, layerPredicate],
  );

  // State management
  const [features, setFeatures] = useState<T[]>([]);
  const [activeFeatures, setActiveFeature] = useState<T>();

  // Visibility filter
  const visibleFeatures = useMemo(
    () => features.filter((f) => f.getGeometry()?.intersectsExtent(viewExtent)),
    [features, viewExtent],
  );

  // Event handler for pointermove
  function handlePointermove(e: MapBrowserEvent<MouseEvent>) {
    const features = layer?.getSource().getFeaturesAtCoordinate(e.coordinate);
    setActiveFeature(features?.length === 1 ? features[0] : undefined);
  }

  // Event listeners and cleanup
  useEffect(() => {
    if (layer) {
      map.on("pointermove", handlePointermove);
    }
    return () => {
      map.un("pointermove", handlePointermove);
    };
  }, [map, layer]);

  return { features, visibleFeatures, activeFeatures, setActiveFeature };
}

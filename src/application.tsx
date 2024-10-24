import { BaseMap } from "./componentTools/BaseMap";
import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Layer } from "ol/layer";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { Feature, View } from "ol";
import React from "react";
import "./application.css";
import "ol/ol.css";
import { BaseLayerSelector } from "./componentTools/BaseLayerSelector";
import { TrafficAccidentLayerCheckbox } from "./modules/trafficAccidents/trafficAccCheckbox";
import { HospitalsCheckbox } from "./modules/hospitals/hospitalCheckbox";
import { Measure } from "./componentTools/Measure";
import { PoliceDistrictCheckbox } from "./modules/policeDistricts/policeDistrictCheckbox";
import { FirestationCheckbox } from "./modules/firestations/firestationCheckbox";

import { TunnelLayerCheckbox } from "./modules/tunnels/TunnelLayerCheckbox";
import { TunnelAside } from "./modules/tunnels/TunnelAside";

import LayerGroup from "ol/layer/Group";

export function Application() {
  const { map } = useContext(BaseMap);

  function handleZoom(e: React.MouseEvent, zoom: number) {
    e.preventDefault();
    map.getView().animate({
      zoom: zoom,
    });
  }

  function handleZoomToUser(e: React.MouseEvent) {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      // Zoom to the user's location
      map.getView().animate({
        center: [longitude, latitude],
        zoom: 12,
        duration: 200,
      });
      setTimeout(() => {
        setView(
          new View({
            center: [longitude, latitude],
            zoom: 12,
          }),
        );
      }, 200);
    });
  }

  //contains the sessionStorage,
  const [view, setView] = useState(() => {
    {
      return new View({
        // Looks for the key in session storage
        extent: sessionStorage.getItem("mapViewExtent")
          ? JSON.parse(sessionStorage.getItem("mapViewExtent") as string)
          : // It wil initially revert to default of no mapview is found
            undefined,
        center: [10, 61],
        zoom: 6,
      });
    }
  });

  useEffect(() => map.setView(view), [view]);

  const [baseLayer, setBaseLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );
  const [layerGroup, setLayerGroup] = useState<LayerGroup | undefined>();
  const [featureLayers, setFeatureLayers] = useState<Layer[]>([]);

  const layers = useMemo(
    () => [baseLayer, ...(layerGroup ? [layerGroup] : []), ...featureLayers],
    [baseLayer, layerGroup, featureLayers],
  );

  const projection = useMemo(
    () => baseLayer.getSource()!.getProjection(),
    [baseLayer],
  );

  useEffect(() => {
    if (projection)
      setView(
        (old) =>
          new View({
            center: old.getCenter(),
            zoom: old.getZoom(),
            projection: projection,
          }),
      );
  }, [projection]);

  useEffect(() => map.setLayers(layers), [layers]);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => map.setTarget(mapRef.current), []);

  return (
    <BaseMap.Provider
      value={{
        map,
        featureLayers,
        setFeatureLayers,
        setBaseLayer,
        setLayerGroup,
      }}
    >
      <header>
        <nav className="containerMain">
          <button className="myLocation" onClick={handleZoomToUser}>
            {" "}
            My Location
          </button>
          <button
            className="zoomOut"
            onClick={(e) => {
              sessionStorage.clear();
              sessionStorage.removeItem("mapViewExtent");
              handleZoom(e, 4);
            }}
          >
            {" "}
            Zoom out
          </button>

          <BaseLayerSelector />
          <Measure />
          <HospitalsCheckbox />
          <PoliceDistrictCheckbox />
          <TrafficAccidentLayerCheckbox />
          <FirestationCheckbox />
          <TunnelLayerCheckbox />
        </nav>
      </header>
      <main>
        <div ref={mapRef}></div>
      </main>
    </BaseMap.Provider>
  );
}

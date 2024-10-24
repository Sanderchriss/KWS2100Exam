import React, { useContext, useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile";
import { OSM, StadiaMaps, TileWMS, WMTS } from "ol/source";
import { BaseMap } from "./BaseMap";
import { Layer } from "ol/layer";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { WMTSCapabilities } from "ol/format";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import XYZ from "ol/source/XYZ";
import { MapboxVectorLayer } from "ol-mapbox-style";

import LayerGroup from "ol/layer/Group";

//added EPSG:54009 to make the draw area return the correct measurment
//When adding sattellite tilelayer it is necessasry to also make changes in the
// StadiaMaps.js file in the ol/source folder

proj4.defs([
  [
    "EPSG:3571",
    "+proj=laea +lat_0=90 +lon_0=180 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
  ],
  [
    "EPSG:3575",
    "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
  ],
  [
    "EPSG:32632",
    "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs\n",
  ],
  [
    "EPSG:54009",
    "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs",
  ],
]);
register(proj4);

const parser = new WMTSCapabilities();

const accessToken =
    {process.env.MAPBOX_TOKEN};
const backgroundLayer = new MapboxVectorLayer({
  styleUrl: "mapbox://styles/mapbox/dark-v9",
  accessToken: accessToken,
});
async function loadWmtsLayer(url: string, config: any) {
  const response = await fetch(url);
  const text = await response.text();
  const options = optionsFromCapabilities(parser.read(text), config)!;

  return new TileLayer({ source: new WMTS(options) });
}

function useAsyncLayer(fn: () => Promise<Layer>) {
  const [layer, setLayer] = useState<Layer>();

  useEffect(() => {
    fn().then(setLayer);
  }, []);
  return layer;
}

function loadTopoGreyLayer() {
  return loadWmtsLayer(
    "https://cache.kartverket.no/capabilities/topograatone/WMTSCapabilities.xml?request=GetCapabilities&service=wms",
    {
      layer: "topograatone",
      matrixset: "utm33n",
      format: "image/png",
    },
  );
}
function loadPictureLayer() {
  return loadWmtsLayer(
    "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    {
      layer: "Nibcache_web_mercator_v2",
      matrixSet: "default028mm",
    },
  );
}

function loadPolarLayer() {
  return loadWmtsLayer(
    "/kws2100-exam-Sanderchriss/arctic-sdi-capabilities.xml",
    {
      layer: "arctic_cascading",
      matrixSet: "3575",
    },
  );
}

const satApi = {process.env.SAT_API_KEY};

export function BaseLayerSelector() {
  const { setBaseLayer, setLayerGroup } = useContext(BaseMap);
  const pictureLayer = useAsyncLayer(loadPictureLayer);
  const polarLayer = useAsyncLayer(loadPolarLayer);
  const topoLayer = useAsyncLayer(loadTopoGreyLayer);

  const combinedLayers =
    ([pictureLayer, topoLayer].filter((layer) => layer) as Layer[]) || null;
  const combinedLayer = new LayerGroup({ layers: combinedLayers });

  const options = {
    combined: {
      Name: "Topographic and Picture",
      layer: combinedLayers,
    },
    osm: {
      name: "Open Street Map",
      layer: new TileLayer({ source: new OSM() }),
    },
    stadia: {
      name: "Stadia",
      layer: new TileLayer({
        opacity: 1,
        source: new StadiaMaps({
          layer: "outdoors",
          apiKey: {process.env.STADIA_TOKEN},
        }),
      }),
    },
    dark: {
      name: "Stadia (dark)",
      layer: new TileLayer({
        source: new StadiaMaps({
          layer: "alidade_smooth_dark",
          apiKey: {process.env.STADIA_TOKEN},
        }),
      }),
    },
    satellite: {
      name: "Alidade Satellite",
      layer: new TileLayer({
        source: new XYZ({
          url: `https://tiles-eu.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}@2x.jpg?api_key=${satApi}`, //prob need api key
        }),
      }),
    },
    bilder: {
      name: "Norge i bilder",
      layer: pictureLayer,
    },
    polar: {
      name: "Polar",
      layer: polarLayer,
    },
    mapbox: {
      name: "mapbox",
      layer: backgroundLayer,
    },
    topographic: {
      name: "topo",
      layer: topoLayer,
    },
  };

  const [selected, setSelected] = useState<keyof typeof options>("dark");

  useEffect(() => {
    if (selected === "combined") {
      const styleCombined = combinedLayer;
      styleCombined.setOpacity(0.8);
      styleCombined.setZIndex(0);
      setLayerGroup(combinedLayer);
    } else if (options[selected]?.layer) {
      if (combinedLayer) {
        setLayerGroup(undefined);
      }
      setBaseLayer(options[selected].layer!);
    }
  }, [selected]);

  return (
    <label className="apSelector">
      <select
        onChange={(e) => setSelected(e.target.value as any)}
        value={selected}
      >
        <option value={"dark"}>Stadia (dark)</option>
        <option value={"osm"}>Open Street Map</option>
        <option value={"stadia"}>Stadia</option>
        <option value={"polar"}>Polar</option>
        <option value={"mapbox"}>Mapbox</option>
        <option value={"combined"}>Topography & Pictures</option>
        <option value={"topographic"}>Topographic</option>
        <option value={"satellite"}>Satellite</option>
      </select>
    </label>
  );
}

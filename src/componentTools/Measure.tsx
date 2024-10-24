import React, { useContext, useEffect, useRef, useState } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { Vector as VectorSource } from "ol/source";
import { BaseMap } from "./BaseMap";
import { useLayer } from "./useLayer";
import VectorLayer from "ol/layer/Vector";
import { GeometryType } from "ol/render/webgl/MixedGeometryBatch";
import { getLength } from "ol/sphere";
import CircleStyle from "ol/style/Circle";
import { Fill, Icon, IconImage, Stroke, Style, Text } from "ol/style";
import {
  Circle,
  LineString,
  Polygon,
  Point,
  GeometryCollection,
} from "ol/geom";
import "ol/ol.css";

// https://openlayers.org/en/latest/examples/draw-features.html
// https://openlayers.org/en/latest/examples/measure.html

type GeometryOptions =
  | "Disabled"
  | "Point"
  | "LineString"
  | "Polygon"
  | "Circle";

export function Measure() {
  const calculateLengthInKm = (geometry: LineString): number => {
    const geometry3857 = geometry.clone().transform("EPSG:4326", "EPSG:3857");
    const lengthInMeters = getLength(geometry3857);
    return lengthInMeters / 1000;
  };

  const calculateAreaInSquareKm = (polygon: Polygon): number => {
    const area = polygon.clone().transform("EPSG:4326", "EPSG:54009");
    const areaInSquareMeters = area.getArea(); // Get original coordinates
    return areaInSquareMeters / 1000000; // Convert to square kilometers
  };

  const calculateAreaOfCircleInSquareKm = (circle: Circle): number => {
    const area = circle.clone().transform("EPSG:4326", "EPSG:54009");
    const radiusOfCircle = area.getRadius();
    const areaOfCircle = Math.PI * radiusOfCircle * radiusOfCircle;
    return areaOfCircle / 1000000;
  };
  const calculateRadiusInMeters = (circle: Circle): number => {
    const area = circle.clone().transform("EPSG:4326", "EPSG:54009");
    const radius = area.getRadius();

    return radius;
  };

  console.log();

  const { map } = useContext(BaseMap);

  const typeSelect = useRef<HTMLSelectElement>(null);
  const undoButton = useRef<HTMLInputElement>(null);
  const [radius, setRadius] = useState<number>(0);
  const source = new VectorSource({ wrapX: true });
  const [lineLength, setLineLength] = useState<number>(0);
  const [area, setArea] = useState<number>(0);
  const vectorLayer = new VectorLayer({ source });

  useLayer(vectorLayer, true);

  useEffect(() => {
    let draw: Draw;
    let lengthLabel: Text | undefined;
    let areaLabel: Text | undefined;
    let radiusLabel: Text | undefined;

    const addInteraction = (type: GeometryOptions) => {
      if (type !== "Disabled") {
        draw = new Draw({
          source: source,
          type: type as GeometryType,
          style: (feature) => {
            const geometry = feature.getGeometry();
            if (geometry instanceof LineString) {
              const lengthInKilometers = calculateLengthInKm(geometry);
              setLineLength(lengthInKilometers);
              lengthLabel = new Text({
                text: lengthInKilometers.toFixed(2) + " km",
                offsetY: -60,
                font: " 14px Ebrima",
                fill: new Fill({ color: "rgb(229,229,3)" }),
                stroke: new Stroke({ color: "rgb(47,54,54)", width: 4 }),
              });
              return new Style({
                stroke: new Stroke({
                  color: "rgb(241,241,3)",
                  width: 3,
                  lineDash: [5],
                }),
                text: lengthLabel,
              });
            }
            if (geometry instanceof Polygon) {
              const areaInSquareKilometers = calculateAreaInSquareKm(geometry);
              setArea(areaInSquareKilometers);
              areaLabel = new Text({
                text: areaInSquareKilometers.toFixed(2) + " km²",
                offsetY: -60,
                font: " 14px Ebrima",
                fill: new Fill({ color: "rgb(229,229,3)" }),
                stroke: new Stroke({ color: "rgb(23,25,25)", width: 4 }),
              });
              return new Style({
                stroke: new Stroke({
                  color: "rgb(23,25,25)",
                  width: 2,
                  lineDash: [5],
                }),
                fill: new Fill({
                  color: "rgb(192,192,0)",
                }),
                text: areaLabel,
              });
            }
            if (geometry instanceof Circle) {
              const circleArea = calculateAreaOfCircleInSquareKm(geometry);
              const circleRadius = calculateRadiusInMeters(geometry);
              setArea(circleArea);
              setRadius(circleRadius);
              areaLabel = new Text({
                text: circleArea.toFixed(2) + " km²",
                offsetY: -60,
                font: " 14px Ebrima",
                fill: new Fill({ color: "rgb(229,229,3)" }),
                stroke: new Stroke({ color: "rgb(73,67,59)", width: 4 }),
              });
              radiusLabel = new Text({
                text: "Radius: " + circleRadius.toFixed(2) + " meters",
                offsetY: -60,
                font: " 14px Ebrima",
                fill: new Fill({ color: "rgb(229,229,3)" }),
                stroke: new Stroke({ color: "rgb(73,67,59)", width: 4 }),
              });
              return new Style({
                stroke: new Stroke({
                  color: "rgb(196,196,30)",
                  width: 2,
                  lineDash: [5],
                }),
                fill: new Fill({
                  color: "rgb(192,192,0)",
                }),
                text: areaLabel && radiusLabel,
              });
            }
            if (geometry instanceof Point) {
              return new Style({
                image: new CircleStyle({
                  radius: 6,
                  fill: new Fill({ color: "rgba(255, 0, 0, 0.5)" }),
                  stroke: new Stroke({ color: "red", width: 2 }),
                }),
              });
            }
          },
        });
        // can test using draw.once
        draw.on("drawend", async (event: DrawEvent) => {
          saveDrawFeatures();
          const geometry = event.feature.getGeometry();
          console.log("Drawn geometry type:", geometry!.getType());
          if (geometry instanceof LineString && lengthLabel) {
            event.feature.setStyle([
              new Style({
                stroke: new Stroke({
                  color: "rgb(246,214,6)",
                  width: 2,
                  lineDash: [5],
                }),
                text: lengthLabel,
              }),
            ]);
          }
          if (
            (geometry instanceof Polygon && areaLabel) ||
            (geometry instanceof Circle && areaLabel)
          ) {
            event.feature.setStyle([
              new Style({
                stroke: new Stroke({
                  color: "rgb(192,192,0)",
                  width: 2,
                  lineDash: [5],
                }),
                text: areaLabel,
              }),
            ]);
          }
          if (geometry instanceof Point) {
            vectorLayer.setStyle([
              new Style({
                image: new CircleStyle({
                  radius: 20,
                  fill: new Fill({ color: "rgba(255, 0, 0, 0.78)" }),
                  stroke: new Stroke({
                    color: "rgb(192, 192, 0)",
                    width: 2,
                    lineDash: [5],
                  }),
                }),
              }),
              new Style({
                image: new Icon({
                  src: "./img.png",
                  scale: 1,
                }),
              }),
            ]);
          }

          const savedFeatures = JSON.parse(
            localStorage.getItem("drawnFeatures") || "[]",
          );
          const featureCoordinates = geometry;
          savedFeatures.push(featureCoordinates);
          localStorage.setItem("drawnFeatures", JSON.stringify(savedFeatures));
        });

        map.addInteraction(draw);
        function saveDrawFeatures(): void {
          const features = source.getFeatures();
          const featureArray: any[] = [];

          features.forEach((feature: any) => {
            const featureObj = feature.getProperties();
            featureArray.push(featureObj);
          });

          const geoJSONStr = JSON.stringify(featureArray);
          localStorage.setItem("drawnFeatures", geoJSONStr);
          console.log(featureArray);
        }
      }
    };

    if (typeSelect.current && undoButton.current) {
      typeSelect.current.onchange = () => {
        map.removeInteraction(draw);
        if (typeSelect.current) {
          addInteraction(typeSelect.current.value as GeometryOptions);
          // Save selected option to localStorage
          localStorage.setItem("selectedOption", typeSelect.current.value);
        }
      };
      undoButton.current.addEventListener("mouseup", () => {
        source.clear();
        localStorage.clear();
      });

      if (typeSelect.current) {
        addInteraction(typeSelect.current.value as GeometryOptions);
        const savedOption = localStorage.getItem("selectedOption");
        if (savedOption) {
          typeSelect.current.value = savedOption;
          addInteraction(savedOption as GeometryOptions);
        }
      }
    }
    return () => {
      map.removeInteraction(draw);
    };
  }, []);

  return (
    <span className="input-group">
      <label
        className="input-group-text"
        htmlFor="type"
        style={{
          justifyContent: "center",
        }}
      ></label>
      <select className="form-select" id="type" ref={typeSelect}>
        <option value="Disabled">Disabled</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="Circle">Circle</option>
        <option value="Point">Traffic Light</option>
      </select>

      <input
        className="form-control"
        type="button"
        value="Undo"
        id="undo"
        ref={undoButton}
        style={{
          fontSize: "smaller",
        }}
      />
      <p
        style={{
          fontSize: "12",
          backgroundColor: "rgba(0, 0, 0, 0.37)",
        }}
      >
        Distance: {lineLength && lineLength.toFixed(2)} km
        <br />
        Area:{area && area.toFixed(2)} km²
        <br />
        Radius: {radius && radius.toFixed(2)} m
      </p>
    </span>
  ); //
}

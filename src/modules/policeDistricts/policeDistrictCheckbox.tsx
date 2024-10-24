import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BaseMap, map } from "../../componentTools/BaseMap";
import { MapBrowserEvent, Overlay } from "ol";
import VectorSource from "ol/source/Vector";
import { useFeatures } from "../../componentTools/useFeatures";
import React from "react";
import {
  policeDistrictLayer,
  PoliceFeature,
  PoliceProps,
  SelectedPoliceStyle,
} from "./policeDistrictLayer";

export function PoliceDistrictCheckbox() {
  const { setFeatureLayers } = useContext(BaseMap);
  const [checked, setChecked] = useState(false);

  const overlay = useMemo(() => new Overlay({}), []);
  const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    overlay.setElement(overlayRef.current);
    map.addOverlay(overlay);
    return () => {
      map.removeOverlay(overlay);
    };
  }, [checked]);

  const [selectDistrict, setPoliceDistrict] = useState<
    PoliceFeature | undefined
  >();

  function districtClick(e: MapBrowserEvent<MouseEvent>) {
    const source =
      policeDistrictLayer.getSource() as VectorSource<PoliceFeature>;

    const clickedDistrict = source.getFeaturesAtCoordinate(
      e.coordinate,
    ) as PoliceFeature[];

    if (clickedDistrict.length === 1) {
      setPoliceDistrict(clickedDistrict[0]);
      overlay.setPosition(e.coordinate);
    } else {
      setPoliceDistrict(undefined);
      overlay.setPosition(undefined);
    }
  }

  useEffect(() => {
    if (checked) {
      setFeatureLayers((old) => [...old, policeDistrictLayer]);
      map.on("click", districtClick);
    }
    return () => {
      setFeatureLayers((old) => old.filter((l) => l !== policeDistrictLayer));
      map.un("click", districtClick);
      overlay.setPosition(undefined);
    };
  }, [checked]);

  const { activeFeatures, setActiveFeature } = useFeatures<PoliceFeature>(
    (l) => l.getClassName() === "cities",
  );
  useEffect(() => {
    activeFeatures?.setStyle(SelectedPoliceStyle);

    return () => activeFeatures?.setStyle(undefined);
  }, [activeFeatures]);

  return (
    <div onMouseLeave={() => setActiveFeature(undefined)}>
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
        Police
      </label>
      <div
        onMouseEnter={() => activeFeatures}
        ref={overlayRef}
        className="city-overlay"
      >
        {selectDistrict && (
          <p id="policeInfoOverlayer">
            {(selectDistrict.getProperties() as PoliceProps).politidist} <s />
            {
              <a
                href={(selectDistrict.getProperties() as PoliceProps).url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  id="politoetImg"
                  src={"./politiet.png"}
                  alt="Police Image"
                />
              </a>
            }
          </p>
        )}
      </div>
    </div>
  );
}

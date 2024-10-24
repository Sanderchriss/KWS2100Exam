import React, { useState, useEffect, useContext, useMemo } from "react";
import { BaseMap } from "../../componentTools/BaseMap";

export interface ClusterJson {
  properties: ClusterSearchProperties;
  geometry: {
    type: "Point";
    coordinates: number[];
  };
}
export interface ClusterSearchProperties {
  brannstasj: string;
}

export function SearchCluster() {
  const [value, setValue] = useState("");
  const [firestationNames, setFirestationNames] = useState<string[]>([]);
  const [firestations, setFirestations] = useState<ClusterJson[]>([]);

  const { map } = useContext(BaseMap);

  useEffect(() => {
    fetch("./BrannstasjonerPoint.json")
      .then((response) => response.json())
      .then((data) => {
        const names = data.features.map(
          (feature: any) => feature.properties.brannvesen,
        );
        console.log(names);
        setFirestations(data.features);
        setFirestationNames(names);
      });
  }, []);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const onSelect = (f: ClusterSearchProperties) => {
    const selectedFirestations = firestations.find(
      (s) => s.properties.brannstasj === f.brannstasj,
    );
    if (selectedFirestations) {
      setValue(selectedFirestations.properties.brannstasj);
      map.getView().animate({
        center: selectedFirestations.geometry.coordinates,
        zoom: 14,
      });
    }
  };

  return (
    <div className="stationdropdown">
      <input
        className={"stationSearchInput"}
        type="text"
        value={value}
        onChange={onChange}
      />

      {firestations
        .filter((s) => {
          const searchTerm = value.toLowerCase();
          const stationsAdress = s.properties.brannstasj.toLowerCase();
          return searchTerm && stationsAdress.startsWith(searchTerm);
        })
        .map((s, index) => (
          <div
            onClick={() => onSelect(s.properties)}
            className="dropdown-row"
            key={index}
            style={{
              cursor: "pointer",
              margin: "2px 0",
              color: "#bf00ff",
            }}
          >
            {s.properties.brannstasj}
          </div>
        ))}
    </div>
  );
}

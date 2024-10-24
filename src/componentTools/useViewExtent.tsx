import { useContext, useEffect } from "react";
import "./BaseMap";
import { BaseMap } from "./BaseMap";

export function useViewExtent() {
  const { map } = useContext(BaseMap);

  useEffect(() => {
    map.on("moveend", updateSessionStorage);
    setTimeout(updateSessionStorage, 20);

    return () => {
      map.un("movestart", updateSessionStorage);
      map.un("change", updateSessionStorage);
    };
  }, [map]);

  function updateSessionStorage() {
    // Get the current extent of the map view
    const extent = map.getView().calculateExtent(map.getSize());

    sessionStorage.setItem("mapViewExtent", JSON.stringify(extent));
  }

  useEffect(() => {
    map.getView().on("change", updateSessionStorage);

    // Update sessionStorage with the initial view extent after a delay
    setTimeout(updateSessionStorage, 1);

    // Cleanup: Remove the event listener
    return () => {
      console.log(map.getView().un("change", updateSessionStorage));
      map.getView().un("change", updateSessionStorage);
    };
  }, [map]); // useEffect runs when map changes

  // Return the current view extent (not sure if you still need this)
  console.log(
    "What is returned" + map.getView().calculateExtent(map.getSize()),
  );
  return map.getView().calculateExtent(map.getSize());
}

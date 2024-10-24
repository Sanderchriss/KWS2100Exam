import React, { useContext, useEffect, useState } from "react";
import { BaseMap } from "../../componentTools/BaseMap";
import { TunnelAside, TunnelLayer } from "./TunnelAside";

export function TunnelLayerCheckbox() {
  const { setFeatureLayers } = useContext(BaseMap);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) {
      setFeatureLayers((old) => {
        if (!old.includes(TunnelLayer)) {
          return [...old, TunnelLayer];
        } else {
          return old;
        }
      });
    } else {
      setFeatureLayers((old) => old.filter((l) => l !== TunnelLayer));
    }
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
          className="Checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Tunnels
      </label>
      {checked && <TunnelAside />}
    </div>
  );
}

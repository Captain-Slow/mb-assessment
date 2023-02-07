import React, { createContext, useContext, useMemo, useState } from "react";

interface GoogleMapContextProviderType {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  children?: React.ReactNode;
}

export const defaultValue: GoogleMapContextProviderType = {
  map: null,
  setMap: (map) => {},
};

export const GoogleMapContext = createContext(defaultValue);

export const useGoogleMap = () => {
  return useContext(GoogleMapContext);
};

export const GoogleMapContextProvider = ({
  children,
}: GoogleMapContextProviderType) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const context = useMemo(() => {
    return {
      map: map,
      setMap: (map_: google.maps.Map | null) => setMap(map_ ?? null),
    };
  }, [map]);

  return (
    <GoogleMapContext.Provider value={context}>
      {children}
    </GoogleMapContext.Provider>
  );
};

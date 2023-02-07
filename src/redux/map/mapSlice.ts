import { createSlice } from "@reduxjs/toolkit";

interface mapSliceInterface {
  coordinates: {
    latitude: GeolocationPosition["coords"]["latitude"];
    longitude: GeolocationPosition["coords"]["longitude"];
  };
  controls: {
    zoom: number;
  };
}

export const mapSlice = createSlice({
  name: "map",
  initialState: {
    coordinates: {
      latitude: 3.147369613878604,
      longitude: 101.69953519999997,
    },
    controls: {
      zoom: 13,
    },
  } as mapSliceInterface,
  reducers: {
    setMapCoordinates: (
      state,
      action: {
        payload: mapSliceInterface["coordinates"];
      }
    ) => {
      state.coordinates = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setMapCoordinates } = mapSlice.actions;

export default mapSlice.reducer;

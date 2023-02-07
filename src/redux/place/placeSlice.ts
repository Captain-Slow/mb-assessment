import { createSlice } from "@reduxjs/toolkit";
import { NORMALISED_PLACE_RESULT_DATA_TYPE } from "../../typescript/types/place";

interface placeSliceInterface {
  selectedPlaceId: string;
  selectedPlaceName: string;
  queryList: NORMALISED_PLACE_RESULT_DATA_TYPE;
}

export const placeSlice = createSlice({
  name: "place",
  initialState: {
    selectedPlaceId: "",
    selectedPlaceName: "",
    queryList: {},
  } as placeSliceInterface,
  reducers: {
    setSelectedPlaceId: (
      state,
      action: {
        payload: string;
      }
    ) => {
      state.selectedPlaceId = action.payload;
    },
    setSelectedPlaceName: (
      state,
      action: {
        payload: string;
      }
    ) => {
      state.selectedPlaceName = action.payload;
    },
    updateQueryList: (
      state,
      action: {
        payload: NORMALISED_PLACE_RESULT_DATA_TYPE;
      }
    ) => {
      state.queryList = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedPlaceId, setSelectedPlaceName, updateQueryList } =
  placeSlice.actions;

export default placeSlice.reducer;

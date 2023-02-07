import { configureStore } from "@reduxjs/toolkit";

import mapSlice from "./map/mapSlice";
import placeSlice from "./place/placeSlice";

export const reduxStore = configureStore({
  reducer: {
    map: mapSlice,
    place: placeSlice,
  },
  devTools: true,
});

export type REDUX_ROOT_STATE = ReturnType<typeof reduxStore.getState>;
export type APP_DISPATCH = typeof reduxStore.dispatch;

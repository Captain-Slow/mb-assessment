export interface PLACE_RESULT_DATA_TYPE {
  id: string;
  formatted_address: google.maps.places.PlaceResult["formatted_address"];
  lat: number;
  lng: number;
  name: string;
  photos?: {
    width: number;
    height: number;
    url: string;
  }[];
}

export interface NORMALISED_PLACE_RESULT_DATA_TYPE {
  [key: string]: PLACE_RESULT_DATA_TYPE;
}

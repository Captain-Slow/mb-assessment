import { v4 as uuidv4 } from "uuid";

import {
  NORMALISED_PLACE_RESULT_DATA_TYPE,
  PLACE_RESULT_DATA_TYPE,
} from "../typescript/types/place";
import { normaliseData } from "../utils/normalizr";

export async function placeQuery(
  map: google.maps.Map | null,
  place: string
): Promise<{
  places: NORMALISED_PLACE_RESULT_DATA_TYPE;
}> {
  try {
    if (!process.env.REACT_APP_GOOGLE_MAP_API_KEY || !map || !place) {
      throw "No api key or invalid";
    }

    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query: place,
      fields: ["name", "geometry", "formatted_address", "photos", "place_id"],
    };

    const service = new google.maps.places.PlacesService(map);

    try {
      const massageResult =
        await new Promise<NORMALISED_PLACE_RESULT_DATA_TYPE>(
          (resolve, reject) => {
            try {
              service.findPlaceFromQuery(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  const reworkList =
                    results && results.length > 0
                      ? results.map((item) => {
                          return {
                            id:
                              item && item.place_id ? item.place_id : uuidv4(),
                            formatted_address: item.formatted_address ?? null,
                            lat: item.geometry?.location?.lat() ?? null,
                            lng: item.geometry?.location?.lng() ?? null,
                            name: item && item.name ? item.name : "",
                            photos:
                              item.photos && item.photos.length > 0
                                ? item.photos
                                    .map((photo) => {
                                      return photo.width && photo.height
                                        ? {
                                            width: photo.width,
                                            height: photo.height,
                                            url: photo.getUrl(),
                                          }
                                        : null;
                                    })
                                    .filter((item) => item !== null)
                                : [],
                          } as PLACE_RESULT_DATA_TYPE;
                        })
                      : [];

                  const normaliseList: NORMALISED_PLACE_RESULT_DATA_TYPE =
                    reworkList && reworkList.length > 0
                      ? normaliseData(reworkList)
                      : {};

                  resolve(normaliseList);
                }

                resolve({});
              });
            } catch (err) {
              resolve({});
            }
          }
        );

      return {
        places: massageResult ?? {},
      };
    } catch (err) {
      throw err;
    }
  } catch (error) {
    return {
      places: {},
    };
  }
}

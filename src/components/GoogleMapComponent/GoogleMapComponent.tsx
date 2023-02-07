import { useRef, useEffect, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch, shallowEqual, batch } from "react-redux";

import { REDUX_ROOT_STATE } from "../../redux/store";
import { setMapCoordinates } from "../../redux/map/mapSlice";
import { useGoogleMap } from "../../hook/useGoogleMap";
import {
  setSelectedPlaceId,
  setSelectedPlaceName,
} from "../../redux/place/placeSlice";

export default function GoogleMapComponent() {
  const ref = useRef();
  const dispatch = useDispatch();

  const { map, setMap } = useGoogleMap();

  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  const controlledMapCoordinatesState = useSelector<
    REDUX_ROOT_STATE,
    REDUX_ROOT_STATE["map"]["coordinates"]
  >((state) => state.map.coordinates, shallowEqual);
  const mapControlsState = useSelector<
    REDUX_ROOT_STATE,
    REDUX_ROOT_STATE["map"]["controls"]
  >((state) => state.map.controls, shallowEqual);
  const selectedPlaceId = useSelector<
    REDUX_ROOT_STATE,
    REDUX_ROOT_STATE["place"]["selectedPlaceId"]
  >((state) => state.place.selectedPlaceId, shallowEqual);
  const selectedPlaceName = useSelector<
    REDUX_ROOT_STATE,
    REDUX_ROOT_STATE["place"]["selectedPlaceId"]
  >((state) => state.place.selectedPlaceName, shallowEqual);
  const queryList = useSelector<
    REDUX_ROOT_STATE,
    REDUX_ROOT_STATE["place"]["queryList"]
  >((state) => state.place.queryList, shallowEqual);

  const [currentLocation, setCurrentLocation] = useState<
    REDUX_ROOT_STATE["map"]["coordinates"] | null
  >(null);

  useEffect(() => {
    const init = async () => {
      if (ref.current && !map) {
        const center = {
          lat: controlledMapCoordinatesState.latitude,
          lng: controlledMapCoordinatesState.longitude,
        };

        const mapClass = new window.google.maps.Map(ref.current, {
          center,
          zoom: mapControlsState.zoom,
        });

        mapClass.setOptions({
          disableDefaultUI: true,
        });

        setMap(mapClass);
      }
    };

    init();
  }, [
    ref,
    map,
    controlledMapCoordinatesState.latitude,
    controlledMapCoordinatesState.longitude,
    mapControlsState.zoom,
  ]);

  useEffect(() => {
    if (map && selectedPlaceId && selectedPlaceId.replace(/\s/g, "") !== "") {
      const latLng = new google.maps.LatLng(
        controlledMapCoordinatesState.latitude,
        controlledMapCoordinatesState.longitude
      );

      map.panTo(latLng);

      let selectedPlaceId_ = selectedPlaceId;
      let selectedPlaceName_ = selectedPlaceName;

      if (
        !Object.keys(queryList).includes(selectedPlaceId) &&
        selectedPlaceName &&
        selectedPlaceName.replace(/\s/g, "") !== ""
      ) {
        const findSpecificPlaceId = Object.keys(queryList).find(
          (selectedPlaceId) => {
            const selectedPlace = queryList[selectedPlaceId];
            return selectedPlace
              ? selectedPlace.name === selectedPlaceName
              : false;
          }
        );

        if (findSpecificPlaceId && queryList[findSpecificPlaceId]) {
          selectedPlaceId_ = findSpecificPlaceId ?? "";
          selectedPlaceName_ = queryList[findSpecificPlaceId].name ?? "";

          batch(() => {
            dispatch(setSelectedPlaceId(selectedPlaceId_));
            dispatch(setSelectedPlaceName(selectedPlaceName_));
          });
        }
      }

      const selectedPlace = queryList[selectedPlaceId_];

      if (!marker || !infoWindow) {
        let newMarker_ = null;

        if (!marker) {
          newMarker_ = new google.maps.Marker({
            position: {
              lat: controlledMapCoordinatesState.latitude,
              lng: controlledMapCoordinatesState.longitude,
            },
            map: map,
            icon: "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",
          });

          setMarker(newMarker_);
        }

        if (!infoWindow && selectedPlace) {
          let newInfoWindow = new google.maps.InfoWindow({
            position: {
              lat: controlledMapCoordinatesState.latitude,
              lng: controlledMapCoordinatesState.longitude,
            },
            content: ReactDOMServer.renderToString(
              <InfoWindowContent
                title={selectedPlace.name}
                address={selectedPlace.formatted_address ?? null}
                photos={
                  selectedPlace.photos
                    ? selectedPlace.photos?.map((item) => item.url)
                    : []
                }
                coordinateTxt={
                  selectedPlace.lat && selectedPlace.lng
                    ? `(${selectedPlace.lat}, ${selectedPlace.lng})`
                    : null
                }
                coordinates={{
                  lat: selectedPlace.lat,
                  lng: selectedPlace.lng,
                }}
              />
            ),
          });

          setInfoWindow(newInfoWindow);

          if (newMarker_) {
            newInfoWindow.open({
              anchor: newMarker_,
              map,
            });
          }
        }
      }

      if (marker) {
        marker.setMap(null);

        marker.setOptions({
          position: {
            lat: controlledMapCoordinatesState.latitude,
            lng: controlledMapCoordinatesState.longitude,
          },
          map: map,
          icon: "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",
        });
      }

      if (infoWindow && selectedPlace) {
        infoWindow.setContent(
          ReactDOMServer.renderToString(
            <InfoWindowContent
              title={selectedPlace.name ?? null}
              address={selectedPlace.formatted_address ?? null}
              photos={
                selectedPlace.photos
                  ? selectedPlace.photos?.map((item) => item.url)
                  : []
              }
              coordinateTxt={
                selectedPlace.lat && selectedPlace.lng
                  ? `(${selectedPlace.lat}, ${selectedPlace.lng})`
                  : null
              }
              coordinates={{
                lat: selectedPlace.lat,
                lng: selectedPlace.lng,
              }}
            />
          )
        );

        if (marker) {
          infoWindow.open(map, marker);
        }
      }
    }
  }, [
    map,
    controlledMapCoordinatesState.latitude,
    controlledMapCoordinatesState.longitude,
    selectedPlaceId,
    marker,
    infoWindow,
  ]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      if (map && navigator.geolocation && !currentLocation) {
        const permissionPromise = await navigator.permissions.query({
          name: "geolocation",
        });

        switch (permissionPromise.state) {
          case "granted":
          case "prompt":
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setCurrentLocation({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                });
                dispatch(
                  setMapCoordinates({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                  })
                );
              },
              (err) => {}
            );
            break;
          case "denied":
            setCurrentLocation({
              latitude: 0,
              longitude: 0,
            });
            break;
        }
      }
    };

    getCurrentLocation();
  }, [map, currentLocation]);

  const MapComp = useMemo(() => {
    return <Box sx={{ width: "100vw", height: "100vh" }} ref={ref} id="map" />;
  }, []);

  return MapComp;
}

function InfoWindowContent(props: {
  title?: string | null;
  address?: string | null;
  coordinateTxt?: string | null;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  photos?: string[];
}) {
  const {
    title = null,
    address = null,
    coordinateTxt = null,
    coordinates = null,
    photos = [],
  } = props;

  const theme = useTheme();

  return (
    <div
      style={{
        padding: `${theme.spacing(1.25)} ${theme.spacing(2)}`,
        maxWidth: 330,
        width: 330,
      }}
    >
      {title && (
        <p
          style={{
            fontSize: theme.typography.h6.fontSize,
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {title}
        </p>
      )}
      {address && (
        <p
          style={{
            fontSize: theme.typography.body2.fontSize,
            paddingTop: theme.spacing(2),
            margin: 0,
          }}
        >
          {address}
        </p>
      )}
      {coordinateTxt && (
        <p
          style={{
            fontSize: theme.typography.body2.fontSize,
            paddingTop: theme.spacing(2),
            margin: 0,
          }}
        >
          {coordinateTxt}
        </p>
      )}
      {coordinates && (
        <div
          style={{
            paddingTop: theme.spacing(2),
          }}
        >
          <a
            style={{
              fontSize: theme.typography.body2.fontSize,
              outline: "none",
            }}
            href={`http://www.google.com/maps/place/${coordinates.lat},${coordinates.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            {`Open in Google Maps`}
          </a>
        </div>
      )}
      {photos && photos.length > 0 ? (
        <div
          style={{
            paddingTop: theme.spacing(2),
            maxWidth: 330,
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexFlow: "row wrap",
              marginTop: "-16px",
              width: "calc(100% + 16px)",
              marginLeft: "-16px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {photos.map((photo, index) => {
              return (
                <div
                  key={index}
                  style={{
                    flexBasis: 150,
                    minWidth: 150,
                    paddingLeft: theme.spacing(2),
                    paddingTop: theme.spacing(2),
                    outline: "none",
                  }}
                >
                  <a
                    href={photo}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      outline: "none",
                    }}
                  >
                    <img
                      style={{
                        width: 150,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: theme.spacing(2),
                        overflow: "hidden",
                        outline: "none",
                      }}
                      src={photo}
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

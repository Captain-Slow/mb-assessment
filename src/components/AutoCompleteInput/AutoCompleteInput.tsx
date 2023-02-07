import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import _ from "lodash";
import { useSelector, useDispatch, shallowEqual, batch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { placeQuery } from "../../api/places";
import { useGoogleMap } from "../../hook/useGoogleMap";
import { REDUX_ROOT_STATE } from "../../redux/store";
import {
  setSelectedPlaceId,
  setSelectedPlaceName,
  updateQueryList,
} from "../../redux/place/placeSlice";
import { setMapCoordinates } from "../../redux/map/mapSlice";

export default function AutoCompleteInput() {
  const dispatch = useDispatch();
  const { map } = useGoogleMap();

  const placeState = useSelector<REDUX_ROOT_STATE, REDUX_ROOT_STATE["place"]>(
    (state) => state.place,
    shallowEqual
  );

  const { selectedPlaceName, queryList } = placeState;

  const [inputValue, setInputValue] = useState<string>("");

  const valueSelectedCallback = useCallback(
    async (
      event: React.SyntheticEvent<Element, Event>,
      newValue: string | null
    ) => {
      if (newValue) {
        const findSpecificPlaceId = Object.keys(queryList).find((placeId) => {
          const selectedPlace = queryList[placeId];
          return selectedPlace ? selectedPlace.name === newValue : false;
        });

        const getSpecificPlace = findSpecificPlaceId
          ? queryList[findSpecificPlaceId]
          : null;

        if (getSpecificPlace) {
          batch(() => {
            dispatch(setSelectedPlaceId(findSpecificPlaceId ?? ""));

            dispatch(setSelectedPlaceName(newValue ?? ""));

            dispatch(
              setMapCoordinates({
                latitude: getSpecificPlace.lat,
                longitude: getSpecificPlace.lng,
              })
            );
          });
        }
      }
    },
    [queryList]
  );

  const inputOnChange = useCallback(
    async (
      event: React.SyntheticEvent<Element, Event>,
      newInputValue: string
    ) => {
      setInputValue(newInputValue);
    },
    [map]
  );

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (inputValue && inputValue.replace(/\s/g, "") !== "") {
        const placeQueryResponse = await placeQuery(map, inputValue);

        dispatch(updateQueryList(placeQueryResponse.places));
      }
    }, 1000);

    return () => clearTimeout(delay);
  }, [inputValue]);

  return (
    <Autocomplete
      value={
        selectedPlaceName && selectedPlaceName.replace(/\s/g, "") !== ""
          ? selectedPlaceName
          : ""
      }
      freeSolo
      disableClearable
      options={
        Object.keys(queryList).length > 0
          ? Object.keys(queryList).map((placeId) => {
              return queryList[placeId].name;
            })
          : ["e.g. Kuala Lumpur"]
      }
      getOptionLabel={(option) => {
        return `${option}${inputValue ? ` --- ${inputValue}` : ""}`;
      }}
      getOptionDisabled={(option) => option === "e.g. Kuala Lumpur"}
      onChange={valueSelectedCallback}
      inputValue={inputValue}
      onInputChange={inputOnChange}
      fullWidth
      componentsProps={{
        paper: {
          sx: {
            borderRadius: 0,
            borderBottomLeftRadius: (theme) => theme.spacing(1),
            borderBottomRightRadius: (theme) => theme.spacing(1),
          },
        },
      }}
      renderOption={(prop, option) => {
        const findSpecificPlaceId = Object.keys(queryList).find((placeId) => {
          const selectedPlace = queryList[placeId];

          return selectedPlace ? selectedPlace.name === option : false;
        });

        const findSpecificPlace = findSpecificPlaceId
          ? queryList[findSpecificPlaceId]
          : null;

        const instructionOption = option === "e.g. Kuala Lumpur";

        return (
          <Box
            {...prop}
            key={uuidv4()}
            component="span"
            sx={{
              width: "100%",
              px: 2,
              py: 1.25,
              textAlign: "left",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {findSpecificPlace &&
              findSpecificPlace.photos &&
              findSpecificPlace.photos[0] ? (
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: (theme) => theme.spacing(1),
                    overflow: "hidden",
                    minWidth: 50,
                  }}
                  component="img"
                  src={findSpecificPlace.photos[0].url}
                />
              ) : !instructionOption ? (
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: (theme) => theme.palette.divider,
                    borderRadius: (theme) => theme.spacing(1),
                    overflow: "hidden",
                    minWidth: 50,
                    display: "flex",
                    justifyContent: "center",
                    alignitems: "center",
                  }}
                ></Box>
              ) : null}
              <Box>
                <Typography variant="body1" textAlign="left">
                  {option}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => {
        const { InputLabelProps, InputProps, ...others } = params;

        return (
          <StyledInputContainer>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                position: "relative",
              }}
            >
              <StyledTextField
                {...others}
                inputProps={{
                  ...others.inputProps,
                  value:
                    others.inputProps.value &&
                    typeof others.inputProps.value === "string" &&
                    others.inputProps.value.split("---").length > 1
                      ? `${others.inputProps.value.split("---")[0]}`
                      : others.inputProps.value,
                }}
                {...InputProps}
                placeholder="Search Google Map"
                type="search"
                fullWidth
              />
              <Box
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                  display: "flex",
                  py: 1,
                  px: 1.5,
                  position: "absolute",
                  right: 0,
                }}
              >
                <SearchIcon />
              </Box>
            </Stack>
          </StyledInputContainer>
        );
      }}
      noOptionsText={"No result found"}
      sx={{
        "&.Mui-focused": {
          "& .MuiBox-root": {
            borderRadius: 0,
            borderTopLeftRadius: (theme) => theme.spacing(1),
            borderTopRightRadius: (theme) => theme.spacing(1),
          },
        },
      }}
    />
  );
}

const StyledInputContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderColor: "transparent",
  border: 0,
  overflow: "hidden",
  boxShadow: theme.shadows[2],
  borderRadius: theme.spacing(1),
}));

const StyledTextField = styled(InputBase)(({ theme }) => ({
  padding: `${theme.spacing(1.25)} ${theme.spacing(2)}`,
  paddingRight: theme.spacing(6),
}));

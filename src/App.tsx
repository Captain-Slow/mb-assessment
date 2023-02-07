import { useMemo, ReactElement } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import Box from "@mui/material/Box";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

import { defaultTheme } from "./themes/default";
import { reduxStore } from "./redux/store";
import { AutoCompleteInput, GoogleMapComponent } from "./components";
import { GoogleMapContextProvider, defaultValue } from "./hook/useGoogleMap";

function App() {
  const theme = useMemo(() => defaultTheme, []);

  const AutoCompleteInputComp = useMemo(() => {
    return (
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          px: 3,
          py: 4,
          width: "100%",
          maxWidth: 450,
          m: "0 auto",
        }}
      >
        <AutoCompleteInput />
      </Box>
    );
  }, []);

  const GoogleMapComp = useMemo(() => {
    return (
      <Box
        sx={{
          position: "absolute",
          zIndex: 1,
        }}
      >
        <GoogleMapComponent />
      </Box>
    );
  }, []);

  return (
    <Provider store={reduxStore}>
      <ThemeProvider theme={theme}>
        <GoogleMapContextProvider
          map={defaultValue.map}
          setMap={defaultValue.setMap}
        >
          {process.env.REACT_APP_GOOGLE_MAP_API_KEY ? (
            <Wrapper
              apiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
              render={(status: Status): ReactElement => {
                if (status === Status.LOADING) return <h3>{status} ..</h3>;
                if (status === Status.FAILURE) return <h3>{status} ...</h3>;
                return <Box />;
              }}
              libraries={["places"]}
            >
              <div className="App">
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {GoogleMapComp}
                  {AutoCompleteInputComp}
                </Box>
              </div>
            </Wrapper>
          ) : null}
        </GoogleMapContextProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

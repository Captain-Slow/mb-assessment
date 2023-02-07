import { ThemeOptions, createTheme } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#09091a",
    },
    secondary: {
      main: "#222233",
    },
    text: {
      primary: "#3D3D3D",
      secondary: "#696969",
      disabled: "#d2d2d2",
    },
  },
};

export const defaultTheme = createTheme(themeOptions);

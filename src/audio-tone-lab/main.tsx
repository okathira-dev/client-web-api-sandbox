import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installQuietEmscriptenGlobals } from "./domain/modems/backends/quiet/emscriptenGlobals";

installQuietEmscriptenGlobals();

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0057d8" },
    secondary: { main: "#5f6368" },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);

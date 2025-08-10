import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a73e8" },
    secondary: { main: "#5f6368" },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);

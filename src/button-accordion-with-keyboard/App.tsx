import Typography from "@mui/material/Typography";

import { AudioInitializer } from "./features/AudioInitializer";
import { RightHandAccordion } from "./features/RightHandAccordion";

export function App() {
  return (
    <AudioInitializer>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h1"
          sx={{
            textAlign: "center",
            margin: "1rem",
            fontSize: "1.8rem",
          }}
        >
          キーボードで演奏できるクロマティックボタンアコーディオン
        </Typography>
        <RightHandAccordion />
      </div>
    </AudioInitializer>
  );
}

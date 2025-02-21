import { Container } from "@mui/material";
import Typography from "@mui/material/Typography";

import { useAccordionDisplayModeValue } from "./atoms/accordionDisplay";
import { AccordionDisplaySwitch } from "./features/AccordionDisplaySwitch";
import { AudioInitializer } from "./features/AudioInitializer";
import { LatencyDisplay } from "./features/LatencyDisplay";
import { LeftHandAccordion } from "./features/LeftHandAccordion";
import { RightHandAccordion } from "./features/RightHandAccordion";

export function App() {
  const displayMode = useAccordionDisplayModeValue();

  return (
    <AudioInitializer>
      <Container
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            margin: "1rem",
            fontSize: "1.8rem",
          }}
        >
          キーボードで演奏できるクロマティックボタンアコーディオン
        </Typography>
        <LatencyDisplay />
        <AccordionDisplaySwitch />
        {displayMode === "left" ? (
          <LeftHandAccordion />
        ) : (
          <RightHandAccordion />
        )}
      </Container>
    </AudioInitializer>
  );
}

import { Container } from "@mui/material";
import Typography from "@mui/material/Typography";

import { useAccordionDisplayModeValue } from "./atoms/accordionDisplay";
import { AccordionDisplaySwitch } from "./features/AccordionDisplaySwitch";
import { AudioDeviceSelector } from "./features/AudioDeviceSelector";
import { AudioInitializer } from "./features/AudioInitializer";
import { LatencyDisplay } from "./features/LatencyDisplay";
import { LeftHandAccordion } from "./features/LeftHandAccordion";
import { RightHandAccordion } from "./features/RightHandAccordion";
import { SocialIcons } from "../shared/components/SocialIcons";

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
          position: "relative",
        }}
      >
        <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/button-accordion-with-keyboard" />
        <Typography
          variant="h1"
          sx={{
            margin: "1rem",
            fontSize: "1.8rem",
          }}
        >
          キーボードで演奏できるクロマティックボタンアコーディオン
        </Typography>
        <AudioDeviceSelector />
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

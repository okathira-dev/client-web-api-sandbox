import { Container, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useAccordionDisplayModeValue } from "./atoms/accordionDisplay";
import "./i18n";
import { AccordionDisplaySwitch } from "./features/AccordionDisplaySwitch";
import { AudioDeviceSelector } from "./features/AudioDeviceSelector";
import { AudioInitializer } from "./features/AudioInitializer";
import { LatencyDisplay } from "./features/LatencyDisplay";
import { LeftHandAccordion } from "./features/LeftHandAccordion";
import { RightHandAccordion } from "./features/RightHandAccordion";
import { SocialIcons } from "../shared/components/SocialIcons";

export function App() {
  const { t, i18n } = useTranslation();
  const displayMode = useAccordionDisplayModeValue();

  const handleLanguageChange = (
    _: React.MouseEvent<HTMLElement>,
    newLang: string,
  ) => {
    if (newLang) {
      void i18n.changeLanguage(newLang);
    }
  };

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
        <Container
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            mb: 2,
          }}
        >
          <ToggleButtonGroup
            value={i18n.language}
            exclusive
            onChange={handleLanguageChange}
            aria-label="language selection"
          >
            <ToggleButton value="ja" aria-label="japanese">
              日本語
            </ToggleButton>
            <ToggleButton value="en" aria-label="english">
              English
            </ToggleButton>
          </ToggleButtonGroup>
        </Container>
        <Typography variant="h1" sx={{ margin: "1rem", fontSize: "1.8rem" }}>
          {t("accordion.title")}
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

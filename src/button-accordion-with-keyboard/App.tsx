import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  ButtonGroup,
} from "@mui/material";

import {
  useAccordionModeValue,
  useSetAccordionMode,
} from "./atoms/accordionMode";
import { KeyboardDevices } from "./features/KeyboardDevices";
import { LeftHandAccordion } from "./features/LeftHandAccordion";
import { RightHandAccordion } from "./features/RightHandAccordion";

import type { SxProps } from "@mui/material";

const accordionWrapperStyle: SxProps = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
};

export const App = () => {
  const accordionMode = useAccordionModeValue();
  const setAccordionMode = useSetAccordionMode();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        キーボードで演奏できるクロマティックボタンアコーディオン
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <KeyboardDevices />
        </Paper>
      </Box>

      {accordionMode !== "dual" && (
        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <ButtonGroup>
            <Button
              variant={accordionMode === "left" ? "contained" : "outlined"}
              onClick={() => setAccordionMode("left")}
            >
              左手（伴奏）
            </Button>
            <Button
              variant={accordionMode === "right" ? "contained" : "outlined"}
              onClick={() => setAccordionMode("right")}
            >
              右手（メロディー）
            </Button>
          </ButtonGroup>
        </Box>
      )}

      {accordionMode === "dual" ? (
        <>
          <Box>
            <Typography variant="h5" gutterBottom>
              右手（メロディー）
            </Typography>
            <Box sx={accordionWrapperStyle}>
              <RightHandAccordion />
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              左手（伴奏）
            </Typography>
            <Box sx={accordionWrapperStyle}>
              <LeftHandAccordion />
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={accordionWrapperStyle}>
          {accordionMode === "left" ? (
            <LeftHandAccordion />
          ) : (
            <RightHandAccordion />
          )}
        </Box>
      )}
    </Container>
  );
};

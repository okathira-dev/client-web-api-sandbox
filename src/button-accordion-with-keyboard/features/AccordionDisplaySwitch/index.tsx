import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

import { useAccordionDisplayMode } from "../../atoms/accordionDisplay";

import type { AccordionDisplayMode } from "../../atoms/accordionDisplay";
import type { FC, MouseEvent } from "react";

export const AccordionDisplaySwitch: FC = () => {
  const [displayMode, setDisplayMode] = useAccordionDisplayMode();

  const handleDisplayModeChange = (
    _event: MouseEvent<HTMLElement>,
    newDisplayMode: AccordionDisplayMode | null,
  ) => {
    if (newDisplayMode === null) return;
    setDisplayMode(newDisplayMode);
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={displayMode}
      exclusive
      onChange={handleDisplayModeChange}
      aria-label="アコーディオンの表示切り替え"
    >
      <ToggleButton value="left">
        <Typography>左手（伴奏）</Typography>
      </ToggleButton>
      <ToggleButton value="right">
        <Typography>右手（メロディー）</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

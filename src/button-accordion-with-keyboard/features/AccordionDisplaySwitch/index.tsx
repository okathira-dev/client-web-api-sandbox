import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { FC, MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { AccordionDisplayMode } from "../../atoms/accordionDisplay";
import { useAccordionDisplayMode } from "../../atoms/accordionDisplay";

export const AccordionDisplaySwitch: FC = () => {
  const { t } = useTranslation();
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
      aria-label={t("accordion.display.label")}
    >
      <ToggleButton value="left">
        <Typography>{t("accordion.display.left")}</Typography>
      </ToggleButton>
      <ToggleButton value="right">
        <Typography>{t("accordion.display.right")}</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

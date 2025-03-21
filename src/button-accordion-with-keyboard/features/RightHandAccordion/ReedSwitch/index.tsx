import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useReedActivation, useSetReedActivation } from "../atoms/reeds";
import { REED_LABEL_MAP } from "../consts";

import type { ReedName } from "../consts";
import type { FC, MouseEvent } from "react";

export const ReedSwitch: FC = () => {
  const { t } = useTranslation();
  const reedActivation = useReedActivation();
  const setReedActivation = useSetReedActivation();

  const handleReedChange = (
    _event: MouseEvent<HTMLElement>,
    newReedActivation: ReedName[],
  ) => {
    setReedActivation((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((reed) => {
        next[reed as ReedName] = newReedActivation.includes(reed as ReedName);
      });
      return next;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <Typography sx={{ flexShrink: 0 }}>
        {t("accordion.reeds.toggle")}
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={Object.entries(reedActivation)
          .filter(([_reed, isActive]) => isActive)
          .map(([reed]) => reed)}
        onChange={handleReedChange}
      >
        {(Object.keys(reedActivation) as ReedName[]).map((reed) => (
          <ToggleButton key={reed} value={reed}>
            <Typography>{REED_LABEL_MAP[reed]}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import { useReedActivation, useSetReedActivation } from "../atoms/reeds";
import { REED_LABEL_MAP } from "../consts";

import type { ReedName } from "../consts";
import type { FC, MouseEvent } from "react";

export const ReedSwitch: FC = () => {
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
      <Typography sx={{ flexShrink: 0 }}>各リードのオンオフ</Typography>
      <ToggleButtonGroup
        color="primary"
        value={Object.entries(reedActivation)
          .filter(([_reed, isActive]) => isActive)
          .map(([reed]) => reed)}
        onChange={handleReedChange}
      >
        {Object.entries(REED_LABEL_MAP).map(([reed, label]) => (
          <ToggleButton key={reed} value={reed}>
            <Typography>{label}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
};

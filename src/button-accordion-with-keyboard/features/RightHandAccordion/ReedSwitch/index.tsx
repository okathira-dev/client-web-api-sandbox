import { FC, MouseEvent } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useReedActivation, useSetReedActivation } from "../atoms/reeds";
import { ReedName } from "../consts";

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
    <ToggleButtonGroup
      color="primary"
      value={Object.entries(reedActivation)
        .filter(([_reed, isActive]) => isActive)
        .map(([reed]) => reed)}
      onChange={handleReedChange}
      aria-label="reed activation"
    >
      <ToggleButton value="LOW" aria-label="low reed">
        <Typography>L1</Typography>
      </ToggleButton>
      <ToggleButton value="MID_1" aria-label="mid1 reed">
        <Typography>M1</Typography>
      </ToggleButton>
      <ToggleButton value="MID_2" aria-label="mid2 reed">
        <Typography>M2</Typography>
      </ToggleButton>
      <ToggleButton value="MID_3" aria-label="mid3 reed">
        <Typography>M3</Typography>
      </ToggleButton>
      <ToggleButton value="HIGH" aria-label="high reed">
        <Typography>H1</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
